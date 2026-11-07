import type { DashboardData } from "@/lib/dashboard-data";
import { Panel, PanelHeading, StatusBadge } from "./dashboard-primitives";
import { updateDeliveryStatus } from "@/app/actions/orders";

export function SalesCustomersTab({
  customers,
}: {
  customers: DashboardData["sales"]["customers"];
}) {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-medium text-[#718078]">Ecommerce operations</p>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.04em] text-[#f7f7f2] sm:text-3xl">
          Ecommerce customers
        </h1>
        <p className="mt-2 text-sm text-[#888]">
          Customers and products from ecommerce orders. Online payment is reserved for a future configuration.
        </p>
      </div>

      <Panel>
        <PanelHeading
          title="Customers who purchased"
          description={`${customers.length.toLocaleString()} order${customers.length === 1 ? "" : "s"} recorded`}
          action="Payment pending"
        />
        {customers.length === 0 ? (
          <p className="text-sm text-[#888]">No ecommerce customers yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-xs">
              <thead>
                <tr className="border-b border-[#292929] text-[10px] uppercase tracking-[0.12em] text-[#777]">
                  <th className="px-3 py-3 font-medium">Customer</th>
                  <th className="px-3 py-3 font-medium">Product</th>
                  <th className="px-3 py-3 font-medium">Contact</th>
                  <th className="px-3 py-3 font-medium">Order total</th>
                  <th className="px-3 py-3 font-medium">Payment</th>
                  <th className="px-3 py-3 font-medium">Delivery</th>
                  <th className="px-3 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr className="border-b border-[#242424] last:border-0" key={customer.id}>
                    <td className="px-3 py-4">
                      <p className="font-medium text-[#f0efe9]">{customer.name}</p>
                      <p className="mt-1 text-[#888]">{customer.email}</p>
                    </td>
                    <td className="px-3 py-4 text-[#c8c6bd]">
                      {customer.items.length > 0
                        ? customer.items.map((item) => `${item.name} × ${item.quantity}`).join(", ")
                        : "—"}
                    </td>
                    <td className="px-3 py-4 text-[#999]">
                      <p>{customer.phone}</p>
                      <p className="mt-1 max-w-44 truncate">{customer.address}</p>
                    </td>
                    <td className="px-3 py-4 font-semibold text-[#ff9a4d]">
                      ₱{customer.total.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 py-4">
                      <StatusBadge status={customer.paymentStatus} />
                    </td>
                    <td className="px-3 py-4">
                      <form action={updateDeliveryStatus} className="flex items-center gap-2">
                        <input name="orderId" type="hidden" value={customer.id} />
                        <select
                          className="rounded-lg border border-[#363636] bg-[#191919] px-2 py-2 text-[10px] text-[#f7f7f2]"
                          defaultValue={customer.deliveryStatus}
                          name="deliveryStatus"
                        >
                          <option value="received">Order received</option>
                          <option value="preparing">Preparing order</option>
                          <option value="pickup">Courier pickup</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button className="rounded-lg bg-[#f97316] px-2.5 py-2 text-[10px] font-semibold text-white hover:bg-[#ea580c]" type="submit">
                          Update
                        </button>
                      </form>
                    </td>
                    <td className="px-3 py-4 text-[#999]">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </section>
  );
}
