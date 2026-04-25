"""
mri_generator.py
────────────────
Load a .npy file (2-D slice or 3-D volume) and export MRI images.
Uses Polars for slice-level metadata / statistics,
Matplotlib + PIL for image rendering.

Integration API
───────────────
    from mri_generator import MRIGenerator

    gen = MRIGenerator("scan.npy")
    gen.load()                         # load & normalise
    gen.save_slice(output="out.png")   # single slice (2-D or mid-slice of 3-D)
    gen.save_all_slices("slices/")     # every axial slice (3-D only)
    df  = gen.slice_stats()            # polars DataFrame with per-slice stats
    img = gen.get_pil_image()          # PIL Image – hand off to your software
"""

import os
import pathlib
from typing import Optional, Union

import numpy as np
import polars as pl
import matplotlib
matplotlib.use("Agg")          # non-interactive backend – safe for all environments
import matplotlib.pyplot as plt
import matplotlib.cm as cm
from PIL import Image


# ──────────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────────

def _normalise(arr: np.ndarray) -> np.ndarray:
    """Linearly scale array values to [0, 1]."""
    lo, hi = arr.min(), arr.max()
    if hi == lo:
        return np.zeros_like(arr, dtype=np.float32)
    return ((arr - lo) / (hi - lo)).astype(np.float32)


def _to_uint8(arr: np.ndarray) -> np.ndarray:
    """Convert a [0,1] float array to uint8 [0, 255]."""
    return (arr * 255).clip(0, 255).astype(np.uint8)


def _apply_colormap(arr_2d: np.ndarray, cmap: str = "bone") -> np.ndarray:
    """
    Apply a Matplotlib colormap to a 2-D float [0,1] array.
    Returns an (H, W, 4) RGBA uint8 array.
    """
    colormap = cm.get_cmap(cmap)
    rgba = colormap(arr_2d)                    # (H, W, 4) float [0,1]
    return (rgba * 255).astype(np.uint8)


# ──────────────────────────────────────────────────────────────────────────────
# Main class
# ──────────────────────────────────────────────────────────────────────────────

