"""
MRI K-Space to Brain Image Reconstruction
==========================================
Loads a 64x64 k-space .npy file and reconstructs the brain MRI image
via inverse Fast Fourier Transform (iFFT).

Usage:
    python kspace_to_image.py --input kspace.npy --output brain.png

Dependencies:
    pip install numpy matplotlib scipy Pillow
"""

import numpy as np
import matplotlib.pyplot as plt
import argparse
import os
from pathlib import Path


# ──────────────────────────────────────────────
# Core reconstruction function
# ──────────────────────────────────────────────

def reconstruct_from_kspace(kspace: np.ndarray) -> np.ndarray:
    """
    Reconstruct an MRI image from k-space data using inverse FFT.

    Args:
        kspace: 2D complex or real numpy array (e.g. 64×64).

    Returns:
        2D float array of the reconstructed magnitude image,
        normalised to [0, 1].
    """
    # Ensure complex dtype
    if not np.iscomplexobj(kspace):
        kspace = kspace.astype(complex)

    # Shift zero-frequency component to centre, apply iFFT, shift back
    kspace_shifted   = np.fft.ifftshift(kspace)
    image_complex    = np.fft.ifft2(kspace_shifted)
    image_magnitude  = np.fft.fftshift(np.abs(image_complex))

    # Normalise to [0, 1]
    img_min, img_max = image_magnitude.min(), image_magnitude.max()
    if img_max > img_min:
        image_normalised = (image_magnitude - img_min) / (img_max - img_min)
    else:
        image_normalised = image_magnitude

    return image_normalised


def load_kspace(filepath: str) -> np.ndarray:
    """
    Load k-space data from a .npy file.

    Supports:
      - Complex arrays  (stored directly)
      - Real arrays     (treated as magnitude; promoted to complex)
      - Shape (64, 64)        – used as-is
      - Shape (64, 64, 2)     – interpreted as (real, imag) channels
    """
    data = np.load(filepath)

    if data.ndim == 3 and data.shape[-1] == 2:
        # Two-channel real/imag encoding
        kspace = data[..., 0] + 1j * data[..., 1]
    elif data.ndim == 2:
        kspace = data.astype(complex)
    else:
        raise ValueError(
            f"Unexpected k-space shape: {data.shape}. "
            "Expected (H, W) or (H, W, 2)."
        )

    return kspace


def save_image(image: np.ndarray, output_path: str) -> None:
    """Save the reconstructed image as a PNG (no axes, no border)."""
    fig, ax = plt.subplots(figsize=(6, 6))
    ax.imshow(image, cmap="gray", origin="lower")
    ax.axis("off")
    fig.tight_layout(pad=0)
    fig.savefig(output_path, dpi=150, bbox_inches="tight", pad_inches=0)
    plt.close(fig)
    print(f"[✓] Image saved → {output_path}")


def show_comparison(kspace: np.ndarray, image: np.ndarray) -> None:
    """Display k-space (log-magnitude) alongside the reconstructed image."""
    kspace_log = np.log1p(np.abs(kspace))
    kspace_log = (kspace_log - kspace_log.min()) / (kspace_log.max() - kspace_log.min() + 1e-8)

    fig, axes = plt.subplots(1, 2, figsize=(12, 5))
    fig.patch.set_facecolor("#0d0d0d")

    for ax in axes:
        ax.set_facecolor("#0d0d0d")
        ax.tick_params(colors="white")
        for spine in ax.spines.values():
            spine.set_edgecolor("#333")

    axes[0].imshow(kspace_log, cmap="inferno", origin="lower")
    axes[0].set_title("K-Space (log magnitude)", color="white", fontsize=13, pad=10)
    axes[0].axis("off")

    axes[1].imshow(image, cmap="gray", origin="lower")
    axes[1].set_title("Reconstructed Brain Image", color="white", fontsize=13, pad=10)
    axes[1].axis("off")

    plt.tight_layout()
    plt.show()


# ──────────────────────────────────────────────
# Main entry point
# ──────────────────────────────────────────────

def process(input_path: str,
            output_path: str = "brain_reconstructed.png",
            show: bool = True) -> np.ndarray:
    """
    Full pipeline: load → reconstruct → save → (optionally) display.

    Args:
        input_path:  Path to the .npy k-space file.
        output_path: Where to save the reconstructed PNG.
        show:        If True, open an interactive comparison window.

    Returns:
        Reconstructed image as a float32 numpy array in [0, 1].
    """
    # ── 1. Load ──────────────────────────────
    print(f"[→] Loading k-space from: {input_path}")
    kspace = load_kspace(input_path)
    print(f"    Shape : {kspace.shape}  |  dtype: {kspace.dtype}")

    # ── 2. Reconstruct ────────────────────────
    print("[→] Reconstructing via inverse FFT …")
    image = reconstruct_from_kspace(kspace)
    print(f"    Output shape: {image.shape}  |  range [{image.min():.3f}, {image.max():.3f}]")

    # ── 3. Save ───────────────────────────────
    save_image(image, output_path)

    # ── 4. Display (optional) ─────────────────
    if show:
        show_comparison(kspace, image)

    return image.astype(np.float32)


# ── CLI ───────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Reconstruct brain MRI from k-space .npy file")
    parser.add_argument("--input",  "-i", required=True,  help="Path to k-space .npy file")
    parser.add_argument("--output", "-o", default="brain_reconstructed.png",
                        help="Output image path (default: brain_reconstructed.png)")
    parser.add_argument("--no-show", action="store_true",
                        help="Skip the interactive display window")
    args = parser.parse_args()

    if not os.path.isfile(args.input):
        raise FileNotFoundError(f"Input file not found: {args.input}")

    process(
        input_path=args.input,
        output_path=args.output,
        show=not args.no_show
    )
