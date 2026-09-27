# local-voice-to-text-transcriber

A simple, local, browser-based voice-to-text transcriber with a copy button. Supports English and Polish.

## Usage

Open `index.html` in Chrome or Edge (browsers that support the Web Speech API), pick a language, click **Start**, and speak. Click **Stop** when done, then **Copy** to copy the transcript to your clipboard.

No build step, server, or API key required — everything runs client-side using the browser's built-in `SpeechRecognition` API.

## Note on model choice

This uses the browser's native Web Speech API rather than a hosted speech model, since it needs to stay simple and fully local/client-side. (For reference, Qwen3-TTS is a text-to-speech model — it generates audio from text — so it isn't applicable to a speech-to-text transcriber.)
