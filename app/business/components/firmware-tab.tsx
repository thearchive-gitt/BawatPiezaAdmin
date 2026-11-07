import type { DashboardData } from "@/lib/dashboard-data";
import { Panel, PanelHeading } from "./dashboard-primitives";

export function FirmwareTab({
  firmware,
}: {
  firmware: DashboardData["firmware"];
}) {
  return (
    <Panel className="mt-5" id="firmware">
      <PanelHeading
        title="Firmware management"
        description="Currently recorded firmware versions and last device connection"
      />
      <div className="mb-6 rounded-xl border border-[#292929] bg-[#181818] p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-[#f0efe9]">
              Over-the-air update
            </h3>
            <p className="mt-1 text-xs leading-5 text-[#999]">
              Provide a link to the firmware file for all paired devices.
            </p>
          </div>
          <span className="rounded-full bg-[#2a1609] px-3 py-1.5 text-[11px] font-medium text-[#ff9a4d]">
            Target: all paired devices
          </span>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="min-w-0 flex-1">
            <label
              className="mb-1.5 block text-xs font-medium text-[#c8c6bd]"
              htmlFor="firmware-url"
            >
              Firmware file link
            </label>
            <input
              autoComplete="url"
              className="w-full rounded-lg border border-[#363636] bg-[#181818] px-3 py-2.5 text-sm text-[#f0efe9] outline-none placeholder:text-[#666] focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20"
              id="firmware-url"
              name="firmware-url"
              placeholder="https://example.com/firmware.bin"
              type="url"
            />
          </div>
          <button
            className="self-end rounded-lg bg-[#292929] px-4 py-2.5 text-sm font-semibold text-[#777]"
            disabled
            type="button"
          >
            Flash firmware
          </button>
        </div>
        <p className="mt-3 text-xs leading-5 text-[#999]">
          OTA flashing is not connected yet. The flash control will be enabled
          when the device update service is configured.
        </p>
      </div>
      {firmware.length === 0 ? (
        <p className="rounded-xl border border-[#292929] bg-[#181818] px-4 py-7 text-center text-sm text-[#999]">
          No firmware records are available.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {firmware.map((device) => (
            <article
              className="rounded-xl border border-[#292929] bg-[#151515] p-4"
              key={device.hub_id}
            >
              <p className="text-xs font-semibold text-[#f0efe9]">
                {device.hub_id}
              </p>
              <p className="mt-2 text-lg font-semibold text-[#ff9a4d]">
                {device.fw_version || "Version not recorded"}
              </p>
              <p className="mt-1 text-[10px] text-[#888]">
                Last connected:{" "}
                {device.last_connected
                  ? new Date(device.last_connected).toLocaleString()
                  : "Not recorded"}
              </p>
            </article>
          ))}
        </div>
      )}
    </Panel>
  );
}
