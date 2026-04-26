"""
Multimodal MRI Diagnosis System — JAX/Flax
==========================================
Single-file for Kaggle (TPU/GPU).

Architecture:
  Branch 1 (IFFT-CNN)  : iFFT → 3D Conv → 3D Attention → pool → P_vec_1
  Branch 2 (K-SSM)     : Row tokenize → Complex Diagonal SSM → seq_out
  Fusion               : Cross-Attention (CNN=Q, SSM=K/V) → fused vector
  Heads                : Diagnosis (4-class)

Input:  [B, 64, 64, 2]  (64 rows × 64 readout × real/imag)
Output: logits [B, 4]

Classes: 0=Healthy  1=Microbleed  2=WML  3=AMI
"""

import jax
import jax.numpy as jnp
import flax.linen as nn
import optax
from flax.training import train_state
import flax.serialization
from typing import Any
import numpy as np
import time


print(f"JAX devices: {jax.devices()}")

# =====================================================================
# 1. CONFIG
# =====================================================================
LABELS = {0: "Healthy", 1: "Microbleed", 2: "WML", 3: "AMI"}

# Data file paths
DATA_X = r"c:\Users\Jemin\.openclaw\workspace\state\X_combined.npy"
DATA_Y = r"c:\Users\Jemin\.openclaw\workspace\state\y_combined.npy"

class C:
    """All hyperparameters."""
    # Data shape: X_combined is (N, 64, 64) complex64
    # We treat rows as D*H and width as W
    D, H, W     = 8, 8, 64            # volume: depth=8, height=8, width=64
    total_rows   = D * H               # 64 — SSM sequence length
    d_model      = 96                  # balanced: 128 overfit, 64 underfit
    d_state      = 16
    n_ssm        = 3                   # 3 SSM layers (was 4)
    conv_ch      = (24, 48, 96)        # moderate CNN capacity
    n_heads      = 4
    ffn_dim      = 192
    drop         = 0.15                # moderate dropout

    # training
    bs           = 16                  # back to 16 — more updates per epoch
    lr           = 5e-4                # moderate LR
    wd           = 1e-3                # moderate weight decay
    epochs       = 80
    warmup       = 5
    patience     = 15                  # more patience before stopping
    seed         = 42
    # data
    test_r       = 0.2
    # loss weights
    w_cls        = 1.0
    w_tv         = 0.01
    w_l1         = 0.005

    # augmentation (light — don't destroy signal)
    aug_noise_std = 0.02               # light Gaussian noise
    aug_phase_max = 0.15               # light phase rotation
    aug_row_drop  = 0.05               # 5% row dropout
    mixup_alpha   = 0.1                # light mixup

# =====================================================================
# 2. DATA LOADING
# =====================================================================

def _normalize_kspace(X):
    """Log-magnitude normalize, preserving phase. X: [N, rows, W, 2] float32."""
    mag = np.sqrt(X[...,0]**2 + X[...,1]**2 + 1e-9)
    ph  = np.arctan2(X[...,1], X[...,0])
    lm  = np.log1p(mag)
    # per-sample normalization to keep scale consistent
    lm  = lm / (lm.reshape(len(lm), -1).max(axis=1, keepdims=True)[:, None, :] + 1e-9)
    out = np.empty_like(X)
    out[...,0] = lm * np.cos(ph)
    out[...,1] = lm * np.sin(ph)
    return out

def make_data():
    """
    Load X_combined.npy  (N, 64, 64) complex64  and  y_combined.npy  (N,) int.
    Returns
    -------
    X_raw : [N, 64, 64, 2]  raw k-space float32 (real/imag split)
    X_norm: [N, 64, 64, 2]  log-mag normalized
    y     : [N]              int32 labels
    """
    print(f"[data] Loading {DATA_X} ...")
    X_c = np.load(DATA_X)          # (N, 64, 64) complex64
    y   = np.load(DATA_Y).astype(np.int32)

    # Split complex → real/imag last axis: (N, 64, 64, 2)
    X_raw = np.stack([X_c.real, X_c.imag], axis=-1).astype(np.float32)
    X_norm = _normalize_kspace(X_raw)

    rng = np.random.RandomState(C.seed)
    perm = rng.permutation(len(y))
    X_raw, X_norm, y = X_raw[perm], X_norm[perm], y[perm]

    counts = np.bincount(y, minlength=4)
    print(f"[data] {len(y)} samples | shape {X_raw.shape} | class counts {counts}")
    return X_raw, X_norm, y

