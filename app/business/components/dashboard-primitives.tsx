import type { ReactNode } from "react";

export function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "BP"
  );
}

export function displayName(firstname: string, lastname: string | null) {
  return [firstname, lastname].filter(Boolean).join(" ");
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const style =
    normalized === "online" || normalized === "active" || normalized === "resolved"
    ? "bg-[#17351f] text-[#72d98d]"
      : normalized === "maintenance" || normalized === "pending"
        ? "bg-[#2a1609] text-[#ff9a4d]"
        : normalized === "offline" ||
            normalized === "suspended" ||
            normalized === "inactive"
          ? "bg-[#351719] text-[#ff8585]"
          : "bg-[#202020] text-[#999]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${style}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function Panel({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      className={`scroll-mt-6 rounded-2xl border border-[#292929] bg-[#111111] p-5 shadow-[0_12px_30px_rgba(0,0,0,0.2)] sm:p-6 ${className}`}
      id={id}
    >
      {children}
    </section>
  );
}

export function PanelHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: string;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold tracking-[-0.02em] text-[#f7f7f2]">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-xs leading-5 text-[#888]">{description}</p>
        ) : null}
      </div>
      {action ? (
        <span className="rounded-full bg-[#2a1609] px-3 py-1.5 text-[11px] font-medium text-[#ff9a4d]">
          {action}
        </span>
      ) : null}
    </div>
  );
}

export function DataIssues({ issues }: { issues: string[] }) {
  if (issues.length === 0) return null;

  return (
    <section
      aria-label="Dashboard data warnings"
      className="mb-6 rounded-2xl border border-[#5b3517] bg-[#1d1209] p-4"
    >
      <h2 className="text-sm font-semibold text-[#ffae67]">
        Some dashboard information is unavailable
      </h2>
      <ul className="mt-2 space-y-1 text-xs leading-5 text-[#c39772]">
        {issues.map((issue) => (
          <li key={issue}>{issue}</li>
        ))}
      </ul>
    </section>
  );
}

export function MetricCard({
  label,
  value,
  detail,
  icon,
  accent,
  gradient = "from-[#151515] to-[#111111]",
  compact = false,
}: {
  label: string;
  value: string;
  detail: string;
  icon: string;
  accent: string;
  gradient?: string;
  compact?: boolean;
}) {
  return (
    <article className={`rounded-2xl border border-[#292929] bg-gradient-to-br ${gradient} ${compact ? "p-4" : "p-5"} shadow-[0_12px_30px_rgba(0,0,0,0.2)]`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-[#888]">{label}</p>
        <span
        className={`flex ${compact ? "h-8 w-8 text-base" : "h-9 w-9 text-lg"} shrink-0 items-center justify-center rounded-xl ${accent}`}
        >
        {icon}
        </span>
      </div>
      <p className={`${compact ? "mt-3 text-2xl" : "mt-4 text-3xl"} font-semibold tracking-[-0.05em] text-[#f7f7f2]`}>
        {value}
      </p>
      <p className="mt-1 text-[11px] leading-4 text-[#888]">{detail}</p>
    </article>
  );
}
