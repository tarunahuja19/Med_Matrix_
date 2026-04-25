#!/usr/bin/env python3
"""
process_npy.py
──────────────
Process a .npy file and output the MRI image as base64.
Called from the API endpoint.

Usage:
    python process_npy.py <input_npy_path> [--slice <index>] [--colormap <cmap>]

Output:
    JSON with base64 encoded image and metadata
"""

import sys
import json
import base64
import argparse
from io import BytesIO
from pathlib import Path

# Add the scripts directory to path for importing mri_generator
sys.path.insert(0, str(Path(__file__).parent))

from mri_generator import MRIGenerator


def process_npy_file(npy_path: str, slice_index: int = None, colormap: str = "bone") -> dict:
    """
    Process a .npy file and return the image as base64.
    
    Parameters
    ----------
    npy_path : str
        Path to the .npy file
    slice_index : int, optional
        Slice index for 3D volumes (None = middle slice)
    colormap : str
        Matplotlib colormap name
        
    Returns
    -------
    dict
        JSON-serializable dict with image data and metadata
    """
    try:
        gen = MRIGenerator(npy_path, colormap=colormap)
        gen.load()
        
        # Get the PIL image
        img = gen.get_pil_image(index=slice_index, mode="RGB")
        
        # Convert to base64
        buffer = BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)
        img_base64 = base64.b64encode(buffer.read()).decode("utf-8")
        
        # Get slice statistics
        stats_df = gen.slice_stats()
        stats = stats_df.to_dicts()
        
        return {
            "success": True,
            "image": f"data:image/png;base64,{img_base64}",
            "metadata": {
                "shape": list(gen.shape),
                "n_slices": gen.n_slices,
                "current_slice": slice_index if slice_index is not None else (gen.n_slices // 2 if gen.n_slices > 1 else 0),
                "colormap": colormap,
            },
            "statistics": stats,
        }
        
    except FileNotFoundError as e:
        return {
            "success": False,
            "error": f"File not found: {str(e)}",
        }
    except ValueError as e:
        return {
            "success": False,
            "error": f"Invalid array format: {str(e)}",
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Processing error: {str(e)}",
        }


def main():
    parser = argparse.ArgumentParser(description="Process .npy MRI file to base64 image")
    parser.add_argument("npy_file", help="Path to the .npy file")
    parser.add_argument("--slice", "-s", type=int, default=None, help="Slice index (3D only)")
    parser.add_argument("--colormap", "-c", default="bone", help="Matplotlib colormap")
    args = parser.parse_args()
    
    result = process_npy_file(args.npy_file, args.slice, args.colormap)
    print(json.dumps(result))


if __name__ == "__main__":
    main()
