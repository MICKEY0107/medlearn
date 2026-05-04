from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import uvicorn

from models.summariser import load_summariser
from models.classifier import load_classifier
from models.embedder import load_embedder

app = FastAPI(title="MedLearn ML Service")


class SummariseRequest(BaseModel):
    abstract: str
    title: str
    level: str = "student"


class ClassifyRequest(BaseModel):
    title: str
    abstract: str


class EmbedRequest(BaseModel):
    text: str


class SummariseResponse(BaseModel):
    plain_summary: str
    key_findings: List[str]
    methodology_type: str
    methodology_detail: str
    limitations: List[str]
    study_population: str


class ClassifyResponse(BaseModel):
    tags: List[str]
    methodology_type: str
    confidence: float


class EmbedResponse(BaseModel):
    embedding: List[float]
    dimensions: int


summariser_model = None
classifier_model = None
embedder_model = None


@app.on_event("startup")
async def load_models():
    global summariser_model, classifier_model, embedder_model
    summariser_model = load_summariser()
    classifier_model = load_classifier()
    embedder_model = load_embedder()


@app.get("/health")
def health():
    return {
        "status": "ok",
        "models_loaded": {
            "summariser": summariser_model is not None,
            "classifier": classifier_model is not None,
            "embedder": embedder_model is not None,
        },
    }


@app.post("/summarise", response_model=SummariseResponse)
def summarise(req: SummariseRequest):
    return summariser_model.summarise(req.abstract, req.title, req.level)


@app.post("/classify", response_model=ClassifyResponse)
def classify(req: ClassifyRequest):
    return classifier_model.classify(req.title, req.abstract)


@app.post("/embed", response_model=EmbedResponse)
def embed(req: EmbedRequest):
    embedding = embedder_model.encode(req.text)
    return {"embedding": embedding.tolist(), "dimensions": len(embedding)}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
