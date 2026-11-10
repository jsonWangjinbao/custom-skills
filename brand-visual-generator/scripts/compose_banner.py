#!/usr/bin/env python3
"""Resize a generated banner and composite the correct official logo."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageOps


CANVAS_SIZE = (552, 326)
LOGO_POSITION = (30, 30)
LOGO_WIDTH = 98


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path, help="Generated banner without a logo")
    parser.add_argument("output", type=Path, help="Final PNG path")
    parser.add_argument("--mode", choices=("light", "dark"), required=True)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if args.input.resolve() == args.output.resolve():
        raise SystemExit("Input and output must be different files")

    skill_root = Path(__file__).resolve().parent.parent
    logo_name = "wanchen-logo-regular.png" if args.mode == "light" else "wanchen-logo-reverse.png"
    logo_path = skill_root / "assets" / logo_name
    if not logo_path.is_file():
        raise SystemExit(f"Missing official logo asset: {logo_path}")

    with Image.open(args.input) as source:
        canvas = ImageOps.fit(
            source.convert("RGB"),
            CANVAS_SIZE,
            method=Image.Resampling.LANCZOS,
            centering=(0.5, 0.5),
        ).convert("RGBA")

    with Image.open(logo_path) as logo_source:
        logo = logo_source.convert("RGBA")
        logo_height = round(logo.height * LOGO_WIDTH / logo.width)
        logo = logo.resize((LOGO_WIDTH, logo_height), Image.Resampling.LANCZOS)

    canvas.alpha_composite(logo, LOGO_POSITION)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(args.output, format="PNG", optimize=True)

    with Image.open(args.output) as check:
        if check.size != CANVAS_SIZE:
            raise SystemExit(f"Unexpected final size: {check.size}")


if __name__ == "__main__":
    main()