def split_data(X_raw, X_norm, y):
    """Stratified train/test split. Returns (raw_tr, norm_tr, y_tr, raw_te, norm_te, y_te)."""
    rng = np.random.RandomState(C.seed + 1)
    tr, te = [], []
    for c in range(4):
        ci = np.where(y == c)[0]; rng.shuffle(ci)
        nt = max(1, min(int(len(ci) * C.test_r), len(ci) - 1))
        te.extend(ci[:nt].tolist()); tr.extend(ci[nt:].tolist())
    rng.shuffle(tr); rng.shuffle(te)
    return (X_raw[tr], X_norm[tr], y[tr],
            X_raw[te], X_norm[te], y[te])

# =====================================================================
# 3. DATA AUGMENTATION (k-space domain)
# =====================================================================

def augment_kspace(x_raw, x_norm, rng):
    """
    On-the-fly k-space augmentation.  Operates on JAX arrays.
    x_raw, x_norm: [B, 64, 64, 2]
    """
    B = x_raw.shape[0]
    rng, k1, k2, k3 = jax.random.split(rng, 4)

    # 1. Additive Gaussian noise
    noise = jax.random.normal(k1, x_raw.shape) * C.aug_noise_std
    x_raw  = x_raw + noise
    x_norm = x_norm + noise * 0.5       # less noise on normalized branch

    # 2. Random global phase rotation  (preserves magnitude structure)
    angle = jax.random.uniform(k2, (B, 1, 1, 1),
                                minval=-C.aug_phase_max,
                                maxval=C.aug_phase_max)
    cos_a, sin_a = jnp.cos(angle), jnp.sin(angle)
    def _rotate(x):
        r, i = x[..., 0:1], x[..., 1:2]
        return jnp.concatenate([r*cos_a - i*sin_a,
                                r*sin_a + i*cos_a], axis=-1)
    x_raw  = _rotate(x_raw)
    x_norm = _rotate(x_norm)

    # 3. Random row dropout (simulate missing k-space lines)
    mask = jax.random.bernoulli(k3, 1.0 - C.aug_row_drop,
                                 shape=(B, x_raw.shape[1], 1, 1))
    x_raw  = x_raw * mask
    x_norm = x_norm * mask

    return x_raw, x_norm, rng


def mixup(x_raw, x_norm, y, rng):
    """Mixup: blend pairs of samples to smooth the decision boundary."""
    B = x_raw.shape[0]
    rng, k1, k2 = jax.random.split(rng, 3)
    lam = jax.random.beta(k1, C.mixup_alpha, C.mixup_alpha, shape=(B, 1, 1, 1))
    perm = jax.random.permutation(k2, B)
    x_raw  = lam * x_raw  + (1 - lam) * x_raw[perm]
    x_norm = lam * x_norm + (1 - lam) * x_norm[perm]
    y_oh   = jax.nn.one_hot(y, 4)
    lam_y  = lam.squeeze(-1).squeeze(-1)   # [B, 1]
    y_mix  = lam_y * y_oh + (1 - lam_y) * y_oh[perm]
    return x_raw, x_norm, y_mix, rng


# =====================================================================
# 4. MODEL COMPONENTS
# =====================================================================

class ConvBlock3D(nn.Module):
    """Conv3D → BatchNorm → LeakyReLU  (stride-2 downsampling)."""
    ch: int
    @nn.compact
    def __call__(self, x, train):
        x = nn.Conv(self.ch, (3,3,3), strides=(2,2,2), padding="SAME")(x)
        x = nn.BatchNorm(use_running_average=not train)(x)
        return nn.leaky_relu(x, 0.2)


class MultiHeadAttn(nn.Module):
    """Manual multi-head attention (works for both self & cross)."""
    dm: int
    nh: int
    @nn.compact
    def __call__(self, q, kv, train):
        dh = self.dm // self.nh
        B = q.shape[0]
        Q = nn.Dense(self.dm)(q).reshape(B,-1,self.nh,dh).transpose(0,2,1,3)
        K = nn.Dense(self.dm)(kv).reshape(B,-1,self.nh,dh).transpose(0,2,1,3)
        V = nn.Dense(self.dm)(kv).reshape(B,-1,self.nh,dh).transpose(0,2,1,3)
        w = jnp.matmul(Q, K.transpose(0,1,3,2)) / jnp.sqrt(float(dh))
        w = jax.nn.softmax(w, axis=-1)
        w = nn.Dropout(C.drop, deterministic=not train)(w)
        o = jnp.matmul(w, V).transpose(0,2,1,3).reshape(B,-1,self.dm)
        return nn.Dense(self.dm)(o)


