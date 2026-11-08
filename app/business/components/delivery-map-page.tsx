import type { DashboardData } from "@/lib/dashboard-data";
import { Panel, PanelHeading } from "./dashboard-primitives";
import { BuyerMap } from "./buyer-map";

function hasLocation(order: DashboardData["sales"]["customers"][number]) {
  return (
    typeof order.latitude === "number" &&
    Number.isFinite(order.latitude) &&
    typeof order.longitude === "number" &&
    Number.isFinite(order.longitude)
  );
}

export function DeliveryMapPage({
  orders,
}: {
  orders: DashboardData["sales"]["customers"];
}) {
  const activeOrders = orders.filter(
    (order) =>
      order.deliveryStatus !== "delivered" &&
      order.deliveryStatus !== "cancelled",
  );
  const mappedOrders = activeOrders.filter(hasLocation);
  const unmappedOrders = activeOrders.length - mappedOrders.length;
  const buyerCount = new Set(activeOrders.map((order) => order.email)).size;

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-medium text-[#718078]">Ecommerce operations</p>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.04em] text-[#f7f7f2] sm:text-3xl">
          Delivery map
        </h1>
        <p className="mt-2 text-sm text-[#888]">
          Track active buyers, delivery locations, and distance from the Bawat Pieza branch.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Panel>
          <PanelHeading title="Active buyers" description="Unique buyers with active orders." action={String(buyerCount)} />
        </Panel>
        <Panel>
          <PanelHeading title="Mapped orders" description="Orders with verified coordinates." action={String(mappedOrders.length)} />
        </Panel>
        <Panel>
          <PanelHeading title="Needs location" description="Older orders without coordinates." action={String(unmappedOrders)} />
        </Panel>
      </div>

      <BuyerMap orders={orders} />

      {unmappedOrders > 0 && (
        <Panel>
          <PanelHeading
            title="Orders not shown on the map"
            description="These orders were created before location verification was required."
            action={`${unmappedOrders} order${unmappedOrders === 1 ? "" : "s"}`}
          />
          <div className="space-y-3">
            {activeOrders.filter((order) => !hasLocation(order)).map((order) => (
              <div className="border-b border-[#292929] pb-3 last:border-0 last:pb-0" key={order.id}>
                <p className="text-sm font-medium text-[#f7f7f2]">{order.name}</p>
                <p className="mt-1 text-xs text-[#888]">
                  {order.address}, {order.city} · Order {order.id}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </section>
  );
}
