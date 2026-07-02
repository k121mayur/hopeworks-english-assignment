import { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import StoryCard from '../components/StoryCard';
import Recorder from '../components/Recorder';
import { speak, stop } from '../services/tts';

export default function StudentDashboard() {
  const [story, setStory] = useState(null);
  const [storyLoading, setStoryLoading] = useState(true);
  const [audioBlob, setAudioBlob] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // UI States for History & Mobile-First Tabs
  const [activeTab, setActiveTab] = useState('today'); // 'today' or 'history'
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [expandedSubId, setExpandedSubId] = useState(null);

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/submission/my');
      setHistory(data);
    } catch (err) {
      console.error('Error fetching submissions history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    api.get('/story/today')
      .then((r) => setStory(r.data))
      .catch(() => setStory(null))
      .finally(() => setStoryLoading(false));

    fetchHistory();

    // Cleanup any running speech synthesis
    return () => {
      stop();
    };
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
      // Refresh history list to include this new submission
      fetchHistory();
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

  const speakWord = (word) => {
    speak(word, 0.75);
  };

  return (
    <div className="min-h-screen bg-surface-dim pb-20">
      <Navbar />
      
      {/* Premium Background subtle gradient */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[60%] w-[40%] h-[40%] rounded-full bg-blue-50 opacity-40 blur-[100px] mix-blend-multiply"></div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 relative z-10 animate-fade-in w-full">
        {/* Header Title */}
        <div className="text-left">
          <h2 className="text-2xl font-semibold text-text-primary tracking-tight font-heading">English Practice</h2>
          <span className="text-sm font-medium text-text-muted mt-1 block">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric'})}</span>
        </div>

        {/* Mobile-First Custom Tab Selectors */}
        <div className="flex border-b border-outline-variant w-full mb-2 relative z-20">
          <button
            onClick={() => {
              setActiveTab('today');
              stop();
            }}
            className={`flex-1 py-3 text-center text-sm font-bold tracking-wide border-b-2 transition-all cursor-pointer select-none ${
              activeTab === 'today'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            📚 Today's Story
          </button>
          <button
            onClick={() => {
              setActiveTab('history');
              stop();
            }}
            className={`flex-1 py-3 text-center text-sm font-bold tracking-wide border-b-2 transition-all cursor-pointer select-none ${
              activeTab === 'history'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            📜 My History ({history?.length || 0})
          </button>
        </div>

        {/* Tab 1: Today's Story & Active Assessment */}
        {activeTab === 'today' && (
          <div className="space-y-6">
            {storyLoading ? (
              <div className="card-elevated p-12 text-left bg-white">
                <div className="animate-pulse flex flex-col items-start gap-4">
                  <div className="w-12 h-12 border-4 border-outline-variant border-t-primary rounded-full animate-spin"></div>
                  <p className="text-text-muted font-medium">Fetching today's story…</p>
                </div>
              </div>
            ) : (
              <StoryCard story={story} />
            )}

            {story && !result && (
              <div className="space-y-5 sm:space-y-6 pb-20 mt-5">
                <div className="mb-5">
                  <div className="card-elevated p-1 shadow-2xl border border-outline-variant bg-white/95 backdrop-blur-sm pointer-events-auto">
                    <Recorder onRecorded={(blob) => { setAudioBlob(blob); setUploadFile(null); }} />
                  </div>
                </div>

                <div className="mb-5 card p-5 sm:p-6 border-dashed border-2 hover:border-primary/40 transition-colors group cursor-pointer relative overflow-hidden bg-white/50 hover:bg-white/80 mt-8 sm:mt-12">
                  <div className="flex flex-row items-center justify-start gap-4 text-left pointer-events-none">
                    <div className="w-10 h-10 rounded-full bg-primary-container text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary">Upload existing audio instead</h3>
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
                  className="btn btn-primary w-full py-4 px-6 text-base shadow-lg hover:shadow-xl transition-all mt-4 text-left flex justify-between items-center cursor-pointer"
                  id="submit-reading"
                >
                  <span className="font-semibold text-left">
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing your reading…
                      </span>
                    ) : 'Submit Reading'}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-80" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}

            {/* Scrollable Feedback Result Card */}
            {result && (
              <div className="card-elevated p-6 sm:p-8 text-left space-y-4 animate-fade-in backdrop-blur-xl bg-white/90 border-t-4 border-t-accent flex flex-col max-h-[85vh]">
                <div className="flex-shrink-0 flex items-center justify-between border-b border-outline-variant pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-success-container text-success rounded-xl flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-text-primary tracking-tight">Assessment Complete!</h3>
                      <p className="text-xs text-text-muted">Here is your pronunciation score</p>
                    </div>
                  </div>
                  <div className="py-2 px-4 bg-surface-dim rounded-xl border border-outline-variant text-right">
                    <div className={`text-3xl font-extrabold font-heading ${scoreColor(result.accuracy_score)}`}>
                      {result.accuracy_score?.toFixed(1)}<span className="text-lg font-normal text-text-muted">%</span>
                    </div>
                  </div>
                </div>

                {/* Scrollable feedback details */}
                <div className="flex-grow overflow-y-auto pr-1 space-y-4 max-h-[40vh] sm:max-h-[50vh] scrollbar-thin">
                  {result.transcription && (
                    <div className="text-left bg-surface rounded-xl p-4 border border-outline-variant shadow-sm">
                      <h4 className="text-xs font-bold text-text-secondary flex items-center gap-1.5 mb-2 uppercase tracking-wider">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 text-accent" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.938l3-2.647z" clipRule="evenodd" />
                        </svg>
                        What we heard
                      </h4>
                      <p className="text-[14px] text-text-secondary leading-relaxed bg-surface-dim p-3 rounded-xl border border-outline-variant/50 italic">
                        "{result.transcription}"
                      </p>
                    </div>
                  )}

                  {result.word_errors?.length > 0 ? (
                    <div className="text-left bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
                      <div className="p-3 border-b border-outline-variant bg-surface-dim/30">
                        <h4 className="text-xs font-bold text-text-secondary flex items-center gap-1.5 uppercase tracking-wider">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 text-danger" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Word Errors ({result.word_errors.length})
                        </h4>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-left text-text-muted uppercase tracking-wider bg-surface-dim/50 border-b border-outline-variant">
                              <th className="py-2 px-3 font-semibold w-12 text-center">Pos</th>
                              <th className="py-2 px-3 font-semibold">Expected Word (Listen)</th>
                              <th className="py-2 px-3 font-semibold">Spoken Word</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-outline-variant">
                            {result.word_errors.map((err, i) => (
                              <tr key={i} className="hover:bg-surface-dim/50 transition-colors">
                                <td className="py-2 px-3 text-text-muted text-center font-medium">{err.position + 1}</td>
                                <td className="py-2 px-3 text-danger font-medium flex items-center gap-2">
                                  <span>{err.expected_word || '—'}</span>
                                  {err.expected_word && (
                                    <button
                                      onClick={() => speakWord(err.expected_word)}
                                      className="p-1 rounded-lg text-text-muted hover:text-accent hover:bg-primary-container transition-colors cursor-pointer"
                                      title="Listen correct pronunciation"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L17 10.586 14.707 12.879a1 1 0 01-1.414-1.414L14.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                      </svg>
                                    </button>
                                  )}
                                </td>
                                <td className="py-2 px-3 text-success font-medium">{err.spoken_word || '(skipped)'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 text-center bg-success-container/10 border border-success/20 rounded-xl text-success font-bold text-sm">
                      🎉 Perfect reading! No pronunciation errors.
                    </div>
                  )}
                </div>

                {/* Sticky Actions */}
                <div className="flex-shrink-0 pt-4 border-t border-outline-variant flex gap-3">
                  <button
                    onClick={() => { setResult(null); setAudioBlob(null); setUploadFile(null); }}
                    className="btn btn-primary flex-1 text-sm font-semibold py-3 cursor-pointer"
                  >
                    Submit Again
                  </button>
                  <button
                    onClick={() => { setActiveTab('history'); setResult(null); setAudioBlob(null); setUploadFile(null); }}
                    className="btn btn-outline flex-1 text-sm font-semibold py-3 cursor-pointer"
                  >
                    Go to History
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Submissions History (Accordion View) */}
        {activeTab === 'history' && (
          <div className="space-y-4 animate-fade-in w-full">
            <div className="mb-4 text-left">
              <h2 className="text-xl font-semibold text-text-primary tracking-tight font-heading">Your Practice History</h2>
              <span className="text-xs font-medium text-text-muted mt-0.5 block">Review your past readings and check pronunciation errors.</span>
            </div>

            {historyLoading ? (
              <div className="card p-12 text-center bg-white border border-outline-variant w-full">
                <div className="animate-pulse flex flex-col items-center justify-center gap-3">
                  <div className="w-10 h-10 border-3 border-outline-variant border-t-primary rounded-full animate-spin"></div>
                  <p className="text-text-muted font-medium text-sm">Loading your history…</p>
                </div>
              </div>
            ) : history.length === 0 ? (
              <div className="card p-10 text-center bg-white border border-outline-variant w-full">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📜</span>
                </div>
                <h3 className="text-lg font-bold text-text-primary">No submissions yet</h3>
                <p className="text-sm text-text-muted mt-2">Complete today's reading assignment to start your practice history!</p>
                <button
                  onClick={() => setActiveTab('today')}
                  className="btn btn-primary mt-6 text-sm py-2.5 px-6 rounded-xl cursor-pointer"
                >
                  Start Reading
                </button>
              </div>
            ) : (
              <div className="space-y-3 w-full">
                {Array.isArray(history) && history.map((sub) => {
                  const isExpanded = expandedSubId === sub.id;
                  let formattedDate = 'Unknown Date';
                  if (sub.created_at) {
                    try {
                      const dateStr = sub.created_at.includes(' ') 
                        ? sub.created_at.replace(' ', 'T') 
                        : sub.created_at;
                      const dateObj = new Date(dateStr);
                      if (!isNaN(dateObj.getTime())) {
                        formattedDate = dateObj.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        });
                      }
                    } catch (dateErr) {
                      console.error('Error formatting date:', dateErr);
                    }
                  }
                  return (
                    <div
                      key={sub.id}
                      className="card bg-white border border-outline-variant overflow-hidden transition-all duration-300 w-full"
                    >
                      {/* Accordion Header */}
                      <button
                        onClick={() => {
                          setExpandedSubId(isExpanded ? null : sub.id);
                          stop();
                        }}
                        className="w-full py-4 px-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer select-none"
                      >
                        <div className="space-y-1 pr-4">
                          <h4 className="text-sm font-bold text-text-primary line-clamp-1">
                            {sub.story?.title || `Story #${sub.story_id}`}
                          </h4>
                          <span className="text-xs text-text-muted font-medium">{formattedDate}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs sm:text-sm font-extrabold px-2.5 py-1 rounded-lg bg-surface-dim border border-outline-variant ${scoreColor(sub.accuracy_score)}`}>
                            {typeof sub.accuracy_score === 'number' ? sub.accuracy_score.toFixed(1) : '0.0'}%
                          </span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-5 w-5 text-text-muted transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </button>

                      {/* Accordion Content */}
                      {isExpanded && (
                        <div className="border-t border-outline-variant bg-surface-dim/40 p-4 sm:p-5 space-y-4 animate-fade-in max-h-[60vh] overflow-y-auto w-full">
                          {/* Story Details Card */}
                          {sub.story && (
                            <div className="bg-white rounded-xl p-4 border border-outline-variant shadow-sm relative">
                              <div className="flex justify-between items-center mb-2">
                                <h5 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Original Story</h5>
                                <button
                                  onClick={() => {
                                    speak(sub.story.story_text, 0.85);
                                  }}
                                  className="text-xs text-accent hover:text-accent-hover font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L17 10.586 14.707 12.879a1 1 0 01-1.414-1.414L14.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                  Listen to Story
                                </button>
                              </div>
                              <p className="text-sm text-text-primary leading-relaxed bg-surface-dim p-3 rounded-lg border border-outline-variant/30 font-medium select-text">
                                {sub.story.story_text}
                              </p>
                            </div>
                          )}

                          {/* Transcription Card */}
                          {sub.transcription && (
                            <div className="bg-white rounded-xl p-4 border border-outline-variant shadow-sm">
                              <h5 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2">What we heard</h5>
                              <p className="text-sm text-text-secondary italic bg-surface-dim p-3 rounded-lg border border-outline-variant/30 select-text">
                                "{sub.transcription}"
                              </p>
                            </div>
                          )}

                          {/* Word Errors Card */}
                          <div className="bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden">
                            <div className="p-3 border-b border-outline-variant bg-surface-dim/30">
                              <h5 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 text-danger" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Pronunciation Errors ({sub.word_errors?.length || 0})
                              </h5>
                            </div>
                            {sub.word_errors && sub.word_errors.length > 0 ? (
                              <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="text-left text-text-muted uppercase tracking-wider bg-surface-dim/50 border-b border-outline-variant">
                                      <th className="py-2 px-3 font-semibold w-12 text-center">Pos</th>
                                      <th className="py-2 px-3 font-semibold">Expected Word (Listen)</th>
                                      <th className="py-2 px-3 font-semibold">Spoken Word</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-outline-variant">
                                    {sub.word_errors.map((err, i) => (
                                      <tr key={i} className="hover:bg-surface-dim/50 transition-colors">
                                        <td className="py-2 px-3 text-text-muted text-center font-medium">{err.position + 1}</td>
                                        <td className="py-2 px-3 text-danger font-medium flex items-center gap-2">
                                          <span>{err.expected_word || '—'}</span>
                                          {err.expected_word && (
                                            <button
                                              onClick={() => speakWord(err.expected_word)}
                                              className="p-1 rounded-lg text-text-muted hover:text-accent hover:bg-primary-container transition-colors cursor-pointer"
                                              title="Listen correct pronunciation"
                                            >
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L17 10.586 14.707 12.879a1 1 0 01-1.414-1.414L14.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                              </svg>
                                            </button>
                                          )}
                                        </td>
                                        <td className="py-2 px-3 text-success font-medium">{err.spoken_word || '(skipped)'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="p-4 text-center text-success font-bold text-xs">
                                🎉 Perfect reading! No pronunciation errors.
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
