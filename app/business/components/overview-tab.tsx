"use client";

import { useMemo, useState } from "react";
import type { DashboardData } from "@/lib/dashboard-data";
import { MetricCard, Panel, PanelHeading, StatusBadge } from "./dashboard-primitives";
import type { BusinessRole } from "./types";
import { initials } from "./dashboard-primitives";

type OverviewTabProps = {
  data: DashboardData;
  role: BusinessRole;
};

function formatCount(value: number | null) {
  return value === null ? "—" : value.toLocaleString();
}

function formatRevenue(value: number) {
  return `₱${value.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function dateKey(value: string) {
  return new Date(value).toLocaleDateString("en-CA");
}

export function OverviewTab({ data, role }: OverviewTabProps) {
  const [period, setPeriod] = useState<"all" | "date" | "month">("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [chartRange, setChartRange] = useState<"7d" | "30d" | "90d" | "1y">("7d");
  const admin = role === "admin";
  const sales = data.sales;
  const orders = sales.customers;
  const totalStock = data.storeProducts.reduce((sum, product) => sum + product.stock, 0);
  const filteredOrders = useMemo(() => orders.filter((order) => {
    if (order.deliveryStatus === "cancelled" || order.paymentStatus === "Failed") return false;
    const orderDate = dateKey(order.created_at);
    if (period === "date") return selectedDate ? orderDate === selectedDate : true;
    if (period === "month") return selectedMonth ? orderDate.startsWith(selectedMonth) : true;
    return true;
  }), [orders, period, selectedDate, selectedMonth]);

  const filteredRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const revenueByDate = filteredOrders.reduce<Record<string, number>>((totals, order) => {
    const key = dateKey(order.created_at);
    totals[key] = (totals[key] ?? 0) + order.total;
    return totals;
  }, {});
  const rangeDays = chartRange === "7d" ? 7 : chartRange === "30d" ? 30 : chartRange === "90d" ? 90 : 365;
  const revenueTrend = Object.entries(revenueByDate)
    .sort(([left], [right]) => left.localeCompare(right))
    .slice(-rangeDays)
    .map(([date, revenue]) => ({
      date,
      label: new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { weekday: "short" }),
      revenue,
    }));
  const maxTrendRevenue = Math.max(...revenueTrend.map((entry) => entry.revenue), 1);
  const chartPoints = revenueTrend.map((entry, index) => {
    const x = revenueTrend.length === 1 ? 50 : (index / (revenueTrend.length - 1)) * 100;
    const y = 92 - (entry.revenue / maxTrendRevenue) * 76;
    return { ...entry, x, y };
  });
  const chartLine = chartPoints.map((point) => `${point.x},${point.y}`).join(" ");
  const chartArea = chartPoints.length ? `0,100 ${chartLine} 100,100` : "";
  const revenueChange = revenueTrend.length > 1
    ? ((revenueTrend[revenueTrend.length - 1].revenue - revenueTrend[0].revenue) / Math.max(revenueTrend[0].revenue, 1)) * 100
    : 0;
  const paymentSplit = [
    { label: "COD", value: filteredOrders.filter((order) => order.paymentMethod === "Cash on delivery").length, color: "#f97316" },
    { label: "GCash", value: filteredOrders.filter((order) => order.paymentMethod === "GCash").length, color: "#72c7ed" },
  ];
  const paymentTotal = Math.max(paymentSplit.reduce((sum, item) => sum + item.value, 0), 1);
  const productTotals = Object.entries(
    filteredOrders.reduce<Record<string, number>>((totals, order) => {
      order.items.forEach((item) => {
        totals[item.name] = (totals[item.name] ?? 0) + item.quantity;
      });
      return totals;
    }, {}),
  )
    .sort(([, left], [, right]) => right - left)
    .slice(0, 4);
  const maxProductQuantity = Math.max(...productTotals.map(([, quantity]) => quantity), 1);
  const recentUsers = data.userAccounts.slice(0, 5);
  const recentConcerns = data.concerns.slice(0, 5);

  return (
    <section className="mb-6 flex flex-col scroll-mt-6" id="overview" aria-labelledby="overview-heading">
      <div className={`order-1 grid gap-3 sm:grid-cols-2 ${admin ? "xl:grid-cols-4" : "xl:grid-cols-2"}`}>
        {admin ? (
          <>
            <MetricCard gradient="from-[#3a1a0d] via-[#6b2d16] to-[#b9572e]" accent="bg-[#d87342] text-[#fff1e7]" compact detail="Registered in the device network" icon="⌘" label="Deployed hubs" value={formatCount(data.hubCount)} />
            <MetricCard gradient="from-[#102b42] via-[#1d5276] to-[#347eaa]" accent="bg-[#4b91bd] text-[#e5f6ff]" compact detail="Admin and staff accounts" icon="♧" label="Business accounts" value={formatCount(data.businessAccountCount)} />
            <MetricCard gradient="from-[#3b2b0d] via-[#70551b] to-[#aa842d]" accent="bg-[#c39a3c] text-[#fff5d5]" compact detail="Registered customer accounts" icon="◎" label="User accounts" value={formatCount(data.userAccountCount)} />
            <MetricCard gradient="from-[#123321] via-[#1d5b3b] to-[#32805a]" accent="bg-[#4da875] text-[#e7fff0]" compact detail="Units currently available for sale" icon="▦" label="Total stock" value={formatCount(totalStock)} />
          </>
        ) : (
          <>
            <MetricCard gradient="from-[#3a1a0d] via-[#6b2d16] to-[#b9572e]" accent="bg-[#d87342] text-[#fff1e7]" compact detail="Assigned or authorized to your account" icon="⌘" label="My devices" value={formatCount(data.hubCount)} />
          </>
        )}
      </div>

      <div className="order-3 mt-4">
        <Panel>
          <PanelHeading title="Live product stock" description="Current quantities available for ecommerce orders." action="Inventory" />
          <div className="space-y-4">
            {data.storeProducts.map((product) => (
              <div className="flex items-center justify-between gap-4" key={product.id}>
                <div>
                  <p className="text-sm font-medium text-[#f7f7f2]">{product.name}</p>
                  <p className="mt-1 text-xs text-[#777]">{product.category}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${product.stock <= 0 ? "bg-[#351719] text-[#ff8585]" : product.stock <= 3 ? "bg-[#2a1609] text-[#ff9a4d]" : "bg-[#17351f] text-[#72d98d]"}`}>
                  {product.stock} available
                </span>
              </div>
            ))}
            {data.storeProducts.length === 0 && <p className="text-sm text-[#888]">No product inventory found.</p>}
          </div>
        </Panel>

      </div>

      {admin && (
        <>
          <div className="order-2 mt-4 grid gap-4 xl:grid-cols-[1.4fr_0.6fr]">
            <Panel>
              <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-[#a6a6a0]">Total revenue</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <strong className="text-3xl font-semibold tracking-[-0.06em] text-[#f7f7f2]">{formatRevenue(filteredRevenue)}</strong>
                    <span className={`text-xs font-semibold ${revenueChange >= 0 ? "text-[#63d59b]" : "text-[#ff8585]"}`}>
                      {revenueChange >= 0 ? "↑" : "↓"} {Math.abs(revenueChange).toFixed(2)}%
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-[#666]">Compared with the first day in this view</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {(["7d", "30d", "90d", "1y"] as const).map((range) => (
                    <button className={`rounded-full px-3 py-1.5 text-[10px] ${chartRange === range ? "bg-[#f7f7f2] text-[#171717]" : "bg-[#242424] text-[#8d8d87]"}`} key={range} onClick={() => setChartRange(range)} type="button">
                      {range === "7d" ? "7 days" : range === "1y" ? "1 year" : range.replace("d", " days")}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-5 flex flex-wrap items-end gap-3">
                <label className="text-xs text-[#999]">Sales filter
                  <select className="mt-1 block rounded-lg border border-[#363636] bg-[#191919] px-3 py-2 text-xs text-[#f7f7f2]" onChange={(event) => setPeriod(event.target.value as typeof period)} value={period}>
                    <option value="all">All time</option>
                    <option value="date">Specific date</option>
                    <option value="month">Month</option>
                  </select>
                </label>
                {period === "date" && <label className="text-xs text-[#999]">Date<input className="mt-1 block rounded-lg border border-[#363636] bg-[#191919] px-3 py-2 text-xs text-[#f7f7f2]" onChange={(event) => setSelectedDate(event.target.value)} type="date" value={selectedDate} /></label>}
                {period === "month" && <label className="text-xs text-[#999]">Month<input className="mt-1 block rounded-lg border border-[#363636] bg-[#191919] px-3 py-2 text-xs text-[#f7f7f2]" onChange={(event) => setSelectedMonth(event.target.value)} type="month" value={selectedMonth} /></label>}
              </div>
              {revenueTrend.length === 0 ? (
                <p className="text-sm text-[#888]">No revenue data matches this filter.</p>
              ) : (
                <div>
                  <div className="relative h-64 overflow-hidden rounded-xl border border-[#292929] bg-[#0d0d0d]">
                    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between px-3 py-5">
                      {[0, 1, 2, 3].map((line) => <span className="border-t border-dashed border-[#272727]" key={line} />)}
                    </div>
                    <svg className="relative h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100" role="img" aria-label="Revenue area chart">
                      <defs>
                        <linearGradient id="revenue-area" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#f28a32" stopOpacity=".78" />
                          <stop offset="100%" stopColor="#7b2c14" stopOpacity=".08" />
                        </linearGradient>
                      </defs>
                      <polygon fill="url(#revenue-area)" points={chartArea} />
                      <polyline fill="none" points={chartLine} stroke="#f08a32" strokeLinecap="round" strokeLinejoin="round" strokeWidth=".8" vectorEffect="non-scaling-stroke" />
                      {chartPoints.map((point) => (
                        <circle cx={point.x} cy={point.y} fill="#f7f7f2" key={point.date} r="1.25" stroke="#f08a32" strokeWidth=".8" vectorEffect="non-scaling-stroke">
                          <title>{`${point.label}: ${formatRevenue(point.revenue)}`}</title>
                        </circle>
                      ))}
                    </svg>
                  </div>
                  <div className="mt-3 flex justify-between px-1 text-[10px] uppercase tracking-[0.12em] text-[#666]">
                    {revenueTrend.filter((_, index) => index === 0 || index === revenueTrend.length - 1 || index === Math.floor(revenueTrend.length / 2)).map((entry) => <span key={entry.date}>{entry.label}</span>)}
                  </div>
                </div>
              )}
            </Panel>

            <div className="space-y-4">
            <Panel>
              <PanelHeading title="Payment mix" description="Order share by payment method." action={`${filteredOrders.length} total`} />
              <div className="flex items-center gap-5">
                <div
                  className="grid h-32 w-32 shrink-0 place-items-center rounded-full"
                  style={{ background: `conic-gradient(${paymentSplit[0].color} 0 ${(paymentSplit[0].value / paymentTotal) * 100}%, ${paymentSplit[1].color} ${(paymentSplit[0].value / paymentTotal) * 100}% 100%)` }}
                >
                  <div className="grid h-24 w-24 place-items-center rounded-full bg-[#111]">
                    <strong className="text-2xl text-[#f7f7f2]">{filteredOrders.length}</strong>
                    <span className="text-[10px] uppercase tracking-wider text-[#777]">orders</span>
                  </div>
                </div>
                <div className="min-w-0 flex-1 space-y-4">
                  {paymentSplit.map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs"><span className="text-[#aaa]">{item.label}</span><strong className="text-[#f7f7f2]">{item.value}</strong></div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#292929]"><span className="block h-full rounded-full" style={{ backgroundColor: item.color, width: `${(item.value / paymentTotal) * 100}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
            <Panel>
              <PanelHeading title="Recent user concerns" description="Latest customer support messages." action={`${data.concerns.length} recorded`} />
              <div className="space-y-3">
                {recentConcerns.map((concern) => (
                  <div className="border-b border-[#242424] pb-3 last:border-0 last:pb-0" key={concern.id}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        {concern.avatar_url ? (
                          <img alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" src={concern.avatar_url} />
                        ) : (
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2a1609] text-[10px] font-semibold text-[#ff9a4d]">{initials(concern.name)}</span>
                        )}
                        <p className="truncate text-sm text-[#f7f7f2]">{concern.name}</p>
                      </div>
                      <StatusBadge status={concern.status.replace("_", " ")} />
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#888]">{concern.message}</p>
                  </div>
                ))}
                {recentConcerns.length === 0 && <p className="text-sm text-[#888]">No user concerns recorded.</p>}
              </div>
            </Panel>
            </div>
          </div>

          <Panel className="order-4 mt-5">
            <PanelHeading title="Top products" description="Units sold in the active sales filter." action="Product performance" />
            {productTotals.length === 0 ? (
              <p className="text-sm text-[#888]">No product sales match this filter.</p>
            ) : (
              <div className="grid gap-x-8 gap-y-5 md:grid-cols-2">
                {productTotals.map(([name, quantity], index) => (
                  <div key={name}>
                    <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                      <span className="truncate text-[#c8c6bd]"><span className="mr-2 text-[#666]">0{index + 1}</span>{name}</span>
                      <strong className="text-[#f7f7f2]">{quantity} units</strong>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#292929]">
                      <span className="block h-full rounded-full bg-gradient-to-r from-[#f97316] to-[#ffbd66]" style={{ width: `${(quantity / maxProductQuantity) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel className="order-5 mt-4">
            <PanelHeading title="Sales tracking" description="Filter completed and active ecommerce orders by date or month." action={`${filteredOrders.length} orders`} />
            {filteredOrders.length === 0 ? <p className="text-sm text-[#888]">No sales match this filter.</p> : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-xs">
                  <thead><tr className="border-b border-[#292929] text-[10px] uppercase tracking-[0.12em] text-[#777]"><th className="px-3 py-3">Buyer</th><th className="px-3 py-3">Items</th><th className="px-3 py-3">Payment</th><th className="px-3 py-3">Total</th><th className="px-3 py-3">Date</th></tr></thead>
                  <tbody>{filteredOrders.map((order) => <tr className="border-b border-[#242424] last:border-0" key={order.id}><td className="px-3 py-3"><div className="flex items-center gap-2">{order.avatar_url ? <img alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" src={order.avatar_url} /> : <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2a1609] text-[10px] font-semibold text-[#ff9a4d]">{initials(order.name)}</span>}<div className="min-w-0"><p className="truncate font-medium text-[#f0efe9]">{order.name}</p><p className="mt-1 truncate text-[#777]">{order.email}</p></div></div></td><td className="px-3 py-3 text-[#c8c6bd]">{order.items.map((item) => `${item.name} × ${item.quantity}`).join(", ")}</td><td className="px-3 py-3"><StatusBadge status={order.paymentMethod} /></td><td className="px-3 py-3 font-semibold text-[#ff9a4d]">{formatRevenue(order.total)}</td><td className="px-3 py-3 text-[#999]">{new Date(order.created_at).toLocaleDateString()}</td></tr>)}</tbody>
                </table>
              </div>
            )}
          </Panel>

          <div className="order-6 mt-4 grid gap-4 xl:grid-cols-2">
            <Panel>
              <PanelHeading title="New users" description="Recently registered ecommerce customers." action={`${data.userAccountCount ?? 0} total`} />
              <div className="space-y-3">{recentUsers.map((user) => <div className="flex items-center justify-between gap-3 border-b border-[#242424] pb-3 last:border-0 last:pb-0" key={user.id}><div><p className="text-sm text-[#f7f7f2]">{[user.firstname, user.lastname].filter(Boolean).join(" ")}</p><p className="mt-1 text-xs text-[#777]">{user.email}</p></div><span className="text-xs text-[#888]">{new Date(user.created_at).toLocaleDateString()}</span></div>)}</div>
            </Panel>
          </div>
        </>
      )}
    </section>
  );
}
