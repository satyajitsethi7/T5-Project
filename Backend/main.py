from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from langdetect import detect, LangDetectException
from deep_translator import GoogleTranslator

from model import generate_text, model, device, MODEL_NAME

from nltk.sentiment import SentimentIntensityAnalyzer
import nltk


app = FastAPI(title="Unified NLP Backend Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

nltk.download("vader_lexicon")
sia = SentimentIntensityAnalyzer()

VALID_TASKS = {"sentiment", "translate", "summarize", "qa"}
VALID_LENGTHS = {"small", "medium", "big"}


class NLPRequest(BaseModel):
    task: str
    text: str
    length: Optional[str] = "medium"  # small | medium | big


def is_english(text: str) -> bool:
    try:
        return detect(text) == "en"
    except LangDetectException:
        return False


def analyze_sentiment(text: str) -> str:
    scores = sia.polarity_scores(text)
    if scores["compound"] >= 0.1:
        return "positive"
    elif scores["compound"] <= -0.1:
        return "negative"
    else:
        return "neutral"



# Routes

@app.get("/health")
def health():
    """Quick health check — confirms the server and model are running."""
    return {"status": "ok", "model": "t5-base"}


@app.post("/predict")
def predict(req: NLPRequest):

    # --- Global input validation ---
    if not req.text or not req.text.strip():
        return {"error": "Input text cannot be empty."}

    if req.task not in VALID_TASKS:
        return {
            "error": f"Unsupported task '{req.task}'.",
            "supported_tasks": sorted(VALID_TASKS),
        }

    length = req.length if req.length in VALID_LENGTHS else "medium"
    if req.length not in VALID_LENGTHS:
        print(f"Invalid length '{req.length}' — falling back to 'medium'")

    # --- Sentiment ---
    if req.task == "sentiment":
        word_count = len(req.text.split())
        if word_count < 3:
            return {"error": "Text is too short for sentiment analysis. Please provide at least 3 words."}

        return {
            "task": "sentiment",
            "input": req.text,
            "output": analyze_sentiment(req.text),
        }
    # TRANSLATE 
    if req.task == "translate":
        if not is_english(req.text):
            return {"error": "Translation supports English input only."}

        word_count = len(req.text.split())
        if word_count < 2:
            return {"error": "Text is too short to translate. Please provide at least 2 words."}

        try:
            result = GoogleTranslator(source='en', target='or').translate(req.text)
        except Exception as e:
            return {"error": f"Translation failed: {str(e)}"}

        return {
            "task": "translate",
            "source_language": "English",
            "target_language": "Odia",
            "output": result,
        }


    # Summarize
    if req.task == "summarize":
        word_count = len(req.text.split())

        if word_count < 30:
            return {
                "error": (
                    f"Text too short to summarize ({word_count} words). "
                    "Please provide at least 30 words."
                )
            }

        if word_count > 5000:
            return {
                "error": (
                    f"Text too long ({word_count} words). "
                    "Please provide at most 5000 words."
                )
            }

        prompt = "summarize: " + req.text
        result = generate_text(prompt, length)

        # Detect copy-paste failure — output should differ meaningfully from input
        input_words = set(req.text.lower().split())
        output_words = set(result.lower().split())
        overlap = len(input_words & output_words) / max(len(input_words), 1)

        warning = None
        if overlap > 0.85:
            warning = (
                "Output closely mirrors the input. "
                "This may indicate the model is too small or the input is already very short. "
                "Try upgrading to t5-base or using a longer input."
            )
            print(f" High overlap detected: {overlap:.0%}")

        response = {
            "task": "summarize",
            "length": length,
            "word_count": word_count,
            "output": result,
        }
        if warning:
            response["warning"] = warning

        return response

    # QA
    if req.task == "qa":
        word_count = len(req.text.split())
        if word_count < 5:
            return {"error": "Text is too short for QA. Please provide at least 5 words."}

        # prompt = "generate question: " + req.text
        prompt = "Generate a meaningful question from the following text: " + req.text
        result = generate_text(prompt)

        return {
            "task": "qa",
            "output": result,
        }
    @app.get("/model-info")
    def model_info():
        total_params = sum(p.numel() for p in model.parameters()) / 1_000_000
        return {
        "model_name": MODEL_NAME,
        "parameters_millions": round(total_params, 1),
        "expected": "247.6M for t5-base, 60.5M for t5-small",
        "device": str(device),
        }