class ComplexSSM(nn.Module):
    """
    Complex diagonal SSM via jax.lax.scan.
    Each of D channels gets its own N-dim complex hidden state.
    h_t[d] = A[d]*h_{t-1}[d] + B_t*x_t[d]
    y_t[d] = Re(C_t · h_t[d]) + D*x_t[d]
    """
    dm: int
    ns: int   # d_state
    @nn.compact
    def __call__(self, x):
        B, L, D = x.shape
        N = self.ns
        # learnable complex A (negative real part for stability)
        log_Ar = self.param("log_Ar", nn.initializers.uniform(.5), (D,N))
        Ai     = self.param("Ai", nn.initializers.normal(.1), (D,N))
        A = -jnp.exp(log_Ar) + 1j*Ai
        # input-dependent B, C
        Bp = nn.Dense(2*N)(x); Br, Bi = jnp.split(Bp, 2, -1)
        B_t = (Br + 1j*Bi)                                    # [B,L,N]
        Cp = nn.Dense(2*N)(x); Cr, Ci = jnp.split(Cp, 2, -1)
        C_t = (Cr + 1j*Ci)                                    # [B,L,N]
        Dskip = self.param("Dskip", nn.initializers.ones, (D,))

        def step(h, inp):
            xt, bt, ct = inp          # (B,D), (B,N), (B,N)
            xc = xt.astype(jnp.complex64)
            h = A[None]*h + bt[:,None,:]*xc[:,:,None]  # (B,D,N)
            y = jnp.sum(ct[:,None,:]*h, axis=-1).real   # (B,D)
            return h, y + Dskip*xt

        xs = (x.transpose(1,0,2), B_t.transpose(1,0,2), C_t.transpose(1,0,2))
        h0 = jnp.zeros((B, D, N), jnp.complex64)
        _, ys = jax.lax.scan(step, h0, xs)
        return ys.transpose(1,0,2)                             # [B,L,D]


class SSMBlock(nn.Module):
    dm: int; ns: int
    @nn.compact
    def __call__(self, x, train):
        r = x
        x = nn.LayerNorm()(x)
        x = ComplexSSM(self.dm, self.ns)(x)
        x = nn.Dropout(C.drop, deterministic=not train)(x)
        return x + r


# ── Branch 1: IFFT-CNN ──────────────────────────────────────────────
class IFFTCNNBranch(nn.Module):
    @nn.compact
    def __call__(self, kspace_raw, train):
        """kspace_raw: [B,64,64,2] (un-normalized) → P_vec [B,d_model]."""
        B = kspace_raw.shape[0]
        # reshape → [B, D, H, W, 2]
        x = kspace_raw.reshape(B, C.D, C.H, C.W, 2)
        # complex k-space
        xc = x[...,0] + 1j*x[...,1]                        # [B,D,H,W]
        # 2D iFFT per slice → image magnitude
        img = jnp.fft.ifftshift(xc, axes=(-2,-1))
        img = jnp.fft.ifft2(img, axes=(-2,-1))
        img = jnp.abs(img)                                  # [B,D,H,W]
        img = img[..., None]                                # [B,D,H,W,1]
        # 3 conv blocks: stride-2 each → [B,2,2,32,128]
        for ch in C.conv_ch:
            img = ConvBlock3D(ch)(img, train)
        # flatten spatial for attention
        feat = img.reshape(B, -1, C.conv_ch[-1])
        feat = feat + MultiHeadAttn(C.conv_ch[-1], C.n_heads)(feat, feat, train)
        feat = nn.LayerNorm()(feat)
        # global average pool → linear
        p = feat.mean(axis=1)
        p = nn.Dropout(C.drop, deterministic=not train)(p)   # dropout before projection
        p = nn.Dense(C.d_model)(p)
        return p


# ── Branch 2: K-SSM ────────────────────────────────────────────────
class KSSMBranch(nn.Module):
    @nn.compact
    def __call__(self, kspace_norm, train):
        """kspace_norm: [B,64,64,2] (log-mag normalized) → seq [B,64,d_model]."""
        B = kspace_norm.shape[0]
        x = kspace_norm.reshape(B, C.total_rows, C.W * 2)   # [B,64,128]
        x = nn.Dense(C.d_model)(x)                           # project down
        x = nn.Dropout(C.drop, deterministic=not train)(x)   # input dropout
        for _ in range(C.n_ssm):
            x = SSMBlock(C.d_model, C.d_state)(x, train)
        return x


