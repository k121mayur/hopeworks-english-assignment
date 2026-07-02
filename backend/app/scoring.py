"""Reading accuracy scoring using Levenshtein distance."""

import re
import string
from dataclasses import dataclass
from typing import List, Tuple

from Levenshtein import editops


@dataclass
class ScoringResult:
    accuracy: float  # 0 – 100
    correct_words: int
    total_words: int
    errors: List[Tuple[int, str, str]]  # (position, expected_word, spoken_word)


def normalize_text(text: str) -> str:
    """Lowercase, strip punctuation, collapse whitespace."""
    text = text.lower()
    text = text.translate(str.maketrans("", "", string.punctuation))
    text = re.sub(r"\s+", " ", text).strip()
    return text


def score_reading(original: str, transcription: str) -> ScoringResult:
    """Compare original story text with student transcription.

    Uses Levenshtein edit-distance at the word level to identify
    insertions, deletions, and substitutions.
    """
    orig_words = normalize_text(original).split()
    trans_words = normalize_text(transcription).split()

    if not orig_words:
        return ScoringResult(accuracy=0.0, correct_words=0, total_words=0, errors=[])

    ops = editops(orig_words, trans_words)

    errors: List[Tuple[int, str, str]] = []
    error_positions = set()

    for op_type, src_pos, dst_pos in ops:
        if op_type == "replace":
            errors.append((src_pos, orig_words[src_pos], trans_words[dst_pos]))
            error_positions.add(src_pos)
        elif op_type == "delete":
            errors.append((src_pos, orig_words[src_pos], ""))
            error_positions.add(src_pos)
        elif op_type == "insert":
            # Inserted words don't correspond to an original position
            errors.append((dst_pos, "", trans_words[dst_pos]))

    total = len(orig_words)
    correct = total - len([p for p in error_positions])
    accuracy = (correct / total) * 100 if total else 0.0

    return ScoringResult(
        accuracy=round(accuracy, 2),
        correct_words=correct,
        total_words=total,
        errors=errors,
    )
