"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateInventoryStock, type InventoryActionState } from "@/app/actions/inventory";
import type { DashboardData } from "@/lib/dashboard-data";
import { Panel, PanelHeading } from "./dashboard-primitives";

type InventoryTabProps = {
  products: DashboardData["storeProducts"];
  sales: DashboardData["sales"];
};

const initialState: InventoryActionState = {};

export function InventoryTab({ products, sales }: InventoryTabProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(updateInventoryStock, initialState);

  useEffect(() => {
    if (state.success) router.refresh();
  }, [router, state.success]);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-medium text-[#718078]">Ecommerce operations</p>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.04em] text-[#f7f7f2] sm:text-3xl">Sales & inventory</h1>
        <p className="mt-2 text-sm text-[#888]">Update available stock here and the ecommerce website will reflect it.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#292929] bg-[#111111] p-5">
          <p className="text-xs text-[#888]">Total revenue</p>
          <p className="mt-3 text-3xl font-semibold text-[#f7f7f2]">₱{sales.revenue.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="rounded-2xl border border-[#292929] bg-[#111111] p-5">
          <p className="text-xs text-[#888]">Orders</p>
          <p className="mt-3 text-3xl font-semibold text-[#f7f7f2]">{sales.orderCount.toLocaleString()}</p>
        </div>
      </div>
      {state.error ? <p className="text-sm text-[#ff8585]" role="alert">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-[#72d98d]" role="status">{state.success}</p> : null}
      <Panel>
        <PanelHeading
          title="Inventory at a glance"
          description="Current stock available on the ecommerce website."
          action="Live stock"
        />
        {products.length === 0 ? (
          <p className="text-sm text-[#888]">Inventory data is not available yet.</p>
        ) : (
          <div className="flex h-64 items-end gap-3 border-b border-[#292929] px-2 pb-8 pt-5">
            {products.map((product) => {
              const maxStock = Math.max(...products.map((item) => item.stock), 1);
              const height = product.stock
                ? Math.max((product.stock / maxStock) * 100, 8)
                : 4;
              return (
                <div className="group relative flex h-full flex-1 items-end" key={product.id}>
                  <div className="relative flex h-full w-full items-end">
                    <span
                      className={`w-full rounded-t-md transition ${
                        product.stock <= 3
                          ? "bg-[#ef4444]"
                          : product.stock <= 8
                            ? "bg-[#f59e0b]"
                            : "bg-[#72d98d]"
                      }`}
                      style={{ height: `${height}%` }}
                      title={`${product.name}: ${product.stock} available`}
                    />
                    <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-[#252525] px-2 py-1 text-[10px] text-[#f7f7f2] group-hover:block">
                      {product.stock} available
                    </span>
                  </div>
                  <span className="absolute left-1/2 top-full mt-2 w-full -translate-x-1/2 text-center text-[10px] text-[#888]">
                    {product.name}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
      <Panel>
        <PanelHeading title="Product stock" description="Only active business admins can change these values." action="Live ecommerce stock" />
        <div className="space-y-3">
          {products.map((product) => (
            <form action={formAction} className="flex flex-wrap items-center justify-between gap-4 border-b border-[#292929] py-4 last:border-b-0" key={product.id}>
              <input name="productId" type="hidden" value={product.id} />
              <div>
                <p className="text-sm font-medium text-[#f7f7f2]">{product.name}</p>
                <p className="mt-1 text-xs text-[#888]">{product.category} · ₱{product.price.toLocaleString()}</p>
              </div>
              <label className="flex items-center gap-3 text-xs text-[#999]">
                Stock
                <input className="w-24 rounded-lg border border-[#363636] bg-[#191919] px-3 py-2 text-sm text-[#f7f7f2]" defaultValue={product.stock} min="0" name="stock" type="number" />
                <button className="rounded-lg bg-[#f97316] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#ea580c] disabled:opacity-50" disabled={pending} type="submit">{pending ? "Saving..." : "Save"}</button>
              </label>
            </form>
          ))}
        </div>
      </Panel>
      <Panel>
        <PanelHeading title="Recent sales" description="Orders placed through the ecommerce website." />
        {sales.recentOrders.length === 0 ? <p className="text-sm text-[#888]">No ecommerce orders yet.</p> : (
          <div className="space-y-3">
            {sales.recentOrders.map((order) => (
              <div className="flex items-center justify-between gap-4 border-b border-[#292929] py-3 last:border-b-0" key={order.id}>
                <div><p className="text-sm text-[#f7f7f2]">{order.id}</p><p className="mt-1 text-xs text-[#888]">{new Date(order.created_at).toLocaleString()}</p></div>
                <p className="text-sm font-semibold text-[#ff9a4d]">₱{order.total.toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </section>
  );
}