# ── Cross-Attention Fusion ──────────────────────────────────────────
class CrossFusion(nn.Module):
    @nn.compact
    def __call__(self, p_cnn, ssm_seq, train):
        """
        p_cnn:   [B, d_model]     — CNN summary (query)
        ssm_seq: [B, 256, d_model] — SSM sequence (keys/values)
        Returns: fused [B, d_model]
        """
        q = p_cnn[:, None, :]                                # [B,1,dm]
        out = MultiHeadAttn(C.d_model, C.n_heads)(q, ssm_seq, train)
        out = out.squeeze(1) + p_cnn                         # residual
        out = nn.LayerNorm()(out)
        # FFN
        r = out
        out = nn.Dense(C.ffn_dim)(out)
        out = nn.relu(out)
        out = nn.Dropout(C.drop, deterministic=not train)(out)
        out = nn.Dense(C.d_model)(out)
        return nn.LayerNorm()(out + r)


# ── Heads ───────────────────────────────────────────────────────────
class DiagnosisHead(nn.Module):
    @nn.compact
    def __call__(self, x, train):
        x = nn.Dense(C.d_model)(x)
        x = nn.leaky_relu(x, .2)
        x = nn.Dropout(C.drop, deterministic=not train)(x)
        return nn.Dense(4)(x)                                # [B, 4] logits


# ── Top-Level Model ─────────────────────────────────────────────────
class MultimodalMRI(nn.Module):
    @nn.compact
    def __call__(self, x_raw, x_norm, train=True):
        """
        x_raw:  [B, 64, 64, 2]  raw k-space → CNN branch (iFFT)
        x_norm: [B, 64, 64, 2]  log-mag normalized → SSM branch
        Returns: logits [B, 4]
        """
        p_cnn   = IFFTCNNBranch()(x_raw, train)
        ssm_seq = KSSMBranch()(x_norm, train)
        fused   = CrossFusion()(p_cnn, ssm_seq, train)
        logits  = DiagnosisHead()(fused, train)
        return logits

# =====================================================================
# 4. LOSSES
# =====================================================================

def cls_loss(logits, labels):
    """Cross-entropy with label smoothing."""
    n = 4; eps = 0.1
    oh = jax.nn.one_hot(labels, n)
    oh = oh * (1-eps) + eps/n
    lp = jax.nn.log_softmax(logits)
    return -jnp.sum(oh * lp, -1).mean()

def cls_loss_soft(logits, y_soft):
    """Cross-entropy against soft (mixup) targets."""
    lp = jax.nn.log_softmax(logits)
    return -jnp.sum(y_soft * lp, -1).mean()

def total_loss(logits, labels, soft_labels=None):
    """Classification loss only."""
    if soft_labels is not None:
        lc = cls_loss_soft(logits, soft_labels)
    else:
        lc = cls_loss(logits, labels)
    return lc, {"cls": lc, "total": lc}



# =====================================================================
# 5. TRAINING
# =====================================================================

class TS(train_state.TrainState):
    batch_stats: Any = None

