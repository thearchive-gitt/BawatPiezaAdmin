import type { DashboardData } from "@/lib/dashboard-data";
import { MetricCard } from "./dashboard-primitives";
import type { BusinessRole } from "./types";

type OverviewTabProps = {
  data: DashboardData;
  fullName: string;
  role: BusinessRole;
};

function formatCount(value: number | null) {
  return value === null ? "—" : value.toLocaleString();
}

export function OverviewTab({ data, fullName, role }: OverviewTabProps) {
  const admin = role === "admin";

  return (
    <section
      className="mb-6 scroll-mt-6"
      id="overview"
      aria-labelledby="overview-heading"
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#718078]">
            {admin ? "Operations overview" : "Staff workspace"}
          </p>
          <h1
            className="mt-1.5 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl"
            id="overview-heading"
          >
            Welcome{fullName ? `, ${fullName}` : ""}
          </h1>
          <p className="mt-2 text-sm text-[#849087]">
            {admin
              ? "Here is the latest view of your devices and business accounts."
              : "Your assigned devices and recent activity."}
          </p>
        </div>
        {admin ? (
          <span className="rounded-full border border-[#e1e7de] bg-white px-3 py-2 text-[11px] font-medium text-[#718078]">
            Admin overview
          </span>
        ) : null}
      </div>

      <div
        className={`grid gap-4 sm:grid-cols-2 ${
          admin ? "xl:grid-cols-4" : "xl:grid-cols-2"
        }`}
      >
        {admin ? (
          <>
            <MetricCard
              accent="bg-[#edf3e6] text-[#3c714c]"
              detail="Registered in the device network"
              icon="⌘"
              label="Deployed hubs"
              value={formatCount(data.hubCount)}
            />
            <MetricCard
              accent="bg-[#e9f1f5] text-[#4c7188]"
              detail="Hub status reported as online"
              icon="●"
              label="Online hubs"
              value={formatCount(data.onlineHubCount)}
            />
            <MetricCard
              accent="bg-[#f2edf8] text-[#785c9b]"
              detail="Admin and staff accounts"
              icon="♧"
              label="Business accounts"
              value={formatCount(data.businessAccountCount)}
            />
            <MetricCard
              accent="bg-[#fff3dc] text-[#a27628]"
              detail="Registered customer accounts"
              icon="◎"
              label="User accounts"
              value={formatCount(data.userAccountCount)}
            />
          </>
        ) : (
          <>
            <MetricCard
              accent="bg-[#edf3e6] text-[#3c714c]"
              detail="Assigned or authorized to your account"
              icon="⌘"
              label="My devices"
              value={formatCount(data.hubCount)}
            />
            <MetricCard
              accent="bg-[#e9f1f5] text-[#4c7188]"
              detail="From the latest device status records"
              icon="●"
              label="Online devices"
              value={formatCount(data.onlineHubCount)}
            />
          </>
        )}
      </div>
    </section>
  );
}
