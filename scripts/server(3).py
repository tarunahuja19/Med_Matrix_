"""
server.py — Standalone MRI K-Space Inference API
=================================================
Self-contained Flask server that:
  1. Defines the full MultimodalMRI Flax model architecture
  2. Loads trained weights from best_mri_model (2).msgpack
  3. Exposes a POST /predict endpoint
  4. Tunnels via ngrok for public access

Usage:
    pip install flask flask-cors pyngrok jax jaxlib flax numpy
    python server.py --ngrok_token YOUR_NGROK_AUTH_TOKEN

Endpoint:
    POST /predict
        Body: multipart/form-data  field "file" = .npy (complex64, shape (N,64,64) or (64,64))
        Returns: JSON with predicted class probabilities and labels
"""

import os, sys, argparse, io, traceback, json
import numpy as np

# ── JAX / Flax ──────────────────────────────────────────────────────────
os.environ["XLA_PYTHON_CLIENT_PREALLOCATE"] = "false"
import jax
import jax.numpy as jnp
import flax.linen as nn
import flax.serialization
from flax.serialization import msgpack_restore

# ── Flask ───────────────────────────────────────────────────────────────
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

# =====================================================================
# CONFIG
# =====================================================================
class C:
    """Architecture hyper-parameters — must match training exactly."""
    D, H, W    = 8, 8, 64
    total_rows  = D * H          # 64
    d_model     = 160
    d_state     = 32
    n_ssm       = 4
    conv_ch     = (32, 64, 128)
    n_heads     = 8
    ffn_dim     = 512
    drop        = 0.15

LABELS = {0: "Healthy", 1: "Microbleed", 2: "WML", 3: "AMI"}
N_CLASSES = 4

# =====================================================================
# MODEL DEFINITION  (exact replica from training)
# =====================================================================

class ConvBlock3D(nn.Module):
    ch: int
    @nn.compact
    def __call__(self, x, train):
        x = nn.Conv(self.ch, (3,3,3), strides=(2,2,2), padding="SAME")(x)
        x = nn.BatchNorm(use_running_average=not train)(x)
        return nn.leaky_relu(x, 0.2)


class MultiHeadAttn(nn.Module):
    dm: int; nh: int
    @nn.compact
    def __call__(self, q, kv, train):
        dh = self.dm // self.nh; B = q.shape[0]
        Q = nn.Dense(self.dm)(q).reshape(B,-1,self.nh,dh).transpose(0,2,1,3)
        K = nn.Dense(self.dm)(kv).reshape(B,-1,self.nh,dh).transpose(0,2,1,3)
        V = nn.Dense(self.dm)(kv).reshape(B,-1,self.nh,dh).transpose(0,2,1,3)
        w = jnp.matmul(Q, K.transpose(0,1,3,2)) / jnp.sqrt(float(dh))
        w = jax.nn.softmax(w, axis=-1)
        w = nn.Dropout(C.drop, deterministic=not train)(w)
        o = jnp.matmul(w,V).transpose(0,2,1,3).reshape(B,-1,self.dm)
        return nn.Dense(self.dm)(o)


class ComplexSSM(nn.Module):
    dm: int; ns: int
    @nn.compact
    def __call__(self, x):
        B, L, D = x.shape; N = self.ns
        log_Ar = self.param("log_Ar", nn.initializers.uniform(.5), (D,N))
        Ai     = self.param("Ai",     nn.initializers.normal(.1),  (D,N))
        A = -jnp.exp(log_Ar) + 1j*Ai
        Bp = nn.Dense(2*N)(x); Br, Bi = jnp.split(Bp, 2, -1)
        B_t = Br + 1j*Bi
        Cp = nn.Dense(2*N)(x); Cr, Ci = jnp.split(Cp, 2, -1)
        C_t = Cr + 1j*Ci
        Dskip = self.param("Dskip", nn.initializers.ones, (D,))
        def step(h, inp):
            xt, bt, ct = inp
            xc = xt.astype(jnp.complex64)
            h = A[None]*h + bt[:,None,:]*xc[:,:,None]
            y = jnp.sum(ct[:,None,:]*h, axis=-1).real
            return h, y + Dskip*xt
        xs = (x.transpose(1,0,2), B_t.transpose(1,0,2), C_t.transpose(1,0,2))
        h0 = jnp.zeros((B, D, N), jnp.complex64)
        _, ys = jax.lax.scan(step, h0, xs)
        return ys.transpose(1,0,2)


