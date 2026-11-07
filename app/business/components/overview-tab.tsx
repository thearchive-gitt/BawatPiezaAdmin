import type { DashboardData } from "@/lib/dashboard-data";
import { MetricCard } from "./dashboard-primitives";
import type { BusinessRole } from "./types";
import { Panel, PanelHeading } from "./dashboard-primitives";

type OverviewTabProps = {
  data: DashboardData;
  role: BusinessRole;
};

function formatCount(value: number | null) {
  return value === null ? "—" : value.toLocaleString();
}

function formatRevenue(value: number) {
  return `₱${value.toLocaleString("en-PH", { maximumFractionDigits: 0 })}`;
}

export function OverviewTab({ data, role }: OverviewTabProps) {
  const admin = role === "admin";
  const sales = data.sales ?? {
    revenue: 0,
    orderCount: 0,
    trend: [],
    recentOrders: [],
  };
  const salesTrend = sales.trend ?? [];
  const online = data.onlineHubCount ?? 0;
  const offline = Math.max((data.hubCount ?? 0) - online, 0);
  const maintenance = data.maintenanceHubCount ?? 0;
  const chartValues = [
    Math.max(online, 1),
    Math.max(data.businessAccountCount ?? 0, 1),
    Math.max(data.userAccountCount ?? 0, 1),
    Math.max(data.hubCount ?? 0, 1),
    Math.max(maintenance, 1),
    Math.max(online + maintenance, 1),
  ];
  const chartMax = Math.max(...chartValues);
  const chartPoints = chartValues
    .map((value, index) => `${index * 20},${88 - (value / chartMax) * 70}`)
    .join(" ");

  return (
    <section
      className="mb-6 flex flex-col scroll-mt-6"
      id="overview"
      aria-labelledby="overview-heading"
    >
      <div className="order-2 mt-5 grid gap-5 xl:grid-cols-[1.45fr_0.85fr]">
        <Panel>
          <PanelHeading
            title="System activity"
            description="Current operating signal across the BawatPieza network."
            action="Live overview"
          />
          <div className="h-52">
            <svg
              aria-label="System activity trend"
              className="h-full w-full overflow-visible"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              role="img"
            >
              {[18, 42, 66, 90].map((y) => (
                <line
                  key={y}
                  x1="0"
                  x2="100"
                  y1={y}
                  y2={y}
                  stroke="#292929"
                  strokeWidth="0.5"
                />
              ))}
              <polyline
                points={chartPoints}
                fill="none"
                stroke="#f97316"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
              <polyline
                points={`0,100 ${chartPoints} 100,100`}
                fill="url(#activityFill)"
                stroke="none"
              />
              <defs>
                <linearGradient id="activityFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="#f97316" stopOpacity="0.28" />
                  <stop offset="1" stopColor="#f97316" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.12em] text-[#666]">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Today"].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
        </Panel>

        <Panel>
          <PanelHeading
            title="Network health"
            description="Device availability at a glance."
          />
          <div className="flex items-center gap-6">
            <div
              className="grid h-32 w-32 shrink-0 place-items-center rounded-full"
              style={{
                background: `conic-gradient(#f97316 ${(online / Math.max(online + offline, 1)) * 100}%, #303030 0)`,
              }}
            >
              <div className="grid h-24 w-24 place-items-center rounded-full bg-[#111]">
                <strong className="text-2xl text-[#f7f7f2]">{online}</strong>
                <span className="-mt-2 text-[10px] uppercase tracking-wider text-[#777]">online</span>
              </div>
            </div>
            <div className="space-y-4 text-xs">
              <div><span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#f97316]" />Online <strong className="ml-3 text-[#f7f7f2]">{online}</strong></div>
              <div><span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#444]" />Offline <strong className="ml-3 text-[#f7f7f2]">{offline}</strong></div>
              <div><span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#ffb15c]" />Maintenance <strong className="ml-3 text-[#f7f7f2]">{maintenance}</strong></div>
            </div>
          </div>
        </Panel>
      </div>

      <div
        className={`order-1 grid gap-3 sm:grid-cols-2 ${
          admin ? "xl:w-[78%] xl:grid-cols-3 2xl:w-[72%]" : "xl:grid-cols-2"
        }`}
      >
        {admin ? (
          <>
            <MetricCard
              accent="bg-[#2a1609] text-[#ff9a4d]"
              compact
              gradient="from-[#211308] via-[#111111] to-[#111111]"
              detail="Registered in the device network"
              icon="⌘"
              label="Deployed hubs"
              value={formatCount(data.hubCount)}
            />
            <MetricCard
              accent="bg-[#172b35] text-[#7ac7ed]"
              compact
              gradient="from-[#102631] via-[#111111] to-[#111111]"
              detail="Hub status reported as online"
              icon="●"
              label="Online hubs"
              value={formatCount(data.onlineHubCount)}
            />
            <MetricCard
              accent="bg-[#292039] text-[#c5a5ff]"
              compact
              gradient="from-[#211934] via-[#111111] to-[#111111]"
              detail="Admin and staff accounts"
              icon="♧"
              label="Business accounts"
              value={formatCount(data.businessAccountCount)}
            />
            <MetricCard
              accent="bg-[#35230b] text-[#ffbd66]"
              compact
              gradient="from-[#2c1d0b] via-[#111111] to-[#111111]"
              detail="Registered customer accounts"
              icon="◎"
              label="User accounts"
              value={formatCount(data.userAccountCount)}
            />
            <MetricCard
              accent="bg-[#17351f] text-[#72d98d]"
              compact
              gradient="from-[#102b1a] via-[#111111] to-[#111111]"
              detail={`${sales.orderCount.toLocaleString()} ecommerce orders`}
              icon="₱"
              label="Ecommerce revenue"
              value={`₱${sales.revenue.toLocaleString("en-PH", { maximumFractionDigits: 2 })}`}
            />
            <MetricCard
              accent="bg-[#292039] text-[#c5a5ff]"
              compact
              gradient="from-[#211934] via-[#111111] to-[#111111]"
              detail="Products managed in ecommerce inventory"
              icon="▦"
              label="Products in stock"
              value={formatCount(data.storeProducts.length)}
            />
          </>
        ) : (
          <>
            <MetricCard
              accent="bg-[#2a1609] text-[#ff9a4d]"
              compact
              detail="Assigned or authorized to your account"
              icon="⌘"
              label="My devices"
              value={formatCount(data.hubCount)}
            />
            <MetricCard
              accent="bg-[#172b35] text-[#7ac7ed]"
              compact
              detail="From the latest device status records"
              icon="●"
              label="Online devices"
              value={formatCount(data.onlineHubCount)}
            />
          </>
        )}
      </div>

      {admin ? (
        <Panel className="order-3 mt-5">
          <PanelHeading
            title="Sales performance"
            description="Revenue and order volume for the last seven days."
            action="Ecommerce"
          />
          {salesTrend.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-[1fr_180px]">
              <div>
                <div className="flex h-56 items-end gap-2 border-b border-[#292929] px-1 pt-5">
                  {salesTrend.map((entry) => {
                    const maxRevenue = Math.max(
                      ...salesTrend.map((item) => item.revenue),
                      1,
                    );
                    const height = entry.revenue
                      ? Math.max((entry.revenue / maxRevenue) * 100, 8)
                      : 4;
                    return (
                      <div className="flex h-full flex-1 items-end" key={entry.date}>
                        <div className="group relative flex h-full w-full items-end">
                          <span
                            className="w-full rounded-t-md bg-[#f97316] transition hover:bg-[#ff9a4d]"
                            style={{ height: `${height}%` }}
                            title={`${entry.label}: ${formatRevenue(entry.revenue)} · ${entry.orders} orders`}
                          />
                          <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-[#252525] px-2 py-1 text-[10px] text-[#f7f7f2] group-hover:block">
                            {formatRevenue(entry.revenue)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 flex gap-2 px-1">
                  {salesTrend.map((entry) => (
                    <span className="flex-1 text-center text-[10px] uppercase tracking-[0.12em] text-[#666]" key={entry.date}>
                      {entry.label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-[#292929] bg-[#171717] p-4">
                <p className="text-[10px] uppercase tracking-[0.14em] text-[#777]">7-day total</p>
                <p className="mt-2 text-2xl font-semibold text-[#f7f7f2]">
                  {formatRevenue(salesTrend.reduce((sum, entry) => sum + entry.revenue, 0))}
                </p>
                <p className="mt-1 text-xs text-[#888]">
                  {salesTrend.reduce((sum, entry) => sum + entry.orders, 0)} orders
                </p>
                <div className="mt-6 space-y-3">
                  {salesTrend.slice(-3).map((entry) => (
                    <div className="flex items-center justify-between gap-3 text-xs" key={entry.date}>
                      <span className="text-[#888]">{entry.label}</span>
                      <span className="text-[#ff9a4d]">{entry.orders} orders</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#888]">Sales data is not available yet.</p>
          )}
        </Panel>
      ) : null}
    </section>
  );
}