class MRIGenerator:
    """
    Converts a .npy MRI array into greyscale / colormap images.

    Supported array shapes
    ──────────────────────
    • (H, W)           – single 2-D slice
    • (D, H, W)        – 3-D volume  (D axial slices)
    • (D, H, W, 1)     – 3-D volume with trailing channel dimension
    """

    def __init__(
        self,
        npy_path: Union[str, os.PathLike],
        colormap: str = "bone",
        figsize: tuple[int, int] = (6, 6),
        dpi: int = 150,
    ):
        """
        Parameters
        ----------
        npy_path  : path to the .npy file
        colormap  : any Matplotlib colormap name ('bone', 'gray', 'hot', …)
        figsize   : output figure size in inches (width, height)
        dpi       : output resolution
        """
        self.npy_path = pathlib.Path(npy_path)
        self.colormap = colormap
        self.figsize  = figsize
        self.dpi      = dpi

        self._raw:  Optional[np.ndarray] = None   # original array
        self._norm: Optional[np.ndarray] = None   # normalised [0,1] float

    # ── Loading ───────────────────────────────────────────────────────────────

    def load(self) -> "MRIGenerator":
        """Load the .npy file, squeeze trivial dims, normalise."""
        if not self.npy_path.exists():
            raise FileNotFoundError(f"File not found: {self.npy_path}")

        arr = np.load(str(self.npy_path), allow_pickle=False)

        # Remove trailing channel-dim of size 1  →  (D,H,W,1) → (D,H,W)
        if arr.ndim == 4 and arr.shape[-1] == 1:
            arr = arr.squeeze(-1)

        if arr.ndim not in (2, 3):
            raise ValueError(
                f"Expected a 2-D or 3-D array, got shape {arr.shape}."
            )

        self._raw  = arr
        self._norm = _normalise(arr.astype(np.float32))

        shape_str = "×".join(str(s) for s in arr.shape)
        kind = "2-D slice" if arr.ndim == 2 else f"3-D volume ({arr.shape[0]} slices)"
        print(f"[MRIGenerator] Loaded  : {self.npy_path.name}")
        print(f"[MRIGenerator] Shape   : {shape_str}  ({kind})")
        print(f"[MRIGenerator] dtype   : {arr.dtype}  →  normalised to float32 [0,1]")
        return self

    def _require_loaded(self):
        if self._norm is None:
            raise RuntimeError("Call .load() before generating images.")

    # ── Slice selection ───────────────────────────────────────────────────────

    def _get_slice(self, index: Optional[int] = None) -> np.ndarray:
        """
        Return a single 2-D float [0,1] slice.
        For 3-D volumes, defaults to the middle axial slice.
        """
        self._require_loaded()
        if self._norm.ndim == 2:
            return self._norm
        # 3-D
        n_slices = self._norm.shape[0]
        idx = index if index is not None else n_slices // 2
        if not (0 <= idx < n_slices):
            raise IndexError(f"Slice index {idx} out of range [0, {n_slices-1}].")
        return self._norm[idx]

    # ── Rendering ─────────────────────────────────────────────────────────────

    def _render_figure(
        self,
        slice_2d: np.ndarray,
        title: str = "MRI",
        show_colorbar: bool = True,
    ) -> plt.Figure:
        """Render a single 2-D slice into a Matplotlib figure."""
        fig, ax = plt.subplots(figsize=self.figsize)
        fig.patch.set_facecolor("black")
        ax.set_facecolor("black")

        im = ax.imshow(slice_2d, cmap=self.colormap, vmin=0, vmax=1,
                       interpolation="bicubic", aspect="equal")

        ax.set_title(title, color="white", fontsize=11, pad=8)
        ax.axis("off")

        if show_colorbar:
            cbar = fig.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
            cbar.ax.yaxis.set_tick_params(color="white")
            plt.setp(cbar.ax.yaxis.get_ticklabels(), color="white")

        fig.tight_layout(pad=0.5)
        return fig

    # ── Public API ────────────────────────────────────────────────────────────

    def save_slice(
        self,
        output: Union[str, os.PathLike] = "mri_output.png",
        index: Optional[int] = None,
        show_colorbar: bool = True,
    ) -> pathlib.Path:
        """
        Save a single MRI slice as a PNG/JPEG.

        Parameters
        ----------
        output        : output file path (extension determines format)
        index         : axial slice index (3-D only); None → middle slice
        show_colorbar : whether to render a colour scale bar

        Returns the resolved output Path.
        """
        self._require_loaded()
        s2d   = self._get_slice(index)
        label = f"Slice {index}" if (index is not None and self._norm.ndim == 3) \
                else ("Mid-slice" if self._norm.ndim == 3 else "MRI Slice")

        fig = self._render_figure(s2d, title=label, show_colorbar=show_colorbar)

        out = pathlib.Path(output)
        out.parent.mkdir(parents=True, exist_ok=True)
        fig.savefig(str(out), dpi=self.dpi, bbox_inches="tight",
                    facecolor=fig.get_facecolor())
        plt.close(fig)

        print(f"[MRIGenerator] Saved   : {out}")
        return out

    def save_all_slices(
        self,
        output_dir: Union[str, os.PathLike] = "mri_slices",
        prefix: str = "slice",
        show_colorbar: bool = False,
    ) -> list[pathlib.Path]:
        """
        Save every axial slice (3-D volumes only).

        Returns a list of saved Paths.
        """
        self._require_loaded()
        if self._norm.ndim == 2:
            print("[MRIGenerator] Array is 2-D; saving single slice.")
            return [self.save_slice(
                output=pathlib.Path(output_dir) / f"{prefix}_000.png"
            )]

        n_slices = self._norm.shape[0]
        out_dir  = pathlib.Path(output_dir)
        out_dir.mkdir(parents=True, exist_ok=True)

        paths = []
        pad   = len(str(n_slices))
        for i in range(n_slices):
            fname = out_dir / f"{prefix}_{str(i).zfill(pad)}.png"
            self.save_slice(output=fname, index=i, show_colorbar=show_colorbar)
            paths.append(fname)

        print(f"[MRIGenerator] Done – {n_slices} slices saved to '{out_dir}/'")
        return paths

    def get_pil_image(
        self,
        index: Optional[int] = None,
        mode: str = "RGB",
    ) -> Image.Image:
        """
        Return a PIL Image for a single slice – useful for in-memory
        integration with your software (no file I/O required).

        Parameters
        ----------
        index : axial slice (3-D only); None → middle slice
        mode  : 'RGB', 'RGBA', or 'L' (greyscale)
        """
        self._require_loaded()
        s2d = self._get_slice(index)

        if mode == "L":
            return Image.fromarray(_to_uint8(s2d), mode="L")

        rgba = _apply_colormap(s2d, self.colormap)   # (H,W,4) uint8
        img  = Image.fromarray(rgba, mode="RGBA")
        return img.convert(mode)

    def get_numpy_image(self, index: Optional[int] = None) -> np.ndarray:
        """
        Return the rendered slice as a (H, W, 3) uint8 NumPy array.
        Handy for OpenCV or other image-pipeline integrations.
        """
        pil = self.get_pil_image(index=index, mode="RGB")
        return np.array(pil)

    # ── Statistics (Polars) ───────────────────────────────────────────────────

    def slice_stats(self) -> pl.DataFrame:
        """
        Compute per-slice statistics using Polars.

        Returns a DataFrame with columns:
            slice_index, min, max, mean, std, median, nonzero_ratio
        """
        self._require_loaded()

        if self._raw.ndim == 2:
            slices = [self._raw]
            indices = [0]
        else:
            slices  = [self._raw[i] for i in range(self._raw.shape[0])]
            indices = list(range(self._raw.shape[0]))

        records = []
        for idx, sl in zip(indices, slices):
            flat = sl.astype(np.float64).ravel()
            records.append({
                "slice_index":   idx,
                "min":           float(flat.min()),
                "max":           float(flat.max()),
                "mean":          float(flat.mean()),
                "std":           float(flat.std()),
                "median":        float(np.median(flat)),
                "nonzero_ratio": float(np.count_nonzero(flat) / flat.size),
            })

        df = pl.DataFrame(records).with_columns([
            pl.col("slice_index").cast(pl.Int32),
        ])

        print(f"[MRIGenerator] Slice stats computed – {len(df)} row(s)")
        return df

    # ── Convenience ───────────────────────────────────────────────────────────

    @property
    def shape(self) -> tuple:
        self._require_loaded()
        return self._raw.shape

    @property
    def n_slices(self) -> int:
        self._require_loaded()
        return 1 if self._raw.ndim == 2 else self._raw.shape[0]

    def __repr__(self) -> str:
        loaded = self._raw is not None
        shape  = str(self._raw.shape) if loaded else "not loaded"
        return f"MRIGenerator(path={self.npy_path.name!r}, shape={shape}, cmap={self.colormap!r})"


