const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const languageSelect = document.getElementById("language");
const micBtn = document.getElementById("micBtn");
const micLabel = document.getElementById("micLabel");
const statusEl = document.getElementById("status");
const transcriptEl = document.getElementById("transcript");
const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");
const unsupportedEl = document.getElementById("unsupported");

if (!SpeechRecognition) {
  unsupportedEl.hidden = false;
  micBtn.disabled = true;
} else {
  let recognition = null;
  let isRecording = false;
  let finalText = "";

  function createRecognition() {
    const r = new SpeechRecognition();
    r.lang = languageSelect.value;
    r.continuous = true;
    r.interimResults = true;

    r.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const chunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += chunk + " ";
        } else {
          interim += chunk;
        }
      }
      transcriptEl.value = (finalText + interim).trim();
    };

    r.onerror = (event) => {
      statusEl.textContent = `Error: ${event.error}`;
    };

    r.onend = () => {
      if (isRecording) {
        r.start();
      } else {
        statusEl.textContent = "Idle";
      }
    };

    return r;
  }

  micBtn.addEventListener("click", () => {
    if (!isRecording) {
      finalText = transcriptEl.value ? transcriptEl.value + " " : "";
      recognition = createRecognition();
      recognition.start();
      isRecording = true;
      micBtn.classList.add("recording");
      micLabel.textContent = "Stop";
      statusEl.textContent = `Listening (${languageSelect.selectedOptions[0].text})...`;
    } else {
      isRecording = false;
      recognition.stop();
      micBtn.classList.remove("recording");
      micLabel.textContent = "Start";
      statusEl.textContent = "Idle";
    }
  });

  languageSelect.addEventListener("change", () => {
    if (isRecording) {
      isRecording = false;
      recognition.stop();
      micBtn.classList.remove("recording");
      micLabel.textContent = "Start";
    }
  });
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
