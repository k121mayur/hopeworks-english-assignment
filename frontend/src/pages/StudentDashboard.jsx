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
    if (score >= 80) return 'text-success drop-shadow-[0_2px_10px_rgba(16,185,129,0.2)]';
    if (score >= 50) return 'text-warning drop-shadow-[0_2px_10px_rgba(245,158,11,0.2)]';
    return 'text-danger drop-shadow-[0_2px_10px_rgba(239,68,68,0.2)]';
  };

  return (
    <div className="min-h-screen bg-surface-dim pb-20">
      <Navbar />
      
      {/* Premium Background subtle gradient */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[60%] w-[40%] h-[40%] rounded-full bg-blue-50 opacity-40 blur-[100px] mix-blend-multiply"></div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8 relative z-10 animate-fade-in">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-semibold text-text-primary tracking-tight font-heading">Today's Reading Assignment</h2>
          <span className="text-sm font-medium text-text-muted">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric'})}</span>
        </div>

        {storyLoading ? (
          <div className="card-elevated p-12 text-center">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-outline-variant border-t-primary rounded-full animate-spin"></div>
              <p className="text-text-muted font-medium">Fetching your story…</p>
            </div>
          </div>
        ) : (
          <StoryCard story={story} />
        )}

        {story && !result && (
          <div className="space-y-6">
            <div className="card-elevated p-1 transition-all">
              <Recorder onRecorded={(blob) => { setAudioBlob(blob); setUploadFile(null); }} />
            </div>

            <div className="flex items-center justify-center gap-4 my-2 opacity-60">
              <div className="h-[1px] bg-outline flex-1"></div>
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">or</span>
              <div className="h-[1px] bg-outline flex-1"></div>
            </div>

            <div className="card p-6 border-dashed border-2 hover:border-primary/40 transition-colors group cursor-pointer relative overflow-hidden bg-white/50 hover:bg-white/80">
              <div className="flex flex-col items-center justify-center gap-3 text-center pointer-events-none">
                <div className="w-10 h-10 rounded-full bg-primary-container text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">Upload existing audio</h3>
                  <p className="text-xs text-text-muted mt-1">.wav, .mp3, .m4a, .webm, .ogg</p>
                </div>
              </div>
              <input
                type="file"
                accept=".wav,.mp3,.m4a,.webm,.ogg"
                onChange={(e) => { setUploadFile(e.target.files[0]); setAudioBlob(null); }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="upload-audio"
              />
              {uploadFile && (
                <div className="absolute inset-0 bg-success-container/90 flex items-center justify-center animate-fade-in">
                  <p className="text-success font-semibold flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {uploadFile.name} ready for submission
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-danger-container text-danger text-sm font-medium text-center border border-red-200 animate-fade-in">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting || (!audioBlob && !uploadFile)}
              className="btn btn-primary w-full py-4 text-base shadow-lg hover:shadow-xl transition-all mt-4"
              id="submit-reading"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing your reading…
                </span>
              ) : 'Submit Reading'}
            </button>
          </div>
        )}

        {/* Premium Result Card */}
        {result && (
          <div className="card-elevated p-10 text-center space-y-6 animate-fade-in backdrop-blur-xl bg-white/90 border-t-4 border-t-accent">
            <div className="w-16 h-16 mx-auto bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-text-primary tracking-tight">Assessment Complete!</h3>
              <p className="text-sm text-text-muted mt-1">Here is how you did</p>
            </div>
            
            <div className="py-6 px-4 bg-surface-dim rounded-2xl border border-outline-variant inline-block min-w-[200px]">
              <div className={`text-6xl font-bold font-heading mb-1 ${scoreColor(result.accuracy_score)}`}>
                {result.accuracy_score?.toFixed(1)}<span className="text-3xl text-text-muted">%</span>
              </div>
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Accuracy</span>
            </div>

            {result.transcription && (
              <div className="mt-8 text-left bg-surface rounded-2xl p-6 border border-outline-variant shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.938l3-2.647z" clipRule="evenodd" />
                  </svg>
                  <h4 className="text-sm font-semibold text-text-primary">What we heard:</h4>
                </div>
                <p className="text-[15px] text-text-secondary leading-relaxed bg-surface-dim p-4 rounded-xl border border-outline-variant/50">
                  "{result.transcription}"
                </p>
              </div>
            )}

            {result.word_errors?.length > 0 && (
              <div className="mt-8 text-left bg-surface rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
                <div className="p-5 border-b border-outline-variant bg-surface-dim/30">
                  <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-danger" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Word Errors ({result.word_errors.length})
                  </h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider bg-surface-dim/50 border-b border-outline-variant">
                        <th className="py-3 px-5">Pos</th>
                        <th className="py-3 px-5">Expected</th>
                        <th className="py-3 px-5">Spoken</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {result.word_errors.map((err, i) => (
                        <tr key={i} className="hover:bg-surface-dim/50 transition-colors">
                          <td className="py-3 px-5 text-text-muted font-medium">{err.position + 1}</td>
                          <td className="py-3 px-5 text-danger font-medium">{err.expected_word || '—'}</td>
                          <td className="py-3 px-5 text-success font-medium">{err.spoken_word || '(skipped)'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="pt-6">
              <button
                onClick={() => { setResult(null); setAudioBlob(null); setUploadFile(null); }}
                className="btn btn-outline py-2.5 px-6 rounded-full hover:bg-slate-100 text-sm font-semibold"
              >
                Start Over
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
