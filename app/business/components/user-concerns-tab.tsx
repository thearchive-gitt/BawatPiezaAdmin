import type { DashboardData } from "@/lib/dashboard-data";
import { Panel, PanelHeading, StatusBadge } from "./dashboard-primitives";

export function UserConcernsTab({
  concerns,
}: {
  concerns: DashboardData["concerns"];
}) {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-medium text-[#718078]">Customer support</p>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.04em] text-[#f7f7f2] sm:text-3xl">
          User concerns
        </h1>
        <p className="mt-2 text-sm text-[#888]">
          Read questions and concerns submitted through the ecommerce contact form.
        </p>
      </div>

      <Panel>
        <PanelHeading
          title="Submitted concerns"
          description={`${concerns.length.toLocaleString()} concern${concerns.length === 1 ? "" : "s"} recorded`}
          action="Staff view"
        />
        {concerns.length === 0 ? (
          <p className="text-sm text-[#888]">No user concerns yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead>
                <tr className="border-b border-[#292929] text-[10px] uppercase tracking-[0.12em] text-[#777]">
                  <th className="px-3 py-3 font-medium">User</th>
                  <th className="px-3 py-3 font-medium">Concern</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Received</th>
                </tr>
              </thead>
              <tbody>
                {concerns.map((concern) => (
                  <tr className="border-b border-[#242424] last:border-0" key={concern.id}>
                    <td className="px-3 py-4 align-top">
                      <p className="font-medium text-[#f0efe9]">{concern.name}</p>
                      <p className="mt-1 text-[#888]">{concern.email}</p>
                    </td>
                    <td className="max-w-[520px] whitespace-pre-wrap px-3 py-4 align-top leading-5 text-[#c8c6bd]">
                      {concern.message}
                    </td>
                    <td className="px-3 py-4 align-top">
                      <StatusBadge status={concern.status.replace("_", " ")} />
                    </td>
                    <td className="px-3 py-4 align-top text-[#999]">
                      {new Date(concern.created_at).toLocaleString()}
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
