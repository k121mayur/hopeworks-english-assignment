import { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import StoryCard from '../components/StoryCard';
import Recorder from '../components/Recorder';

export default function StudentDashboard() {
  const [story, setStory] = useState(null);
  const [storyLoading, setStoryLoading] = useState(true);
  const [audioBlob, setAudioBlob] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/story/today')
      .then((r) => setStory(r.data))
      .catch(() => setStory(null))
      .finally(() => setStoryLoading(false));
  }, []);

  const handleSubmit = async () => {
    const file = uploadFile || (audioBlob ? new File([audioBlob], 'recording.webm', { type: 'audio/webm' }) : null);
    if (!file) {
      setError('Please record or upload an audio file first.');
      return;
    }
    if (!story) return;

    setSubmitting(true);
    setError('');
    setResult(null);

    const fd = new FormData();
    fd.append('story_id', story.id);
    fd.append('audio_file', file);

    try {
      const { data } = await api.post('/submission', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const scoreColor = (score) => {
    if (score >= 80) return 'text-success';
    if (score >= 50) return 'text-accent';
    return 'text-danger';
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <h2 className="text-2xl font-bold">📖 Today's Reading</h2>

        {storyLoading ? (
          <div className="glass-card p-8 text-center text-text-muted">Loading story…</div>
        ) : (
          <StoryCard story={story} />
        )}

        {story && !result && (
          <>
            <Recorder onRecorded={(blob) => { setAudioBlob(blob); setUploadFile(null); }} />

            {/* OR upload a file */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">Or Upload Audio File</h3>
              <input
                type="file"
                accept=".wav,.mp3,.m4a,.webm,.ogg"
                onChange={(e) => { setUploadFile(e.target.files[0]); setAudioBlob(null); }}
                className="block w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary-light hover:file:bg-primary/30 cursor-pointer"
                id="upload-audio"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-danger/15 border border-danger/30 text-danger text-sm text-center">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting || (!audioBlob && !uploadFile)}
              className="btn btn-success w-full py-3 text-base"
              id="submit-reading"
            >
              {submitting ? 'Processing…' : '🚀 Submit Reading'}
            </button>
          </>
        )}

        {/* Result card */}
        {result && (
          <div className="glass-card p-8 text-center space-y-4">
            <div className="text-5xl">🎉</div>
            <h3 className="text-xl font-bold">Reading Submitted!</h3>
            <div className={`text-6xl font-extrabold ${scoreColor(result.accuracy_score)}`}>
              {result.accuracy_score?.toFixed(1)}%
            </div>
            <p className="text-text-secondary text-sm">Accuracy Score</p>

            {result.transcription && (
              <div className="mt-4 text-left">
                <h4 className="text-xs font-semibold text-text-muted uppercase mb-2">What we heard:</h4>
                <p className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-text-secondary leading-relaxed">
                  {result.transcription}
                </p>
              </div>
            )}

            {result.word_errors?.length > 0 && (
              <div className="mt-4 text-left">
                <h4 className="text-xs font-semibold text-text-muted uppercase mb-2">Word Errors</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-text-muted border-b border-white/10">
                        <th className="pb-2 pr-4">#</th>
                        <th className="pb-2 pr-4">Expected</th>
                        <th className="pb-2">Spoken</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.word_errors.map((err, i) => (
                        <tr key={i} className="border-b border-white/5">
                          <td className="py-2 pr-4 text-text-muted">{err.position + 1}</td>
                          <td className="py-2 pr-4 text-danger font-medium">{err.expected_word || '—'}</td>
                          <td className="py-2 text-success font-medium">{err.spoken_word || '(skipped)'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <button
              onClick={() => { setResult(null); setAudioBlob(null); setUploadFile(null); }}
              className="btn btn-ghost mt-4"
            >
              Try Again
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