class SSMBlock(nn.Module):
    dm: int; ns: int
    @nn.compact
    def __call__(self, x, train):
        r = x; x = nn.LayerNorm()(x)
        x = ComplexSSM(self.dm, self.ns)(x)
        x = nn.Dropout(C.drop, deterministic=not train)(x)
        return x + r


class IFFTCNNBranch(nn.Module):
    @nn.compact
    def __call__(self, kspace_raw, train):
        B = kspace_raw.shape[0]
        x  = kspace_raw.reshape(B, C.D, C.H, C.W, 2)
        xc = x[...,0] + 1j*x[...,1]
        img = jnp.fft.ifftshift(xc, axes=(-2,-1))
        img = jnp.fft.ifft2(img, axes=(-2,-1))
        img = jnp.abs(img)[..., None]
        for ch in C.conv_ch:
            img = ConvBlock3D(ch)(img, train)
        feat = img.reshape(B, -1, C.conv_ch[-1])
        feat = feat + MultiHeadAttn(C.conv_ch[-1], C.n_heads)(feat, feat, train)
        feat = nn.LayerNorm()(feat)
        p = feat.mean(axis=1)
        p = nn.Dropout(C.drop, deterministic=not train)(p)
        return nn.Dense(C.d_model)(p)


class KSSMBranch(nn.Module):
    @nn.compact
    def __call__(self, kspace_norm, train):
        B = kspace_norm.shape[0]
        x = kspace_norm.reshape(B, C.total_rows, C.W * 2)
        x = nn.Dense(C.d_model)(x)
        x = nn.Dropout(C.drop, deterministic=not train)(x)
        for _ in range(C.n_ssm):
            x = SSMBlock(C.d_model, C.d_state)(x, train)
        return x


class CrossFusion(nn.Module):
    @nn.compact
    def __call__(self, p_cnn, ssm_seq, train):
        q   = p_cnn[:, None, :]
        out = MultiHeadAttn(C.d_model, C.n_heads)(q, ssm_seq, train)
        out = out.squeeze(1) + p_cnn
        out = nn.LayerNorm()(out)
        r = out
        out = nn.Dense(C.ffn_dim)(out)
        out = nn.relu(out)
        out = nn.Dropout(C.drop, deterministic=not train)(out)
        out = nn.Dense(C.d_model)(out)
        return nn.LayerNorm()(out + r)


class DiagnosisHead(nn.Module):
    @nn.compact
    def __call__(self, x, train):
        x = nn.Dense(C.d_model)(x)
        x = nn.leaky_relu(x, .2)
        x = nn.Dropout(C.drop, deterministic=not train)(x)
        return nn.Dense(4)(x)


class MultimodalMRI(nn.Module):
    @nn.compact
    def __call__(self, x_raw, x_norm, train=True):
        p_cnn   = IFFTCNNBranch()(x_raw, train)
        ssm_seq = KSSMBranch()(x_norm, train)
        fused   = CrossFusion()(p_cnn, ssm_seq, train)
        return DiagnosisHead()(fused, train)


# =====================================================================
# PREPROCESSING  (self-contained, no imports from other files)
# =====================================================================

def complex_to_real_imag(X_complex: np.ndarray) -> np.ndarray:
    """(N, 64, 64) complex → (N, 64, 64, 2) float32  [real, imag]."""
    return np.stack([X_complex.real, X_complex.imag], axis=-1).astype(np.float32)


def normalize_kspace(X: np.ndarray) -> np.ndarray:
    """Log-magnitude normalize preserving phase. X: [N, 64, 64, 2]."""
    mag = np.sqrt(X[..., 0]**2 + X[..., 1]**2 + 1e-9)
    ph  = np.arctan2(X[..., 1], X[..., 0])
    lm  = np.log1p(mag)
    scale = lm.reshape(len(lm), -1).max(axis=1, keepdims=True)[:, None, :]
    lm  = lm / (scale + 1e-9)
    out = np.empty_like(X)
    out[..., 0] = lm * np.cos(ph)
    out[..., 1] = lm * np.sin(ph)
    return out