def create_state(rng, n_train):
    model = MultimodalMRI()
    dummy = jnp.ones((1, C.total_rows, C.W, 2))
    variables = model.init({"params": rng, "dropout": rng},
                           dummy, dummy, train=True)
    params = variables["params"]
    bs = variables.get("batch_stats", {})
    # cosine schedule — use actual train set size for step count
    steps_per_epoch = max(1, n_train // C.bs)
    total_steps = C.epochs * steps_per_epoch
    warmup_steps = C.warmup * steps_per_epoch
    schedule = optax.warmup_cosine_decay_schedule(
        init_value=1e-6, peak_value=C.lr,
        warmup_steps=warmup_steps, decay_steps=total_steps, end_value=1e-6)
    tx = optax.chain(optax.clip_by_global_norm(1.0),
                     optax.adamw(schedule, weight_decay=C.wd))
    return TS.create(apply_fn=model.apply, params=params, tx=tx, batch_stats=bs)

@jax.jit
def train_step(state, x_raw, x_norm, y, y_soft, rng):
    """Single training step with mixup soft labels."""
    x_raw, x_norm, rng = augment_kspace(x_raw, x_norm, rng)

    def loss_fn(params):
        logits, updates = state.apply_fn(
            {"params": params, "batch_stats": state.batch_stats},
            x_raw, x_norm, train=True,
            rngs={"dropout": rng}, mutable=["batch_stats"])
        loss, metrics = total_loss(logits, y, soft_labels=y_soft)
        return loss, (metrics, updates, logits)
    (loss, (metrics, updates, logits)), grads = jax.value_and_grad(loss_fn, has_aux=True)(state.params)
    state = state.apply_gradients(grads=grads)
    state = state.replace(batch_stats=updates["batch_stats"])
    preds = jnp.argmax(logits, -1)
    # Report accuracy on HARD labels (not mixup-distorted)
    acc = (preds == y).mean()
    return state, {**metrics, "acc": acc}

@jax.jit
def eval_step(state, x_raw, x_norm, y):
    logits = state.apply_fn(
        {"params": state.params, "batch_stats": state.batch_stats},
        x_raw, x_norm, train=False)
    _, metrics = total_loss(logits, y)
    preds = jnp.argmax(logits, -1)
    return {**metrics, "acc": (preds == y).mean()}

def run_epoch(state, Xr, Xn, y, rng, is_train=True):
    """Xr=raw, Xn=normalized."""
    n = len(y); bs = C.bs
    idx = np.random.permutation(n) if is_train else np.arange(n)
    ms = {k: 0. for k in ["cls", "total", "acc"]}
    cnt = 0
    for i in range(0, n-bs+1, bs):
        bi = idx[i:i+bs]
        br = jnp.array(Xr[bi])
        bn = jnp.array(Xn[bi])
        by = jnp.array(y[bi])
        if is_train:
            rng, k1, k2 = jax.random.split(rng, 3)
            br, bn, by_soft, rng = mixup(br, bn, by, k1)
            state, m = train_step(state, br, bn, by, by_soft, k2)
        else:
            m = eval_step(state, br, bn, by)
        for k in ms: ms[k] += float(m[k])
        cnt += 1
    for k in ms: ms[k] /= max(cnt,1)
    return state, ms, rng

# =====================================================================
# 6. MAIN
# =====================================================================

def main():
    print("="*60)
    print("  MULTIMODAL MRI DIAGNOSIS SYSTEM")
    print("  Training on: X_combined.npy / y_combined.npy")
    print("="*60)
    t0 = time.time()

    # Load combined dataset (raw for CNN iFFT branch, normalized for SSM branch)
    Xraw, Xnorm, y = make_data()
    rtr, ntr, ytr, rte, nte, yte = split_data(Xraw, Xnorm, y)
    print(f"[split] train {rtr.shape}  test {rte.shape}")

    # model
    rng = jax.random.PRNGKey(C.seed)
    rng, init_rng = jax.random.split(rng)
    state = create_state(init_rng, n_train=len(ytr))
    n_params = sum(p.size for p in jax.tree_util.tree_leaves(state.params))
    print(f"[model] {n_params:,} parameters")

    best_acc = 0.
    wait = 0
    best_state = None
    for ep in range(1, C.epochs+1):
        state, trm, rng = run_epoch(state, rtr, ntr, ytr, rng, True)
        _, tem, _ = run_epoch(state, rte, nte, yte, rng, False)
        if tem["acc"] > best_acc:
            best_acc = tem["acc"]
            best_state = state
            wait = 0
            tag = " ★"
        else:
            wait += 1
            tag = ""
        gap = trm["acc"] - tem["acc"]
        if ep % 2 == 0 or ep == 1:
            print(f"[ep {ep:3d}/{C.epochs}] "
                  f"train loss={trm['total']:.4f} acc={trm['acc']:.3f} | "
                  f"test  loss={tem['total']:.4f} acc={tem['acc']:.3f} "
                  f"gap={gap:.3f}{tag}")
        # Early stopping
        if wait >= C.patience:
            print(f"[early stop] No improvement for {C.patience} epochs.")
            break

    dt = time.time() - t0
    print(f"\n{'='*60}")
    print(f"  DONE  |  best test acc = {best_acc:.3f}  |  {dt:.0f}s")
    print(f"  Stopped at epoch {ep} / {C.epochs}")
    print(f"{'='*60}")

    if best_state is not None:
        print("\n[save] Saving best model weights...")
        with open("best_mri_model.msgpack", "wb") as f:
            f.write(flax.serialization.to_bytes(best_state))
        print("[save] Saved to best_mri_model.msgpack")

    eval_state = best_state if best_state is not None else state

if __name__ == "__main__":
    main()

