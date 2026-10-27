import type { DashboardData } from "@/lib/dashboard-data";
import { Panel, PanelHeading } from "./dashboard-primitives";

function HealthFeed({ data }: { data: DashboardData["health"] }) {
  if (data.length === 0) {
    return (
      <p className="rounded-xl bg-[#f6f8f5] px-4 py-7 text-center text-sm text-[#718078]">
        No system health logs have been recorded.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <article className="flex gap-3" key={item.log_id}>
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#d2a34d]" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium capitalize text-[#34463a]">
                {item.log_level} · {item.hub_id}
              </p>
              <time className="text-[10px] text-[#929c95]">
                {new Date(item.log_timestamp).toLocaleString()}
              </time>
            </div>
            <p className="mt-1 text-xs leading-5 text-[#7b887f]">
              {item.description}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}

export function MaintenanceTab({
  data,
  maintenanceCount,
  staffView = false,
}: {
  data: DashboardData["health"];
  maintenanceCount?: number | null;
  staffView?: boolean;
}) {
  return (
    <Panel id="maintenance">
      <PanelHeading
        title={staffView ? "Maintenance activity" : "System health & alerts"}
        description={
          staffView
            ? "Recent health logs for your authorized devices"
            : "Recent operational health logs"
        }
        action={
          staffView
            ? undefined
            : `${maintenanceCount === null || maintenanceCount === undefined ? "—" : maintenanceCount.toLocaleString()} hubs in maintenance`
        }
      />
      <HealthFeed data={data} />
      <p className="mt-5 rounded-xl border border-dashed border-[#dfe5dc] bg-[#fafbf9] p-3 text-xs leading-5 text-[#7d8981]">
        Maintenance request assignment and progress tracking are not available
        because the supplied database schema does not include a maintenance
        requests table.
      </p>
    </Panel>
  );
}
