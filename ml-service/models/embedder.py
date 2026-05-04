import hashlib
import numpy as np
import re


class HeuristicEmbedder:
    def __init__(self, dimensions: int = 64):
        self.dimensions = dimensions

    def encode(self, text: str) -> np.ndarray:
        vec = np.zeros(self.dimensions, dtype=float)
        tokens = re.findall(r"[a-z0-9-]+", (text or "").lower())
        if not tokens:
            return vec
        for token in tokens:
            idx = int(hashlib.sha256(token.encode("utf-8")).hexdigest(), 16) % self.dimensions
            vec[idx] += 1.0
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec


def load_embedder() -> HeuristicEmbedder:
    return HeuristicEmbedder()
