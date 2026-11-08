export function LoadingTile({
  label = "Loading workspace",
}: {
  label?: string;
}) {
  return (
    <div
      aria-live="polite"
      className="mx-auto flex min-h-[220px] w-full max-w-[560px] items-center gap-5 rounded-2xl border border-[#292929] bg-[#111111] p-7 shadow-2xl"
      role="status"
    >
      <div className="grid h-14 w-14 shrink-0 grid-cols-2 gap-1.5 rounded-xl border border-[#4a2a14] bg-[#1b120c] p-2">
        <span className="animate-pulse rounded-sm bg-[#f97316]" />
        <span className="animate-pulse rounded-sm bg-[#9a4a1b] [animation-delay:120ms]" />
        <span className="animate-pulse rounded-sm bg-[#9a4a1b] [animation-delay:240ms]" />
        <span className="animate-pulse rounded-sm bg-[#f97316] [animation-delay:360ms]" />
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#ff9a4d]">
          {label}
        </p>
        <p className="mt-2 text-sm text-[#999]">Syncing the latest workspace data...</p>
      </div>
    </div>
  );
}
