"use client";

import { useState } from "react";
import type { DashboardData } from "@/lib/dashboard-data";
import { NewBadge, PaginationControls, Panel, PanelHeading, StatusBadge } from "./dashboard-primitives";

type ProjectSale = DashboardData["sales"]["projectSales"][number];
type ProductOrder = DashboardData["sales"]["customers"][number];

type SalesTableRow = {
  id: string;
  updatedAt: string;
  saleType: "Project quotation" | "Product order";
  organization: string;
  reference: string;
  details: string;
  tiles: number | null;
  projectTotal: number;
  downpaymentAmount: number | null;
  downpaymentStatus: ProjectSale["downpaymentStatus"] | "paid";
  balanceRemaining: number;
  isNew: boolean;
  searchText: string;
};

const currency = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
});

const statusOptions = [
  { value: "all", label: "All payment statuses" },
  { value: "unpaid", label: "Not submitted" },
  { value: "pending", label: "Awaiting review" },
  { value: "rejected", label: "Rejected" },
  { value: "verified", label: "Verified" },
  { value: "paid", label: "Paid product orders" },
] as const;

function downpaymentStatusLabel(status: SalesTableRow["downpaymentStatus"]) {
  if (status === "paid") return "Paid in full";
  if (status === "pending") return "Awaiting review";
  if (status === "verified") return "Verified";
  if (status === "rejected") return "Rejected";
  return "Not submitted";
}

