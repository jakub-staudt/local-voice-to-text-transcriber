from contextlib import asynccontextmanager

import torch
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.staticfiles import StaticFiles
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline

MODEL_ID = "openai/whisper-large-v3"

WHISPER_LANGUAGES = {
    "en": "english",
    "pl": "polish",
}

model_state = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    device = "cuda:0" if torch.cuda.is_available() else "cpu"
    torch_dtype = torch.float16 if torch.cuda.is_available() else torch.float32

    model = AutoModelForSpeechSeq2Seq.from_pretrained(
        MODEL_ID,
        torch_dtype=torch_dtype,
        low_cpu_mem_usage=True,
        use_safetensors=True,
    )
    model.to(device)
    processor = AutoProcessor.from_pretrained(MODEL_ID)

    model_state["pipe"] = pipeline(
        "automatic-speech-recognition",
        model=model,
        tokenizer=processor.tokenizer,
        feature_extractor=processor.feature_extractor,
        torch_dtype=torch_dtype,
        device=device,
    )
    yield
    model_state.clear()


app = FastAPI(lifespan=lifespan)


@app.post("/api/transcribe")
async def transcribe(audio: UploadFile = File(...), language: str = Form("en")):
    whisper_language = WHISPER_LANGUAGES.get(language)
    if whisper_language is None:
        raise HTTPException(status_code=400, detail=f"Unsupported language: {language}")

    audio_bytes = await audio.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Empty audio upload")

    result = model_state["pipe"](
        audio_bytes,
        generate_kwargs={"language": whisper_language, "task": "transcribe"},
    )
    return {"text": result["text"].strip()}


app.mount("/", StaticFiles(directory="static", html=True), name="static")
