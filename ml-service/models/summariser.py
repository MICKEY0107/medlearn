import re
from typing import List, Dict


def _clean(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "")).strip()


def _split_sentences(text: str) -> List[str]:
    return [s.strip() for s in re.split(r"(?<=[.!?])\s+", _clean(text)) if s.strip()]


def _clamp_words(text: str, max_words: int) -> str:
    words = _clean(text).split()
    if len(words) <= max_words:
        return _clean(text)
    return " ".join(words[:max_words]) + "…"


def _infer_methodology(title: str, abstract: str) -> str:
    text = f"{title} {abstract}".lower()
    if "meta-analysis" in text:
        return "Meta-Analysis"
    if "systematic review" in text:
        return "Systematic Review"
    if any(x in text for x in ["randomized", "randomised", "rct"]):
        return "RCT"
    if any(x in text for x in ["cohort", "prospective", "retrospective"]):
        return "Cohort Study"
    if any(x in text for x in ["case report", "case series"]):
        return "Case Study"
    if any(x in text for x in ["deep learning", "neural network", "machine learning", "computational"]):
        return "Computational"
    if any(x in text for x in ["trial", "experimental", "intervention"]):
        return "Experimental"
    return "Other"


def _key_findings(abstract: str) -> List[str]:
    sentences = _split_sentences(abstract)
    preferred = [
        s for s in sentences
        if re.search(r"found|showed|demonstrated|reduced|improved|sensitivity|specificity|auc|accuracy|significant|increase|decrease", s, re.I)
    ]
    pool = preferred or sentences
    return [_clamp_words(s, 22) for s in pool[:4]]


def _study_population(abstract: str) -> str:
    for sentence in _split_sentences(abstract):
        if re.search(r"\d[\d,\.]*\s+(patients?|participants?|subjects?|adults?|children|images?|studies?|cases?|sites?|records?|samples?)", sentence, re.I):
            return _clamp_words(sentence, 24)
    return "The abstract does not provide a single clear study-population sentence."


def _limitations(abstract: str) -> List[str]:
    explicit = []
    for sentence in _split_sentences(abstract):
        if re.search(r"limitation|limited|single-center|single centre|small sample|retrospective|short follow-up|short follow up|bias|external validation", sentence, re.I):
            explicit.append(_clamp_words(sentence, 20))
    if explicit:
        return explicit[:2]
    return [
        "The abstract alone does not describe every possible source of bias or confounding.",
        "Some methodological detail may only be available in the full paper rather than the abstract.",
    ]


class HeuristicSummariser:
    def summarise(self, abstract: str, title: str, level: str = "student") -> Dict[str, object]:
        sentences = _split_sentences(abstract)
        methodology_type = _infer_methodology(title, abstract)
        if not sentences:
            summary = f"This paper examines {title}."
        else:
            word_cap = 18 if level == "student" else 24
            count = 2 if level == "student" else 3
            summary = " ".join(_clamp_words(s, word_cap) for s in sentences[:count])

        methodology_detail = next(
            (_clamp_words(s, 28) for s in sentences if re.search(r"trial|cohort|review|meta-analysis|systematic review|prospective|retrospective|multisite|single-center|follow-up|months|years", s, re.I)),
            _clamp_words(f"{methodology_type} examining {title}.", 28),
        )

        return {
            "plain_summary": summary,
            "key_findings": _key_findings(abstract),
            "methodology_type": methodology_type,
            "methodology_detail": methodology_detail,
            "limitations": _limitations(abstract),
            "study_population": _study_population(abstract),
        }


def load_summariser() -> HeuristicSummariser:
    return HeuristicSummariser()