# =====================================================================
# MODEL LOADING
# =====================================================================

def load_model(model_path: str):
    """
    Load params + batch_stats from the saved TrainState msgpack.
    Returns (model, params, batch_stats).
    """
    print(f"[server] Loading model from: {model_path}")
    model = MultimodalMRI()
    rng   = jax.random.PRNGKey(0)
    dummy = jnp.ones((1, C.total_rows, C.W, 2))

    # Init to get correct pytree shapes
    variables = model.init({"params": rng, "dropout": rng},
                           dummy, dummy, train=False)

    with open(model_path, "rb") as f:
        state_dict = msgpack_restore(f.read())

    params = flax.serialization.from_state_dict(
        variables["params"], state_dict["params"])
    batch_stats = flax.serialization.from_state_dict(
        variables.get("batch_stats", {}),
        state_dict.get("batch_stats", {}))

    n_params = sum(p.size for p in jax.tree_util.tree_leaves(params))
    print(f"[server] Loaded OK — {n_params:,} parameters")
    return model, params, batch_stats


# =====================================================================
# INFERENCE
# =====================================================================

_apply_fn = None  # will hold the JIT-compiled function

def build_predict_fn(model, params, batch_stats):
    """Build a JIT-compiled prediction function (called once at startup)."""
    global _apply_fn

    @jax.jit
    def _predict(x_raw, x_norm):
        logits = model.apply(
            {"params": params, "batch_stats": batch_stats},
            x_raw, x_norm, train=False)
        return jax.nn.softmax(logits, axis=-1)

    _apply_fn = _predict

    # Warm up JIT with a dummy forward pass
    print("[server] Warming up JIT …")
    dummy = jnp.ones((1, C.total_rows, C.W, 2))
    _ = _apply_fn(dummy, dummy).block_until_ready()
    print("[server] JIT warm-up complete ✓")


def predict(X_complex: np.ndarray) -> dict:
    """
    Run inference on complex k-space data.

    Parameters
    ----------
    X_complex : np.ndarray, complex64, shape (N, 64, 64) or (64, 64)

    Returns
    -------
    dict with 'predictions' list of {class, probability} dicts
    """
    # Handle single sample
    if X_complex.ndim == 2:
        X_complex = X_complex[np.newaxis, ...]

    # Preprocess
    X_raw  = complex_to_real_imag(X_complex)     # (N, 64, 64, 2)
    X_norm = normalize_kspace(X_raw)             # (N, 64, 64, 2)

    # Run batched inference
    batch_size = 32
    all_probs = []
    for i in range(0, len(X_raw), batch_size):
        xr = jnp.array(X_raw[i:i+batch_size])
        xn = jnp.array(X_norm[i:i+batch_size])
        probs = np.array(_apply_fn(xr, xn))
        all_probs.append(probs)
    probs = np.concatenate(all_probs, axis=0)

    # Format response
    results = []
    for i in range(len(probs)):
        pred_class = int(np.argmax(probs[i]))
        sample_result = {
            "sample_index": i,
            "predicted_class": pred_class,
            "predicted_label": LABELS[pred_class],
            "probabilities": {
                LABELS[c]: round(float(probs[i, c]), 6)
                for c in range(N_CLASSES)
            }
        }
        results.append(sample_result)

    return {"predictions": results, "num_samples": len(results)}


# =====================================================================
# FLASK APP
# =====================================================================

app = Flask(__name__)
# Enable CORS for all routes, allowing all origins and headers
CORS(app, supports_credentials=True)


@app.route("/", methods=["GET"])
def index():
    return jsonify({
        "service": "PhantomNet MRI K-Space Diagnosis API",
        "model": "MultimodalMRI (IFFT-CNN + Complex SSM + Cross-Fusion)",
        "classes": LABELS,
        "endpoints": {
            "GET  /":           "This info page",
            "GET  /health":     "Health check",
            "POST /predict":    "Upload .npy file (complex64, shape (N,64,64)) → predictions",
        },
        "status": "online"
    })


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy", "model_loaded": _apply_fn is not None})


