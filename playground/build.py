"""Rebuild the portable demo and its static PAIR asset using only Python 3."""

import argparse
import os
from pathlib import Path
import shutil
import subprocess
import sys


def main() -> None:
    root = Path(__file__).resolve().parent
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--input",
        choices=("playground_data.json", "playground_data_bs1.json"),
        default="playground_data.json",
        help="Evaluation bundle; defaults to batches of 512 vehicles.",
    )
    args = parser.parse_args()
    env = {**os.environ, "PYTHONUTF8": "1"}
    for command in (
        ["convert.py", args.input],
        ["add_training.py", "data_real.json", "training_clients.json", "data_real.json"],
        ["assemble.py", "template.html", "data_real.json", "playground.html"],
    ):
        subprocess.run([sys.executable, *command], cwd=root, env=env, check=True)

    public = root.parent / "public" / "playground" / "index.html"
    public.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(root / "playground.html", public)
    print(f"Built {public}")


if __name__ == "__main__":
    main()
