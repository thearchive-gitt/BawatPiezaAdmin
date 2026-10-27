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
      ? "bg-[#e6f4eb] text-[#27734c]"
      : normalized === "maintenance" || normalized === "pending"
        ? "bg-[#fff3dc] text-[#9a6a16]"
        : normalized === "offline" ||
            normalized === "suspended" ||
            normalized === "inactive"
          ? "bg-[#fce9e7] text-[#a34339]"
          : "bg-[#eef1ed] text-[#65736a]";

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
      className={`scroll-mt-6 rounded-2xl border border-[#e7ebe5] bg-white p-5 shadow-[0_8px_24px_rgba(27,46,36,0.035)] sm:p-6 ${className}`}
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
        <h2 className="text-base font-semibold tracking-[-0.02em] text-[#1d3025]">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-xs leading-5 text-[#849087]">{description}</p>
        ) : null}
      </div>
      {action ? (
        <span className="rounded-full bg-[#f3f6f1] px-3 py-1.5 text-[11px] font-medium text-[#53665a]">
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
      className="mb-6 rounded-2xl border border-[#f1d8a6] bg-[#fff9eb] p-4"
    >
      <h2 className="text-sm font-semibold text-[#805c18]">
        Some dashboard information is unavailable
      </h2>
      <ul className="mt-2 space-y-1 text-xs leading-5 text-[#806d48]">
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
}: {
  label: string;
  value: string;
  detail: string;
  icon: string;
  accent: string;
}) {
  return (
    <article className="rounded-2xl border border-[#e7ebe5] bg-white p-5 shadow-[0_8px_24px_rgba(27,46,36,0.035)]">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-[#849087]">{label}</p>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg ${accent}`}
        >
          {icon}
        </span>
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-[#1d3025]">
        {value}
      </p>
      <p className="mt-1 text-xs text-[#8b968e]">{detail}</p>
    </article>
  );
}
