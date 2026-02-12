export function QRTemplatesSlide() {
  return (
    <div className="flex h-full w-full bg-[var(--landing-screen-bg)] rounded-lg overflow-hidden">
      <aside className="w-14 flex-shrink-0 border-r border-[var(--landing-screen-border)] flex flex-col items-center py-3 gap-2">
        <div className="w-8 h-8 rounded-lg bg-[var(--landing-screen-surface-elevated)]" />
        <div className="w-8 h-8 rounded-lg bg-[var(--landing-screen-accent)]/30" />
        <div className="w-8 h-8 rounded-lg bg-[var(--landing-screen-surface-elevated)]" />
        <div className="w-8 h-8 rounded-lg bg-[var(--landing-screen-surface-elevated)]" />
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-10 flex-shrink-0 border-b border-[var(--landing-screen-border)] flex items-center px-4">
          <div className="h-2 w-28 rounded bg-[var(--landing-screen-surface-elevated)]" />
          <div className="h-2 w-20 rounded bg-[var(--landing-screen-surface-elevated)] ml-4" />
        </div>
        <div className="flex-1 p-4 flex gap-4 items-center justify-center">
          <div className="w-24 h-24 rounded-xl bg-white border border-[var(--landing-screen-border)]" />
          <div className="w-24 h-24 rounded-xl bg-[var(--landing-screen-surface-elevated)] border border-[var(--landing-screen-border)]" />
          <div className="w-24 h-24 rounded-xl bg-[var(--landing-screen-surface-elevated)] border border-[var(--landing-screen-border)]" />
        </div>
      </div>
    </div>
  );
}
