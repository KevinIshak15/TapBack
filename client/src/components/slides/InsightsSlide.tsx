export function InsightsSlide() {
  return (
    <div className="flex h-full w-full bg-[var(--landing-screen-bg)] rounded-lg overflow-hidden">
      <aside className="w-14 flex-shrink-0 border-r border-[var(--landing-screen-border)] flex flex-col items-center py-3 gap-2">
        <div className="w-8 h-8 rounded-lg bg-[var(--landing-screen-surface-elevated)]" />
        <div className="w-8 h-8 rounded-lg bg-[var(--landing-screen-surface-elevated)]" />
        <div className="w-8 h-8 rounded-lg bg-[var(--landing-screen-surface-elevated)]" />
        <div className="w-8 h-8 rounded-lg bg-[var(--landing-screen-accent)]/30" />
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-10 flex-shrink-0 border-b border-[var(--landing-screen-border)] flex items-center px-4">
          <div className="h-2 w-24 rounded bg-[var(--landing-screen-surface-elevated)]" />
          <div className="h-2 w-16 rounded bg-[var(--landing-screen-surface-elevated)] ml-auto" />
        </div>
        <div className="flex-1 p-4 flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex-1 h-14 rounded-lg bg-[var(--landing-screen-surface-elevated)]" />
            <div className="flex-1 h-14 rounded-lg bg-[var(--landing-screen-surface-elevated)]" />
          </div>
          <div className="flex-1 min-h-[60px] rounded-lg bg-[var(--landing-screen-surface-elevated)] flex items-center justify-center">
            <div className="w-full max-w-[180px] h-12 rounded bg-[var(--landing-screen-surface)] border border-[var(--landing-screen-border)]" />
          </div>
          <div className="flex gap-2">
            <div className="h-2 flex-1 rounded bg-[var(--landing-screen-surface)]" />
            <div className="h-2 flex-1 rounded bg-[var(--landing-screen-surface)]" />
            <div className="h-2 flex-1 rounded bg-[var(--landing-screen-surface)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