# ──────────────────────────────────────────────────────────────────────────────
# CLI / quick test
# ──────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import sys
    import argparse

    parser = argparse.ArgumentParser(description="Convert a .npy MRI file to images.")
    parser.add_argument("npy_file",           help="Path to the .npy file")
    parser.add_argument("--output",  "-o",    default="mri_output.png",
                        help="Output image path (default: mri_output.png)")
    parser.add_argument("--all-slices", "-a", action="store_true",
                        help="Save every axial slice (3-D only)")
    parser.add_argument("--outdir",           default="mri_slices",
                        help="Output folder for --all-slices")
    parser.add_argument("--colormap", "-c",   default="bone",
                        help="Matplotlib colormap (default: bone)")
    parser.add_argument("--index",    "-i",   type=int, default=None,
                        help="Slice index (3-D only, default: middle)")
    parser.add_argument("--stats",    "-s",   action="store_true",
                        help="Print per-slice statistics")
    args = parser.parse_args()

    gen = MRIGenerator(args.npy_file, colormap=args.colormap).load()

    if args.all_slices:
        gen.save_all_slices(output_dir=args.outdir)
    else:
        gen.save_slice(output=args.output, index=args.index)

    if args.stats:
        df = gen.slice_stats()
        print("\n── Slice statistics ──")
        print(df)
