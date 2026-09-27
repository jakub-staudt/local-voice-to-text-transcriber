const languageSelect = document.getElementById("language");
const micBtn = document.getElementById("micBtn");
const micLabel = document.getElementById("micLabel");
const statusEl = document.getElementById("status");
const transcriptEl = document.getElementById("transcript");
const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");
const unsupportedEl = document.getElementById("unsupported");

let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;

if (!navigator.mediaDevices || !window.MediaRecorder) {
  unsupportedEl.hidden = false;
  micBtn.disabled = true;
} else {
  micBtn.addEventListener("click", () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  });
}

async function startRecording() {
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    statusEl.textContent = `Microphone error: ${err.message}`;
    return;
  }

  audioChunks = [];
  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) audioChunks.push(event.data);
  };

  mediaRecorder.onstop = async () => {
    stream.getTracks().forEach((track) => track.stop());
    const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType });
    await sendForTranscription(audioBlob);
  };

  mediaRecorder.start();
  isRecording = true;
  micBtn.classList.add("recording");
  micLabel.textContent = "Stop";
  statusEl.textContent = `Recording (${languageSelect.selectedOptions[0].text})...`;
}

function stopRecording() {
  isRecording = false;
  micBtn.classList.remove("recording");
  micLabel.textContent = "Start";
  micBtn.disabled = true;
  statusEl.textContent = "Transcribing...";
  mediaRecorder.stop();
}

async function sendForTranscription(audioBlob) {
  try {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");
    formData.append("language", languageSelect.value);

    const response = await fetch("/api/transcribe", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(detail || `Server error ${response.status}`);
    }

    const data = await response.json();
    const existing = transcriptEl.value ? transcriptEl.value + " " : "";
    transcriptEl.value = (existing + data.text).trim();
    statusEl.textContent = "Idle";
  } catch (err) {
    statusEl.textContent = `Error: ${err.message}`;
  } finally {
    micBtn.disabled = false;
  }
}

copyBtn.addEventListener("click", async () => {
  const text = transcriptEl.value;
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    transcriptEl.select();
    document.execCommand("copy");
  }
  const original = copyBtn.textContent;
  copyBtn.textContent = "Copied!";
  setTimeout(() => {
    copyBtn.textContent = original;
  }, 1200);
});

clearBtn.addEventListener("click", () => {
  transcriptEl.value = "";
});
