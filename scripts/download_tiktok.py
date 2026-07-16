#!/usr/bin/env python3
"""
Download a TikTok video using yt-dlp.

Install yt-dlp first:
  pip install yt-dlp

Optional (for best quality merge + metadata):
  winget install Gyan.FFmpeg
"""

from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

DOWNLOAD_DIR = Path(__file__).resolve().parent / "downloads"


def find_yt_dlp() -> str:
    """Return yt-dlp executable path, or raise if missing."""
    cmd = shutil.which("yt-dlp")
    if cmd:
        return cmd

    # Fallback: python -m yt_dlp (when installed via pip)
    try:
        import yt_dlp  # noqa: F401
    except ImportError as exc:
        raise SystemExit(
            "yt-dlp not found.\n"
            "Install it with: pip install yt-dlp\n"
            "Or download from: https://github.com/yt-dlp/yt-dlp"
        ) from exc

    return f"{sys.executable} -m yt_dlp"


def prompt_url() -> str:
    url = input("Paste TikTok link: ").strip()
    if not url:
        raise SystemExit("No URL provided.")
    if "tiktok.com" not in url and "vm.tiktok.com" not in url:
        print("Warning: this doesn't look like a TikTok URL, trying anyway...")
    return url


def download(url: str) -> None:
    DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)

    yt_dlp = find_yt_dlp()
    output_template = str(DOWNLOAD_DIR / "%(title)s [%(id)s].%(ext)s")

    args = [
        "--no-playlist",
        "-o",
        output_template,
        url,
    ]

    if shutil.which("ffmpeg"):
        args.insert(0, "--embed-metadata")
    else:
        print("Note: ffmpeg not found — skipping metadata embed (video still downloads fine).")
        print("      Install ffmpeg: winget install Gyan.FFmpeg\n")

    if " -m " in yt_dlp:
        command = yt_dlp.split() + args
    else:
        command = [yt_dlp, *args]

    print(f"\nSaving to: {DOWNLOAD_DIR}\n")
    subprocess.run(command, check=True)
    print("\nDone!")


def main() -> None:
    if len(sys.argv) > 1:
        url = sys.argv[1].strip()
    else:
        url = prompt_url()

    try:
        download(url)
    except subprocess.CalledProcessError as exc:
        raise SystemExit(f"Download failed (exit code {exc.returncode}).") from exc
    except KeyboardInterrupt:
        raise SystemExit("\nCancelled.")


if __name__ == "__main__":
    main()
