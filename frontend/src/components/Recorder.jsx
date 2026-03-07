import { useState, useRef, useEffect } from 'react';

export default function Recorder({ onRecorded }) {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [timer, setTimer] = useState(0);
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);
  const interval = useRef(null);

  useEffect(() => () => clearInterval(interval.current), []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      chunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        onRecorded?.(blob);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.current.start();
      setRecording(true);
      setTimer(0);
      interval.current = setInterval(() => setTimer((t) => t + 1), 1000);
    } catch {
      alert('Microphone access is required to record audio.');
    }
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setRecording(false);
    clearInterval(interval.current);
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="glass-card p-6 flex flex-col items-center gap-5">
      <h3 className="text-sm font-semibold text-text-secondary tracking-wide uppercase">Audio Recorder</h3>

      {/* Timer display */}
      <div className="text-4xl font-mono font-bold text-text-primary tabular-nums">
        {formatTime(timer)}
      </div>

      {/* Record / Stop button */}
      <div className="relative">
        {recording && (
          <div className="absolute inset-0 rounded-full bg-danger/30 animate-pulse-ring" />
        )}
        <button
          onClick={recording ? stopRecording : startRecording}
          className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl transition-all ${
            recording
              ? 'bg-danger shadow-lg shadow-danger/40 hover:bg-red-600'
              : 'bg-gradient-to-br from-primary to-primary-dark shadow-lg shadow-primary/30 hover:shadow-primary/50'
          }`}
          id="record-button"
        >
          {recording ? '⏹' : '🎤'}
        </button>
      </div>

      <p className="text-xs text-text-muted">
        {recording ? 'Recording… tap to stop' : 'Tap to start recording'}
      </p>

      {/* Playback */}
      {audioUrl && (
        <audio controls src={audioUrl} className="w-full max-w-xs mt-2" />
      )}
    </div>
  );
}
