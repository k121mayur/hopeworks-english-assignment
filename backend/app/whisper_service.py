"""Whisper ASR service — singleton model loader + transcription."""

import os
import logging

import whisper

logger = logging.getLogger(__name__)

WHISPER_MODEL_NAME = os.getenv("WHISPER_MODEL", "small")

_model = None


def _get_model():
    """Load the Whisper model lazily (once)."""
    global _model
    if _model is None:
        logger.info("Loading Whisper '%s' model — this may take a moment …", WHISPER_MODEL_NAME)
        _model = whisper.load_model(WHISPER_MODEL_NAME)
        logger.info("Whisper model loaded successfully.")
    return _model


def transcribe_audio(file_path: str) -> str:
    """Transcribe an audio file and return the plain text."""
    model = _get_model()
    result = model.transcribe(file_path, language="en")
    return result.get("text", "").strip()
