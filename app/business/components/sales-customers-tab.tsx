"use client";

import type { DashboardData } from "@/lib/dashboard-data";
import { initials, PaginationControls, Panel, PanelHeading, StatusBadge } from "./dashboard-primitives";
import { DeliveryStatusForm } from "./delivery-status-form";
import { useCallback, useState } from "react";

const deliveryStatusOptions = [
  { value: "all", label: "All delivery statuses" },
  { value: "received", label: "Order received" },
  { value: "preparing", label: "Preparing order" },
  { value: "pickup", label: "Courier pickup" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export function SalesCustomersTab({
  customers,
}: {
  customers: DashboardData["sales"]["customers"];
}) {
  const [customerRows, setCustomerRows] = useState(customers);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<(typeof deliveryStatusOptions)[number]["value"]>("all");
  const pageSize = 10;
  const filteredCustomers =
    statusFilter === "all"
      ? customerRows
      : customerRows.filter((customer) => customer.deliveryStatus === statusFilter);
  const pageCount = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleCustomers = filteredCustomers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const updateCustomerStatus = useCallback((
    orderId: string,
    deliveryStatus: DashboardData["sales"]["customers"][number]["deliveryStatus"],
  ) => {
    setCustomerRows((currentCustomers) =>
      currentCustomers.map((customer) =>
        customer.id === orderId ? { ...customer, deliveryStatus } : customer,
      ),
    );
  }, []);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.04em] text-[#f7f7f2] sm:text-3xl">
          Ecommerce customers
        </h1>
      </div>

      <Panel>
        <PanelHeading
          title="Customers who purchased"
          description={`${customers.length.toLocaleString()} order${customers.length === 1 ? "" : "s"} recorded`}
          action={
            <div className="flex flex-wrap items-center justify-end gap-3">
              <span className="text-xs text-[#777]">
                {filteredCustomers.length.toLocaleString()} matching order{filteredCustomers.length === 1 ? "" : "s"}
              </span>
              <label className="sr-only" htmlFor="customer-delivery-status-filter">
                Filter by delivery status
              </label>
              <select
                aria-label="Filter by delivery status"
                className="rounded-lg border border-[#363636] bg-[#191919] px-3 py-2 text-xs text-[#f7f7f2]"
                id="customer-delivery-status-filter"
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value as typeof statusFilter);
                  setPage(1);
                }}
              >
                {deliveryStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          }
        />
        {customerRows.length === 0 ? (
          <p className="text-sm text-[#888]">No ecommerce customers yet.</p>
        ) : (
          <>
            {filteredCustomers.length === 0 ? (
              <p className="text-sm text-[#888]">No orders match this delivery status.</p>
            ) : (
              <div className="max-w-full overflow-x-auto">
                <table className="w-full min-w-[1540px] text-left text-xs">
              <thead>
                <tr className="border-b border-[#292929] text-[10px] uppercase tracking-[0.12em] text-[#777]">
                  <th className="sticky left-0 z-30 w-[220px] min-w-[220px] bg-[#111111] px-3 py-3 font-medium shadow-[4px_0_8px_rgba(0,0,0,0.12)]">Customer</th>
                  <th className="sticky left-[220px] z-30 w-[180px] min-w-[180px] bg-[#111111] px-3 py-3 font-medium">Order reference</th>
                  <th className="sticky left-[400px] z-30 w-[280px] min-w-[280px] bg-[#111111] px-3 py-3 font-medium shadow-[4px_0_8px_rgba(0,0,0,0.12)]">Product</th>
                  <th className="w-[240px] min-w-[240px] px-3 py-3 font-medium">Contact</th>
                  <th className="w-[280px] min-w-[280px] px-3 py-3 font-medium">Delivery address</th>
                  <th className="w-[140px] min-w-[140px] px-3 py-3 font-medium">Order total</th>
                  <th className="w-[140px] min-w-[140px] px-3 py-3 font-medium">Payment</th>
                  <th className="w-[180px] min-w-[180px] px-3 py-3 font-medium">Delivery</th>
                  <th className="w-[140px] min-w-[140px] px-3 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {visibleCustomers.map((customer) => (
                  <tr className="border-b border-[#242424] last:border-0" key={customer.id}>
                    <td className="sticky left-0 z-20 w-[220px] min-w-[220px] bg-[#111111] px-3 py-4 shadow-[4px_0_8px_rgba(0,0,0,0.12)]">
                      <div className="flex items-center gap-2.5">
                        {customer.avatar_url ? (
                          <img alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" src={customer.avatar_url} />
                        ) : (
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2a1609] text-[10px] font-semibold text-[#ff9a4d]">
                            {initials(customer.name)}
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium text-[#f0efe9]">{customer.name}</p>
                          <p className="mt-1 truncate text-[#888]">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="sticky left-[220px] z-20 w-[180px] min-w-[180px] bg-[#111111] px-3 py-4 font-mono text-[11px] text-[#c8c6bd]">{customer.id}</td>
                    <td className="sticky left-[400px] z-20 w-[280px] min-w-[280px] bg-[#111111] px-3 py-4 text-[#c8c6bd] shadow-[4px_0_8px_rgba(0,0,0,0.12)]">
                      {customer.items.length > 0
                        ? customer.items.map((item) => `${item.name} × ${item.quantity}`).join(", ")
                        : "—"}
                      <div className="mt-2">
                        <StatusBadge status={customer.deliveryStatus} />
                      </div>
                    </td>
                    <td className="w-[240px] min-w-[240px] px-3 py-4 text-[#999]">
                      <p>{customer.phone}</p>
                      <p className="mt-1">{customer.email}</p>
                    </td>
                    <td className="w-[280px] min-w-[280px] max-w-64 px-3 py-4 text-[#999]">
                      <p>{customer.address}</p>
                      <p className="mt-1">{customer.city}, {customer.postalCode}</p>
                      <p className="mt-1 text-[#777]">Landmark: {customer.landmark}</p>
                    </td>
                    <td className="w-[140px] min-w-[140px] px-3 py-4 font-semibold text-[#ff9a4d]">
                      ₱{customer.total.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="w-[140px] min-w-[140px] px-3 py-4">
                      <StatusBadge status={customer.paymentStatus} />
                    </td>
                    <td className="w-[180px] min-w-[180px] px-3 py-4">
                      <DeliveryStatusForm
                        orderId={customer.id}
                        deliveryStatus={customer.deliveryStatus}
                        onStatusUpdated={updateCustomerStatus}
                      />
                    </td>
                    <td className="w-[140px] min-w-[140px] px-3 py-4 text-[#999]">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
                </table>
              </div>
            )}
          </>
        )}
        {filteredCustomers.length > 0 && (
          <PaginationControls currentPage={currentPage} pageCount={pageCount} resultCount={filteredCustomers.length} label="orders" onPageChange={setPage} />
        )}
      </Panel>
    </section>
  );
}
