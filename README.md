# local-voice-to-text-transcriber

A simple, local voice-to-text transcriber with a copy button, powered by [OpenAI Whisper large-v3](https://huggingface.co/openai/whisper-large-v3). Supports English and Polish.

## Architecture

- **Backend** (`server.py`): a small FastAPI server that loads `openai/whisper-large-v3` locally via `transformers` and exposes `POST /api/transcribe`. It also serves the frontend.
- **Frontend** (`static/`): plain HTML/CSS/JS. Records your microphone with `MediaRecorder`, uploads the clip to the backend, and shows the transcript with a **Copy** button.

Everything runs on your own machine — audio never leaves it except to your local server process.

## Requirements

- Python 3.10+
- [`ffmpeg`](https://ffmpeg.org/) on your PATH (used to decode the recorded audio)
- A GPU is strongly recommended (whisper-large-v3 is a ~1.5B parameter model); it also runs on CPU, just slower
- The first run downloads the model weights (~3 GB) from Hugging Face

## Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run

```bash
uvicorn server:app --reload
```

Then open http://localhost:8000, pick English or Polish, click **Start**, speak, click **Stop**, wait for the transcript, then **Copy**.
