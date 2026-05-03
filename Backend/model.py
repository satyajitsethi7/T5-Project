import torch
from transformers import T5Tokenizer, T5ForConditionalGeneration
import re

# t5-base is significantly better than t5-small for summarization
MODEL_NAME = "google/flan-t5-base"

device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")

print(f"Loading tokenizer: {MODEL_NAME} ...")
tokenizer = T5Tokenizer.from_pretrained(MODEL_NAME)

print(f"Loading model: {MODEL_NAME} ...")
model = T5ForConditionalGeneration.from_pretrained(MODEL_NAME)
model = model.to(device)
model.eval()

# Confirm model loaded correctly
total_params = sum(p.numel() for p in model.parameters()) / 1_000_000
print(f"Loaded model: {MODEL_NAME} | Parameters: {total_params:.1f}M | Device: {device}")



# Sanity check — t5-small ~60M params, t5-base ~250M params
if total_params < 100:
    print("WARNING: Model appears to be t5-small (< 100M params). Summarization quality will be poor.")
    print("Ensure t5-base downloaded correctly: pip install --upgrade transformers")





# Helpers

def preprocess_text(text: str) -> str:
    """Clean and normalize input text."""
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def _extract_key_sentences(text: str, max_sentences: int = 12) -> str:
    """
    Extractive pre-filter for long inputs.
    Keeps head, tail, and important middle sentences to stay within 512 tokens.
    Only triggers when input exceeds max_sentences.
    """
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    if len(sentences) <= max_sentences:
        return text

    head = sentences[:4]
    tail = sentences[-2:]
    middle_pool = sentences[4:-2]

    # Prioritize sentences with numbers or proper nouns
    important = [
        s for s in middle_pool
        if re.search(r'\d|[A-Z][a-z]+ [A-Z][a-z]+', s)
    ]

    remaining_slots = max_sentences - len(head) - len(tail)
    filler = important[:remaining_slots] if important else middle_pool[:remaining_slots]

    selected = head + filler + tail
    print(f"Extractive pre-filter: {len(sentences)} → {len(selected)} sentences")
    return ' '.join(selected)


# Per-length generation configs tuned for summarization


_SUMMARY_CONFIGS = {
    "small": dict(
        max_new_tokens=60,
        min_new_tokens=10,
        num_beams=4,
        length_penalty=0.8,
        no_repeat_ngram_size=3,
        repetition_penalty=1.3,
    ),
    "medium": dict(
        max_new_tokens=120,
        min_new_tokens=20,
        num_beams=5,
        length_penalty=1.0,
        no_repeat_ngram_size=3,
        repetition_penalty=1.3,
    ),
    "big": dict(
        max_new_tokens=200,
        min_new_tokens=40,
        num_beams=6,
        length_penalty=1.2,
        no_repeat_ngram_size=3,
        repetition_penalty=1.2,
    ),
}


def _postprocess(text: str) -> str:
    """Normalize and clean output text."""
    text = text.strip()
    if not text:
        return text
    text = text[0].upper() + text[1:]
    if not text.endswith(('.', '!', '?')):
        text += '.'
    return text



# Main generation function


def generate_text(input_text: str, length: str = "medium") -> str:
    """
    input_text : task-prefixed string (e.g., 'summarize: ...')
    length     : small | medium | big
    """
    if not input_text or len(input_text.split()) < 5:
        return "Input text is too short."

    processed = preprocess_text(input_text)
    # is_summary = processed.lower().startswith("summarize:")
    # Clean, handles any spacing variation
    is_summary = re.match(r'^summarize\s*:', processed.lower()) is not None
    input_word_count = 0

    if is_summary:
        body = processed[len("summarize:"):].strip()
        input_word_count = len(body.split())
        print(f"Summarize request | words: {input_word_count} | length param: {length}")

        # Extractive pre-filter for long inputs (DISABLED)
        # Stitching disjoint sentences ruins the text's narrative coherence, 
        # which causes T5 to fall back to just copying the first sentence!
        # It's much better to let the tokenizer truncate the continuous text to 512 tokens.
        # body = _extract_key_sentences(body)

        # Enriched prompt — guides T5 toward abstractive output
        processed = (
            "Summarize the following article into a concise, coherent paragraph "
            "covering the main ideas: " + body
        )


    inputs = tokenizer(
        processed,
        return_tensors="pt",
        truncation=True,
        max_length=512,
        padding=False,
    ).to(device)

    token_count = inputs["input_ids"].shape[1]
    print(f"Token count after encoding: {token_count}")

    if is_summary:
        cfg = _SUMMARY_CONFIGS.get(length, _SUMMARY_CONFIGS["medium"]).copy()

        # Dynamically scale min_new_tokens for short inputs
        # Prevents copy-paste behavior when input is small
        if input_word_count < 100:
            adjusted_min = min(cfg["min_new_tokens"], max(10, input_word_count // 4))
            print(f"Adjusted min_new_tokens: {cfg['min_new_tokens']} → {adjusted_min} (short input)")
            cfg["min_new_tokens"] = adjusted_min

    else:
        # Non-summary tasks: translate, qa, etc.
        cfg = dict(
            max_new_tokens={"small": 40, "medium": 80, "big": 120}.get(length, 80),
            num_beams=5,
            length_penalty=0.6,
            no_repeat_ngram_size=2,
            repetition_penalty=1.5,
            early_stopping=True,
        )

    print(f"Final generation config: {cfg}")

    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            early_stopping=True,
            do_sample=False,
            **cfg,
        )

    result = tokenizer.decode(outputs[0], skip_special_tokens=True)
    result = _postprocess(result)

    print(f"Output ({len(result.split())} words): {result[:120]}...")
    return result