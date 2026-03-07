export default function StoryCard({ story }) {
  if (!story) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="text-5xl mb-4">📖</div>
        <h3 className="text-lg font-semibold text-text-secondary">No Story Today</h3>
        <p className="text-sm text-text-muted mt-2">Check back later — a new story is published every morning.</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary">{story.title}</h2>
          <span className="text-xs text-text-muted">{new Date(story.created_date).toLocaleDateString()}</span>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-secondary/20 text-secondary font-medium">
          {story.word_count} words
        </span>
      </div>
      <div className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.06] leading-relaxed text-text-secondary text-[0.95rem]">
        {story.story_text}
      </div>
    </div>
  );
}
