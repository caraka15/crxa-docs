#!/usr/bin/env python3
"""Utility helpers to keep public brand assets in sync."""
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Iterable, List, Sequence, Tuple

try:
    from PIL import Image
except ImportError as exc:  # pragma: no cover - we want a friendly exit
    raise SystemExit(
        "Pillow is required. Install it with `pip install Pillow` before running this script."
    ) from exc

DEFAULT_ICON_SPECS: Sequence[Tuple[str, Tuple[int, int]]] = (
    ("favicon-48.png", (48, 48)),
    ("apple-touch-icon.png", (180, 180)),
    ("logo-192.png", (192, 192)),
)


def _parse_icon_spec(raw: str) -> Tuple[str, Tuple[int, int]]:
    if "=" not in raw:
        raise argparse.ArgumentTypeError("Icon spec must look like filename=size (e.g. icon.png=128)")
    filename, size_part = raw.split("=", 1)
    filename = filename.strip()
    if not filename:
        raise argparse.ArgumentTypeError("Icon spec filename cannot be empty")
    size_part = size_part.lower().replace(" ", "")
    if "x" in size_part:
        width_str, height_str = size_part.split("x", 1)
    else:
        width_str = height_str = size_part
    try:
        width, height = int(width_str), int(height_str)
    except ValueError as err:
        raise argparse.ArgumentTypeError(f"Invalid size in icon spec '{raw}'") from err
    if width <= 0 or height <= 0:
        raise argparse.ArgumentTypeError("Icon sizes must be positive")
    return filename, (width, height)


def _build_icon_matrix(
    custom_specs: Iterable[str],
    include_defaults: bool,
) -> List[Tuple[str, Tuple[int, int]]]:
    data: List[Tuple[str, Tuple[int, int]]] = []
    if include_defaults:
        data.extend(DEFAULT_ICON_SPECS)
    for raw in custom_specs:
        data.append(_parse_icon_spec(raw))
    # avoid duplicates by keeping the last occurrence
    dedup: dict[str, Tuple[int, int]] = {}
    for name, size in data:
        dedup[name] = size
    return [(name, dedup[name]) for name in dedup]


def _save_icon(
    base_image: Image.Image,
    target: Path,
    size: Tuple[int, int],
) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    resized = base_image.resize(size, Image.Resampling.LANCZOS)
    suffix = target.suffix.lower()
    if suffix == ".png":
        resized.save(target, format="PNG")
    elif suffix == ".ico":
        resized.save(target, format="ICO", sizes=[size])
    else:
        raise SystemExit(f"Unsupported output format for {target.name}. Use .png or .ico")


def _write_manifest(
    output_dir: Path,
    manifest_name: str,
    manifest_short_name: str,
    theme_color: str,
    background_color: str,
    description: str,
    icons: Iterable[Tuple[str, Tuple[int, int]]],
    manifest_file: str,
) -> Path:
    manifest_icons = [
        {
            "src": f"/{name}",
            "sizes": f"{size[0]}x{size[1]}",
            "type": "image/png",
        }
        for name, size in icons
        if name.lower().endswith(".png")
    ]
    manifest = {
        "name": manifest_name,
        "short_name": manifest_short_name,
        "start_url": "/",
        "display": "standalone",
        "background_color": background_color,
        "theme_color": theme_color,
        "description": description,
        "icons": manifest_icons,
    }
    manifest_path = output_dir / manifest_file
    manifest_path.write_text(json.dumps(manifest, indent=2))
    return manifest_path


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate Docs favicon / apple-touch assets from a single logo file.",
    )
    parser.add_argument(
        "-i",
        "--input",
        default="public/logo.png",
        help="Path to the base logo (defaults to public/logo.png)",
    )
    parser.add_argument(
        "-o",
        "--output",
        default="public",
        help="Directory where generated assets will be written (defaults to public).",
    )
    parser.add_argument(
        "--icon",
        action="append",
        default=[],
        metavar="FILE=SIZE",
        help="Additional icons to generate, e.g. app-icon.png=512 or tile.png=310x150. Can be used multiple times.",
    )
    parser.add_argument(
        "--no-defaults",
        action="store_true",
        help="Skip the default favicon-48.png / apple-touch-icon.png / logo-192.png outputs.",
    )
    parser.add_argument(
        "--manifest",
        action="store_true",
        help="Also (re)write site.webmanifest referencing the generated PNG icons.",
    )
    parser.add_argument("--manifest-name", default="Crxanode Docs", help="Full name in the manifest.")
    parser.add_argument(
        "--manifest-short-name",
        default="Crx Docs",
        help="Short PWA name in the manifest.",
    )
    parser.add_argument(
        "--manifest-file",
        default="site.webmanifest",
        help="Output filename for the manifest (inside the output directory).",
    )
    parser.add_argument(
        "--theme-color",
        default="#0f172a",
        help="Theme color to embed into the manifest (and browsers).",
    )
    parser.add_argument(
        "--background-color",
        default="#0f172a",
        help="Background color to embed into the manifest.",
    )
    parser.add_argument(
        "--description",
        default=(
            "Comprehensive documentation for Crxanode validator services: API endpoints, "
            "node setup guides, snapshots, and infrastructure best practices for Cosmos SDK chains."
        ),
        help="Description to reuse when writing the manifest.",
    )
    args = parser.parse_args()

    source_path = Path(args.input)
    if not source_path.is_file():
        raise SystemExit(f"Input file not found: {source_path}")

    output_dir = Path(args.output)
    icon_specs = _build_icon_matrix(args.icon, include_defaults=not args.no_defaults)
    if not icon_specs:
        raise SystemExit("No icon specs were provided. Use --icon or keep the defaults.")

    with Image.open(source_path) as img:
        base = img.convert("RGBA")
        generated: List[Tuple[str, Tuple[int, int]]] = []
        for filename, size in icon_specs:
            target = output_dir / filename
            _save_icon(base, target, size)
            generated.append((filename, size))
            print(f"[icon] {target} ({size[0]}x{size[1]})")

    if args.manifest:
        manifest_path = _write_manifest(
            output_dir=output_dir,
            manifest_name=args.manifest_name,
            manifest_short_name=args.manifest_short_name,
            theme_color=args.theme_color,
            background_color=args.background_color,
            description=args.description,
            icons=generated,
            manifest_file=args.manifest_file,
        )
        print(f"[manifest] {manifest_path}")


if __name__ == "__main__":
    main()

