import re
from typing import Dict, List


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


class HeuristicClassifier:
    RULES = [
        (r"retina|retinopathy|ophthalm", ["ophthalmology", "medical imaging"]),
        (r"deep learning|neural network|machine learning|artificial intelligence|llm", ["artificial intelligence", "machine learning"]),
        (r"cardio|ecg|atrial|arrhythm|heart", ["cardiology"]),
        (r"cancer|oncology|tumou?r", ["oncology"]),
        (r"genomic|gene|crispr|mutation", ["genomics"]),
        (r"microbiome|gut|bacteria", ["microbiome"]),
        (r"sepsis|icu|critical care", ["critical care"]),
        (r"trial|randomized|randomised|rct", ["clinical trial"]),
        (r"meta-analysis|systematic review", ["evidence synthesis"]),
        (r"cohort|prospective|retrospective", ["cohort study"]),
    ]

    def classify(self, title: str, abstract: str) -> Dict[str, object]:
        text = f"{title} {abstract}".lower()
        tags: List[str] = []
        for pattern, values in self.RULES:
            if re.search(pattern, text):
                for value in values:
                    if value not in tags:
                        tags.append(value)
        if not tags:
            tags = [word for word in re.findall(r"[a-z]{5,}", title.lower())[:4]]
        return {
            "tags": tags[:8],
            "methodology_type": _infer_methodology(title, abstract),
            "confidence": 0.72,
        }


def load_classifier() -> HeuristicClassifier:
    return HeuristicClassifier()