@app.route("/predict", methods=["POST"])
def predict_endpoint():
    """
    Accepts a .npy file upload containing complex64 k-space data.
    Shape: (N, 64, 64) for batch or (64, 64) for single sample.
    """
    try:
        # ── Check API Key ───────────────────────────────────────────
        expected_key = app.config.get("API_KEY")
        if expected_key:
            provided_key = request.headers.get("X-API-Key") or request.form.get("api_key")
            if provided_key != expected_key:
                return jsonify({"error": "Unauthorized. Invalid or missing API key."}), 401

        # ── Check file upload ───────────────────────────────────────
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded. Use field name 'file' with a .npy file."}), 400

        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "Empty filename."}), 400

        # ── Load numpy array from upload ────────────────────────────
        file_bytes = file.read()
        X_complex = np.load(io.BytesIO(file_bytes))

        # ── Validate shape ──────────────────────────────────────────
        if X_complex.ndim == 2:
            if X_complex.shape != (64, 64):
                return jsonify({
                    "error": f"Single sample must be shape (64,64), got {X_complex.shape}"
                }), 400
        elif X_complex.ndim == 3:
            if X_complex.shape[1:] != (64, 64):
                return jsonify({
                    "error": f"Batch must be shape (N,64,64), got {X_complex.shape}"
                }), 400
        else:
            return jsonify({
                "error": f"Expected 2D or 3D array, got {X_complex.ndim}D"
            }), 400

        # ── Ensure complex type ─────────────────────────────────────
        if not np.iscomplexobj(X_complex):
            return jsonify({
                "error": "Array must be complex-valued (complex64 or complex128)."
            }), 400

        X_complex = X_complex.astype(np.complex64)

        # ── Run inference ───────────────────────────────────────────
        result = predict(X_complex)
        
        # We return pure JSON so React can easily parse it
        return jsonify(result)

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# =====================================================================
# MAIN — start server + ngrok tunnel
# =====================================================================

def main():
    parser = argparse.ArgumentParser(description="MRI K-Space Inference API Server")
    parser.add_argument("--model_path", type=str,
                        default="/kaggle/input/datasets/jeminm/moddel/best_mri_model (2).msgpack",
                        help="Path to the .msgpack model weights")
    parser.add_argument("--ngrok_token", type=str, default=None,
                        help="Your ngrok auth token")
    parser.add_argument("--api_key", type=str, default=None,
                        help="API Key required to access the endpoints")
    parser.add_argument("--port", type=int, default=5000,
                        help="Local port to serve on (default: 5000)")
    args = parser.parse_args(args=[])

    # ── Validate model file ─────────────────────────────────────────
    if not os.path.isfile(args.model_path):
        print(f"[ERROR] Model file not found: {args.model_path}")
        sys.exit(1)

    # ── Load model ──────────────────────────────────────────────────
    model, params, batch_stats = load_model(args.model_path)
    build_predict_fn(model, params, batch_stats)

    ngrok_token = args.ngrok_token
    if not ngrok_token:
        ngrok_token = input("Please enter your ngrok auth token (get it from https://dashboard.ngrok.com): ").strip()
        
    api_key = args.api_key
    if not api_key:
        api_key = input("Please create an API key to protect your server (e.g. 'my-secret-key'): ").strip()

    # ── Start ngrok tunnel ──────────────────────────────────────────
    from pyngrok import ngrok, conf
    conf.get_default().auth_token = ngrok_token
    public_url = ngrok.connect(args.port, "http")

    print("\n" + "=" * 60)
    print("  PhantomNet MRI K-Space Diagnosis API")
    print("=" * 60)
    print(f"  Local  : http://127.0.0.1:{args.port}")
    print(f"  Public : {public_url}")
    print("=" * 60)
    print("  Endpoints:")
    print("    GET  /         → API info")
    print("    GET  /health   → Health check")
    print("    POST /predict  → Upload .npy → get predictions.json file")
    print("=" * 60 + "\n")

    # ── Set API Key ─────────────────────────────────────────────────
    app.config["API_KEY"] = api_key

    # ── Run Flask ───────────────────────────────────────────────────
    app.run(host="0.0.0.0", port=args.port, debug=False)


if __name__ == "__main__":
    main()
