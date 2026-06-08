"""Whisper ASR service — wraps the `whisper-cli` (whisper.cpp ROCm) binary.

We deliberately avoid the Python faster-whisper / openai-whisper stack here
because the host uses an AMD R9700 GPU (ROCm), not NVIDIA CUDA. whisper.cpp
ships first-class ROCm/HIPBLAS support via the `whisper-cli` binary, which we
shell out to. This keeps the image small, the dependency tree simple, and the
GPU path reliable on AMD.
"""

import json
import logging
import os
import subprocess
import tempfile
from pathlib import Path

logger = logging.getLogger(__name__)

WHISPER_CPP_BIN = os.getenv("WHISPER_CPP_BIN", "/app/whisper.cpp/build/bin/whisper-cli")
WHISPER_MODEL_PATH = os.getenv(
    "WHISPER_MODEL_PATH", "/app/whisper.cpp/models/ggml-large-v3.bin"
)
# Tweak via env if you want a different model: large-v3, medium.en, small.en, …
WHISPER_LANGUAGE = os.getenv("WHISPER_LANGUAGE", "en")
WHISPER_THREADS = os.getenv("WHISPER_THREADS", "8")
# Beam size. 1 = greedy (fastest). 5 = default (more accurate). Indian-English
# non-fluent speech benefits from a small beam, but speed matters most, so 1.
WHISPER_BEAM_SIZE = os.getenv("WHISPER_BEAM_SIZE", "1")

# Brief context prompt that primes whisper for English (helps it stay on
# language when the speaker is not very fluent / code-switches).
INITIAL_PROMPT = (
    "The following is a clear English reading practice session by a student. "
    "Please transcribe the spoken English words accurately."
)


def _check_binary() -> None:
    if not Path(WHISPER_CPP_BIN).exists():
        raise RuntimeError(
            f"whisper.cpp binary not found at {WHISPER_CPP_BIN}. "
            "Did the backend image build successfully?"
        )
    if not Path(WHISPER_MODEL_PATH).exists():
        raise RuntimeError(
            f"Whisper model not found at {WHISPER_MODEL_PATH}. "
            "Did the download step in the Dockerfile complete?"
        )


def transcribe_audio(file_path: str) -> str:
    """Transcribe an audio file using whisper.cpp on ROCm and return plain text.

    Returns only the concatenated segment text, no timestamps / JSON.
    """
    _check_binary()

    # --- FFMPEG CONVERSION ---
    # whisper.cpp requires 16kHz, 16-bit Mono WAV files. We convert the incoming WebM here.
    wav_path = file_path + ".wav"
    try:
        logger.info("Converting audio to 16kHz WAV via FFmpeg...")
        subprocess.run([
            "ffmpeg", "-y", "-i", file_path,
            "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le",
            wav_path
        ], check=True, capture_output=True, text=True)
    except subprocess.CalledProcessError as e:
        logger.error("FFmpeg stderr: %s", e.stderr)
        raise RuntimeError(f"Audio conversion failed: {e.stderr.strip()}") from e

    # whisper.cpp can emit JSON via -oj; we parse it for robustness and to drop
    # any non-speech tokens / speaker labels.
    with tempfile.NamedTemporaryFile(
        suffix=".json", delete=False
    ) as out_json_file:
        out_json_path = out_json_file.name

    cmd = [
        WHISPER_CPP_BIN,
        "-m", WHISPER_MODEL_PATH,
        "-f", wav_path,          # <-- NOW PASSING THE CONVERTED WAV FILE
        "-l", WHISPER_LANGUAGE,
        "-t", WHISPER_THREADS,
        "-bs", WHISPER_BEAM_SIZE,
        "--prompt", INITIAL_PROMPT,
        "-oj",               # output JSON
        "-of", out_json_path, # write JSON to this base path (adds .json)
        "-np",               # no prints (we want clean stdout/stderr handling)
    ]

    logger.info("Running whisper.cpp: %s", " ".join(cmd))
    try:
        proc = subprocess.run(
            cmd,
            check=True,
            capture_output=True,
            text=True,
            timeout=600,  # 10 min hard cap — should never hit this on 5-min clips
        )
    except subprocess.CalledProcessError as e:
        logger.error("whisper.cpp stderr: %s", e.stderr)
        raise RuntimeError(f"whisper.cpp failed (exit {e.returncode}): {e.stderr.strip()}") from e
    except subprocess.TimeoutExpired as e:
        raise RuntimeError("whisper.cpp timed out after 600s") from e

    # whisper.cpp writes the .json to {base}.json
    json_path = out_json_path + ".json"
    try:
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except FileNotFoundError as e:
        logger.error("whisper.cpp stdout: %s", proc.stdout)
        logger.error("whisper.cpp stderr: %s", proc.stderr)
        raise RuntimeError("whisper.cpp did not produce expected JSON output") from e
    finally:
        # Clean up temp files (base + .json + any side files)
        for p in (out_json_path, json_path):
            try:
                os.unlink(p)
            except FileNotFoundError:
                pass

    segments = data.get("transcription") or data.get("segments") or []
    # Schema A: {"transcription": [{"text": "..."}]}
    # Schema B: {"segments": [{"text": "..."}]}
    texts = []
    if isinstance(segments, list) and segments and isinstance(segments[0], dict):
        for seg in segments:
            t = (seg.get("text") or "").strip()
            if t:
                texts.append(t)
    elif isinstance(segments, str):
        # Some builds collapse it
        texts.append(segments.strip())

    return " ".join(texts).strip()
