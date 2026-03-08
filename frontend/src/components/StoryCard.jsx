export default function StoryCard({ story }) {
  if (!story) {
    return (
      <div className="card-elevated p-10 text-center bg-surface w-full">
        <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4 border border-outline-variant">
          <span className="text-3xl">📚</span>
        </div>
        <h3 className="text-xl font-semibold text-text-primary font-heading tracking-tight">No Story Today</h3>
        <p className="text-[15px] font-medium text-text-muted mt-2">Check back later — a new story is published every morning.</p>
      </div>
    );
  }

  return (
    <div className="card-elevated p-8 sm:p-10 relative overflow-hidden group">
      {/* Decorative accent line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-blue-300"></div>
      
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-8">
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
        <div className="flex items-center gap-2 bg-primary-container/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-blue-100 text-primary whitespace-nowrap shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-sm font-bold tracking-wide">
            {story.word_count} words
          </span>
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
