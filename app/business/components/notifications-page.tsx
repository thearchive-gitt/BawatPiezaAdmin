import type { DashboardData } from "@/lib/dashboard-data";
import { Panel, PanelHeading } from "./dashboard-primitives";

export function NotificationsPage({
  notifications,
}: {
  notifications: DashboardData["notifications"];
}) {
  const unread = notifications.filter((notification) => !notification.read_at).length;

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-medium text-[#718078]">Business communication</p>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.04em] text-[#f7f7f2] sm:text-3xl">
          Notifications
        </h1>
        <p className="mt-2 text-sm text-[#888]">Review current and previous ecommerce activity, customer concerns, and delivery updates.</p>
      </div>
      <Panel>
        <PanelHeading title="All notifications" description={`${notifications.length} notifications available`} action={unread ? `${unread} unread` : "All caught up"} />
        {notifications.length === 0 ? (
          <p className="py-8 text-sm text-[#888]">No notifications yet.</p>
        ) : (
          <div className="divide-y divide-[#242424]">
            {notifications.map((notification) => (
              <div
                className={`block w-full px-2 py-5 text-left transition hover:bg-[#171717] ${notification.read_at ? "" : "rounded-xl bg-[#21160e]"}`}
                key={notification.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.read_at ? "bg-[#444]" : "bg-[#f97316]"}`} />
                    <div>
                      <p className="text-sm font-semibold text-[#f7f7f2]">{notification.title}</p>
                      <p className="mt-1 text-sm leading-6 text-[#a6a39b]">{notification.message}</p>
                    </div>
                  </div>
                  <time className="text-xs text-[#777]" dateTime={notification.created_at}>{new Date(notification.created_at).toLocaleString("en-PH")}</time>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </section>
  );
}
