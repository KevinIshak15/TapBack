export function ReviewFlowSlide() {
  return (
    <div className="flex h-full w-full bg-[var(--landing-screen-bg)] rounded-lg overflow-hidden">
      <aside className="w-14 flex-shrink-0 border-r border-[var(--landing-screen-border)] flex flex-col items-center py-3 gap-2">
        <div className="w-8 h-8 rounded-lg bg-[var(--landing-screen-surface-elevated)]" />
        <div className="w-8 h-8 rounded-lg bg-[var(--landing-screen-surface-elevated)]" />
        <div className="w-8 h-8 rounded-lg bg-[var(--landing-screen-accent)]/30" />
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-10 flex-shrink-0 border-b border-[var(--landing-screen-border)] flex items-center px-4">
          <div className="h-2 w-20 rounded bg-[var(--landing-screen-surface-elevated)]" />
        </div>
        <div className="flex-1 p-4 flex flex-col gap-3">
          <div className="h-3 w-3/4 rounded bg-[var(--landing-screen-text-muted)]/30" />
          <div className="flex gap-2">
            <div className="h-8 flex-1 rounded-lg bg-[var(--landing-screen-accent)]/20 border border-[var(--landing-screen-accent)]/40" />
            <div className="h-8 flex-1 rounded-lg bg-[var(--landing-screen-surface-elevated)]" />
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-6 w-16 rounded-full bg-[var(--landing-screen-surface-elevated)]" />
            ))}
          </div>
          <div className="mt-2 h-16 rounded-lg border border-[var(--landing-screen-border)] bg-[var(--landing-screen-surface)]" />
        </div>
      </div>
    </div>
  );
}
