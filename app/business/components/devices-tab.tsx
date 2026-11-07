import type { DashboardData } from "@/lib/dashboard-data";
import { Panel, PanelHeading, StatusBadge } from "./dashboard-primitives";

function DeviceTable({
  hubs,
  firmware,
}: {
  hubs: DashboardData["hubs"];
  firmware: DashboardData["firmware"];
}) {
  const firmwareByHub = new Map(
    firmware.map((item) => [item.hub_id, item.fw_version]),
  );

  if (hubs.length === 0) {
    return (
      <p className="rounded-xl border border-[#292929] bg-[#181818] px-4 py-7 text-center text-sm text-[#999]">
        No device records are available for this account.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead>
          <tr className="border-b border-[#292929] text-[11px] uppercase tracking-[0.12em] text-[#777]">
            <th className="pb-3 font-medium">Device</th>
            <th className="pb-3 font-medium">Device ID</th>
            <th className="pb-3 font-medium">Owner email</th>
            <th className="pb-3 font-medium">Tiles</th>
            <th className="pb-3 font-medium">Firmware</th>
            <th className="pb-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {hubs.map((hub) => (
            <tr
              className="border-b border-[#242424] last:border-0"
              key={hub.pairing_key}
            >
              <td className="py-3.5 font-medium text-[#f0efe9]">
                {hub.name || "Paired device"}
              </td>
              <td className="py-3.5 font-mono text-xs text-[#999]">
                {hub.id}
              </td>
              <td className="py-3.5 text-[#b7b7b0]">
                {hub.owner_email || "Not available"}
              </td>
              <td className="py-3.5 text-[#b7b7b0]">
                {hub.installed_tiles ?? "—"}
              </td>
              <td className="py-3.5 text-[#b7b7b0]">
                {firmwareByHub.get(hub.id) || "Not recorded"}
              </td>
              <td className="py-3.5">
                <StatusBadge status={hub.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DevicesTab({
  hubs,
  firmware,
  total,
  staffView = false,
}: {
  hubs: DashboardData["hubs"];
  firmware: DashboardData["firmware"];
  total: number | null;
  staffView?: boolean;
}) {
  return (
    <Panel className="mt-5" id="devices">
      <PanelHeading
        title={staffView ? "My devices" : "Device management"}
        description={
          staffView
            ? "Devices assigned or shared with your account"
            : "Deployed hubs, installation tile counts, firmware, and current status"
        }
        action={`${total === null ? "—" : total.toLocaleString()} ${staffView ? "devices" : "total"}`}
      />
      <DeviceTable hubs={hubs} firmware={firmware} />
      {staffView ? (
        <p className="mt-4 text-xs leading-5 text-[#999]">
          Customer contact details are not shown here. They should be exposed
          only through authorized installation or maintenance assignments.
        </p>
      ) : null}
    </Panel>
  );
}
