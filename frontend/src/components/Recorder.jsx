import { useState, useRef, useCallback } from 'react';

export default function Recorder({ onRecorded }) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const chunksRef = useRef([]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    clearInterval(timerRef.current);
    timerRef.current = null;
    setRecording(false);
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        onRecorded(blob);
      };

      recorder.start();
      setRecording(true);
      setElapsed(0);

      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Microphone access is required to record audio. Please allow microphone permissions.');
    }
  }, [onRecorded]);

  const handleToggle = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full">
      <button
        onClick={handleToggle}
        className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold text-base transition-all duration-300 cursor-pointer ${
          recording
            ? 'bg-red-50 border-2 border-red-300 text-danger animate-pulse shadow-lg shadow-red-100'
            : 'bg-primary text-white shadow-lg shadow-slate-200 hover:shadow-xl hover:-translate-y-0.5'
        }`}
      >
        {recording ? (
          <>
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
            </span>
            <span>Recording... {formatTime(elapsed)}</span>
            <span className="text-sm font-normal opacity-80">(tap to stop)</span>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
            <span>Start Recording</span>
          </>
        )}
      </button>

      {recording && (
        <p className="text-xs text-text-muted text-center mt-2 font-medium">
          Speak clearly into your microphone. Tap the button when done.
        </p>
      )}
    </div>
  );
}
