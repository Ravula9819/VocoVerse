// TEXT TO SPEECH
const txtInput = document.getElementById('txt');
const voiceSelect = document.getElementById('voiceSelect');
const rate = document.getElementById('rate');
const rateValue = document.getElementById('rateValue');
const pitch = document.getElementById('pitch');
const pitchValue = document.getElementById('pitchValue');
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const downloadBtn = document.getElementById('downloadBtn');
const fileInput = document.getElementById('fileInput');

let synth = window.speechSynthesis;
let voices = [];
let utterance;
let isPaused = false;

function populateVoices() {
  voices = synth.getVoices();
  voiceSelect.innerHTML = '';
  voices.forEach((voice) => {
    const option = document.createElement('option');
    option.textContent = `${voice.name} (${voice.lang})`;
    option.value = voice.name;
    voiceSelect.appendChild(option);
  });
}

populateVoices();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoices;
}

playBtn.addEventListener('click', () => {
  if (synth.speaking) {
    alert('Speech is already in progress.');
    return;
  }
  if (txtInput.value.trim() === '') {
    alert('Please enter text to speak.');
    return;
  }

  utterance = new SpeechSynthesisUtterance(txtInput.value);
  const selectedVoice = voices.find((v) => v.name === voiceSelect.value);
  if (selectedVoice) utterance.voice = selectedVoice;
  utterance.rate = rate.value;
  utterance.pitch = pitch.value;

  utterance.onend = () => {
    pauseBtn.style.display = 'none';
    resumeBtn.style.display = 'none';
    playBtn.style.display = 'inline-block';
  };

  synth.speak(utterance);
  playBtn.style.display = 'none';
  pauseBtn.style.display = 'inline-block';
  resumeBtn.style.display = 'none';
});

pauseBtn.addEventListener('click', () => {
  if (synth.speaking && !synth.paused) {
    synth.pause();
    pauseBtn.style.display = 'none';
    resumeBtn.style.display = 'inline-block';
  }
});

resumeBtn.addEventListener('click', () => {
  if (synth.paused) {
    synth.resume();
    resumeBtn.style.display = 'none';
    pauseBtn.style.display = 'inline-block';
  }
});

rate.addEventListener('input', () => {
  rateValue.textContent = rate.value;
});

pitch.addEventListener('input', () => {
  pitchValue.textContent = pitch.value;
});

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (file && file.type === 'text/plain') {
    const reader = new FileReader();
    reader.onload = (e) => {
      txtInput.value = e.target.result;
    };
    reader.readAsText(file);
  } else {
    alert('Please upload a valid .txt file');
  }
});

// Download text content (not audio)
downloadBtn.addEventListener('click', () => {
  const text = txtInput.value;
  if (!text.trim()) {
    alert('There is no text to download.');
    return;
  }
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'speech-text.txt';
  a.click();
  URL.revokeObjectURL(url);
});

// SPEECH TO TEXT
const startRecordBtn = document.getElementById('startRecord');
const stopRecordBtn = document.getElementById('stopRecord');
const outputText = document.getElementById('outputText');
const copyTextBtn = document.getElementById('copyTextBtn');
const clearTextBtn = document.getElementById('clearTextBtn');
const downloadTextBtn = document.getElementById('downloadTextBtn');
const sttLangSelect = document.getElementById('sttLangSelect');

let recognition;
let isRecording = false;

if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
  alert('Speech Recognition API not supported in this browser.');
} else {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = sttLangSelect.value;

  recognition.onresult = (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    outputText.value = transcript;
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error', event.error);
  };

  recognition.onend = () => {
    if (isRecording) recognition.start(); // auto-restart for continuous
  };
}

sttLangSelect.addEventListener('change', () => {
  if (recognition) recognition.lang = sttLangSelect.value;
});

startRecordBtn.addEventListener('click', () => {
  if (recognition && !isRecording) {
    recognition.lang = sttLangSelect.value;
    recognition.start();
    isRecording = true;
    startRecordBtn.style.display = 'none';
    stopRecordBtn.style.display = 'inline-block';
  }
});

stopRecordBtn.addEventListener('click', () => {
  if (recognition && isRecording) {
    recognition.stop();
    isRecording = false;
    startRecordBtn.style.display = 'inline-block';
    stopRecordBtn.style.display = 'none';
  }
});

copyTextBtn.addEventListener('click', () => {
  if (outputText.value.trim()) {
    navigator.clipboard.writeText(outputText.value);
    alert('Copied to clipboard!');
  }
});

clearTextBtn.addEventListener('click', () => {
  outputText.value = '';
});

downloadTextBtn.addEventListener('click', () => {
  if (!outputText.value.trim()) {
    alert('No transcript to download.');
    return;
  }
  const blob = new Blob([outputText.value], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'transcript.txt';
  a.click();
  URL.revokeObjectURL(url);
});