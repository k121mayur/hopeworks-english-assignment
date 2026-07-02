"""Whisper ASR service — singleton model loader + transcription using faster-whisper."""

import os
import logging

from faster_whisper import WhisperModel

logger = logging.getLogger(__name__)

WHISPER_MODEL_NAME = os.getenv("WHISPER_MODEL", "small")

_model = None


def _get_model():
    """Load the Whisper model lazily (once)."""
    global _model
    if _model is None:
        logger.info("Loading Whisper '%s' model — this may take a moment …", WHISPER_MODEL_NAME)
        _model = WhisperModel(WHISPER_MODEL_NAME, device="cpu", compute_type="int8")
        logger.info("Whisper model loaded successfully.")
    return _model


def transcribe_audio(file_path: str) -> str:
    """Transcribe an audio file and return the plain text."""
    model = _get_model()
    segments, _info = model.transcribe(file_path, language="en")
    return " ".join(segment.text.strip() for segment in segments)
