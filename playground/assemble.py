"""Embed a JSON result bundle in the standalone HTML template."""

import argparse
import json
from pathlib import Path


def assemble(template: Path, data: Path, output: Path) -> None:
    text = template.read_text(encoding="utf-8")
    marker = "/*__DATA__*/"
    if text.count(marker) != 1:
        raise ValueError("The template must contain exactly one data marker")
    payload = json.dumps(
        json.loads(data.read_text(encoding="utf-8")), separators=(",", ":")
    ).replace("</", "<\\/")
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(text.replace(marker, payload), encoding="utf-8")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("template", type=Path)
    parser.add_argument("data", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    assemble(args.template, args.data, args.output)
