import { useState, useEffect } from 'react';
import { speak, stop } from '../services/tts';

export default function StoryCard({ story }) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Stop speaking if story changes or component unmounts
    return () => {
      stop();
    };
  }, [story]);

  if (!story) {
    return (
      <div className="card-elevated p-10 text-left bg-surface w-full">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 border border-outline-variant">
          <span className="text-3xl">📚</span>
        </div>
        <h3 className="text-xl font-semibold text-text-primary font-heading tracking-tight">No Story Today</h3>
        <p className="text-[15px] font-medium text-text-muted mt-2">Check back later — a new story is published every morning.</p>
      </div>
    );
  }

  const toggleSpeech = () => {
    if (isPlaying) {
      stop();
      setIsPlaying(false);
    } else {
      speak(story.story_text, 0.85, () => setIsPlaying(false));
      setIsPlaying(true);
    }
  };

  return (
    <div className="card-elevated p-6 sm:p-10 relative overflow-hidden group">
      {/* Decorative accent line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-blue-300"></div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-text-primary font-heading tracking-tight leading-snug">{story.title}</h2>
          <div className="flex items-center gap-2 mt-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-semibold text-text-secondary">
              {new Date(story.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Read Aloud Button */}
          <button
            onClick={toggleSpeech}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-bold shadow-sm cursor-pointer ${
              isPlaying
                ? 'bg-red-50 border-red-200 text-danger animate-pulse'
                : 'bg-white hover:bg-slate-50 border-outline-variant text-text-primary'
            }`}
          >
            {isPlaying ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8 7a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Stop Reading
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.983 5.983 0 01-1.414 4.243 1 1 0 11-1.415-1.414A3.987 3.987 0 0013 10a3.987 3.987 0 00-1.414-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                </svg>
                Read Aloud
              </>
            )}
          </button>

          {/* Word Count */}
          <div className="flex items-center gap-2 bg-primary-container/80 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-blue-100 text-primary whitespace-nowrap shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm font-bold tracking-wide">
              {story.word_count} words
            </span>
          </div>
        </div>
      </div>
      
      <div className="relative">
        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-outline-variant rounded-full"></div>
        <div className="pl-6 py-2 text-[17px] leading-[2.2] text-text-primary tracking-[0.01em] font-medium selection:bg-accent selection:text-white">
          {story.story_text}
        </div>
      </div>
    </div>
  );
}