export function SalesTab({
  sales,
  orders,
  newProjectSalesIds,
  newOrderIds,
}: {
  sales: ProjectSale[];
  orders: ProductOrder[];
  newProjectSalesIds: string[];
  newOrderIds: string[];
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]["value"]>("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const normalizedSearch = search.trim().toLowerCase();
  const salesRows: SalesTableRow[] = [
    ...sales.map((sale) => ({
      id: `assessment-${sale.assessmentId}`,
      updatedAt: sale.updatedAt,
      saleType: "Project quotation" as const,
      organization: sale.organization,
      reference: sale.quotationNo,
      details: sale.paymentReference ? `Payment ref: ${sale.paymentReference}` : `Assessment: ${sale.assessmentId}`,
      tiles: sale.tiles,
      projectTotal: sale.projectTotal,
      downpaymentAmount: sale.downpaymentAmount,
      downpaymentStatus: sale.downpaymentStatus,
      balanceRemaining: sale.balanceRemaining,
      isNew: newProjectSalesIds.includes(sale.assessmentId),
      searchText: `${sale.organization} ${sale.quotationNo} ${sale.assessmentId} ${sale.paymentReference ?? ""}`,
    })),
    ...orders
      .filter((order) => order.paymentStatus === "Paid" && order.deliveryStatus !== "cancelled")
      .map((order) => ({
        id: `order-${order.id}`,
        updatedAt: order.created_at,
        saleType: "Product order" as const,
        organization: order.name,
        reference: order.id,
        details: order.items.map((item) => `${item.name} × ${item.quantity}`).join(", "),
        tiles: null,
        projectTotal: order.total,
        downpaymentAmount: order.total,
        downpaymentStatus: "paid" as const,
        balanceRemaining: 0,
        isNew: newOrderIds.includes(order.id),
        searchText: `${order.name} ${order.id} ${order.items.map((item) => item.name).join(" ")}`,
      })),
  ].sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
  const filteredSales = salesRows.filter((sale) => {
    if (statusFilter !== "all" && sale.downpaymentStatus !== statusFilter) return false;
    if (!normalizedSearch) return true;
    return sale.searchText.toLowerCase().includes(normalizedSearch);
  });
  const verifiedDownpayments = sales.reduce(
    (total, sale) => total + (sale.downpaymentStatus === "verified" ? sale.downpaymentAmount ?? 0 : 0),
    0,
  );
  const outstandingBalance = sales.reduce((total, sale) => total + sale.balanceRemaining, 0);
  const pageCount = Math.max(1, Math.ceil(filteredSales.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleSales = filteredSales.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-medium text-[#718078]">Ecommerce operations</p>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.04em] text-[#f7f7f2] sm:text-3xl">Sales</h1>
        <p className="mt-2 text-sm text-[#888]">Monitor quoted projects, accepted tile quantities, verified downpayments, and client balances.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#292929] bg-[#111111] p-5">
          <p className="text-xs text-[#888]">Quoted projects</p>
          <p className="mt-3 text-2xl font-semibold text-[#f7f7f2]">{sales.length.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-[#292929] bg-[#111111] p-5">
          <p className="text-xs text-[#888]">Verified downpayments</p>
          <p className="mt-3 text-2xl font-semibold text-[#72d98d]">{currency.format(verifiedDownpayments)}</p>
        </div>
        <div className="rounded-2xl border border-[#292929] bg-[#111111] p-5">
          <p className="text-xs text-[#888]">Remaining client balance</p>
          <p className="mt-3 text-2xl font-semibold text-[#ff9a4d]">{currency.format(outstandingBalance)}</p>
        </div>
      </div>

      <Panel>
        <PanelHeading
          title="Project sales and balances"
          description="Tracks paid product orders and issued project quotations. Balance due subtracts only admin-verified downpayments."
          action={`${filteredSales.length} matching projects`}
        />
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <label className="min-w-[220px] flex-1">
            <span className="sr-only">Search sales</span>
            <input
              className="w-full rounded-lg border border-[#363636] bg-[#191919] px-3 py-2.5 text-xs text-[#f7f7f2] placeholder:text-[#777]"
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search organization, quotation, or reference"
              type="search"
              value={search}
            />
          </label>
          <label>
            <span className="sr-only">Filter by downpayment status</span>
            <select
              className="rounded-lg border border-[#363636] bg-[#191919] px-3 py-2.5 text-xs text-[#f7f7f2]"
              onChange={(event) => {
                setStatusFilter(event.target.value as typeof statusFilter);
                setPage(1);
              }}
              value={statusFilter}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>

        {visibleSales.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#888]">
            {salesRows.length === 0 ? "No paid orders or project quotations to track yet." : "No sales match this search or payment status."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-xs">
              <thead>
                <tr className="border-b border-[#292929] text-[10px] uppercase tracking-[0.12em] text-[#777]">
                  <th className="px-3 py-3 font-medium">Sale / customer</th>
                  <th className="px-3 py-3 font-medium">Tiles</th>
                  <th className="px-3 py-3 font-medium">Sale total</th>
                  <th className="px-3 py-3 font-medium">Downpayment / paid</th>
                  <th className="px-3 py-3 font-medium">Remaining balance</th>
                  <th className="px-3 py-3 font-medium">Payment status</th>
                  <th className="px-3 py-3 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody>
                {visibleSales.map((sale) => (
                  <tr className="border-b border-[#242424] last:border-0" key={sale.id}>
                    <td className="px-3 py-4">
                      <div className="mb-1"><StatusBadge status={sale.saleType} /></div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-[#f0efe9]">{sale.organization}</p>
                        {sale.isNew && <NewBadge />}
                      </div>
                      <p className="mt-1 font-mono text-[11px] text-[#999]">{sale.reference}</p>
                      {sale.details && <p className="mt-1 max-w-[260px] truncate text-[10px] text-[#777]">{sale.details}</p>}
                    </td>
                    <td className="px-3 py-4 text-[#c8c6bd]">{sale.tiles?.toLocaleString() ?? "—"}</td>
                    <td className="px-3 py-4 font-semibold text-[#f0efe9]">{currency.format(sale.projectTotal)}</td>
                    <td className="px-3 py-4">
                      <p className="text-[#c8c6bd]">{sale.downpaymentAmount === null ? "—" : currency.format(sale.downpaymentAmount)}</p>
                      <div className="mt-1"><StatusBadge status={downpaymentStatusLabel(sale.downpaymentStatus)} /></div>
                    </td>
                    <td className="px-3 py-4 font-semibold text-[#ff9a4d]">{currency.format(sale.balanceRemaining)}</td>
                    <td className="px-3 py-4"><StatusBadge status={downpaymentStatusLabel(sale.downpaymentStatus)} /></td>
                    <td className="px-3 py-4 text-[#999]">{new Date(sale.updatedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <PaginationControls
              currentPage={currentPage}
              pageCount={pageCount}
              resultCount={filteredSales.length}
              label="projects"
              onPageChange={setPage}
            />
          </div>
        )}
      </Panel>
    </section>
  );
}
