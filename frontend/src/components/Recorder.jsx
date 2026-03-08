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
    <div className="flex flex-col items-center justify-center py-8 gap-6 w-full">
      <div className="text-center space-y-2">
        <h3 className="text-base font-semibold text-text-primary font-heading tracking-wide">Record Audio</h3>
        <p className="text-[13px] font-medium text-text-muted">
          {recording ? 'Recording clearly… tap to stop' : 'Tap the microphone to start reading'}
        </p>
      </div>

      <div className="relative group perspective-1000">
        {/* Pulsing rings for recording state */}
        {recording && (
          <>
            <div className="absolute inset-0 rounded-full bg-danger/20 animate-pulse-ring" />
            <div className="absolute inset-0 rounded-full bg-danger/10 animate-pulse-ring" style={{ animationDelay: '0.4s' }} />
          </>
        )}
        
        {/* Main Record Button */}
        <button
          onClick={recording ? stopRecording : startRecording}
          className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 transform group-hover:-translate-y-1 ${
            recording
              ? 'bg-danger hover:bg-[#DC2626] hover:shadow-danger/40 shadow-danger/30'
              : 'bg-primary hover:bg-[#000000] hover:shadow-primary/30 shadow-primary/20 bg-gradient-to-br from-primary to-slate-800'
          }`}
          id="record-button"
        >
          {recording ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm3 2a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H6z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.938l3-2.647z" clipRule="evenodd" />
              <path d="M5 9a1 1 0 012 0v1a3 3 0 106 0V9a1 1 0 112 0v1a5.002 5.002 0 01-4 4.905V17h3a1 1 0 110 2h-8a1 1 0 110-2h3v-2.095A5.002 5.002 0 015 10V9z" />
            </svg>
          )}
        </button>
      </div>

      {recording && (
        <div className="px-5 py-2 rounded-full bg-surface shadow-sm border border-outline border-b-2 border-b-danger/20 flex items-center gap-3 animate-fade-in">
          <div className="w-2 h-2 rounded-full bg-danger animate-pulse"></div>
          <div className="text-2xl font-mono font-bold text-text-primary tracking-wider tabular-nums">
            {formatTime(timer)}
          </div>
        </div>
      )}

      {audioUrl && !recording && (
        <div className="w-full max-w-sm mt-4 p-4 rounded-2xl bg-surface-dim border border-outline-variant shadow-inner animate-fade-in">
          <audio controls src={audioUrl} className="w-full" />
        </div>
      )}
    </div>
  );
}
