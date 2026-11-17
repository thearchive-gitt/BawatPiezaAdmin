"use client";

import { useActionState } from "react";
import {
  updateProjectDeliveryProgress,
  type SiteAssessmentActionState,
} from "@/app/actions/site-assessments";
import type { ProjectDeliveryStatus, SiteProject } from "@/lib/dashboard-data";
import { Panel, PanelHeading } from "./dashboard-primitives";

const initialState: SiteAssessmentActionState = null;
const currency = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });
const timestampFormat = new Intl.DateTimeFormat("en-PH", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Manila",
});
const stages: Array<{ value: ProjectDeliveryStatus; label: string }> = [
  { value: "preparing", label: "Preparing" },
  { value: "fabrication", label: "Fabrication" },
  { value: "ready_for_delivery", label: "Ready for delivery" },
  { value: "in_transit", label: "In transit" },
  { value: "installation", label: "Installation" },
  { value: "completed", label: "Completed" },
];

function DeliveryProgressForm({ project }: { project: SiteProject }) {
  const [state, action, pending] = useActionState(updateProjectDeliveryProgress, initialState);

  return (
    <form action={action} className="mt-4 grid gap-3 rounded-xl border border-[#303030] bg-[#111] p-4 sm:grid-cols-2">
      <input name="assessmentId" type="hidden" value={project.id} />
      <label className="text-xs text-[#c8c6bd]">
        Delivery / deployment stage
        <select
          className="mt-1.5 h-10 w-full rounded-lg border border-[#363636] bg-[#181818] px-3 text-sm"
          defaultValue={project.delivery_status}
          name="deliveryStatus"
          required
        >
          <option value="not_started">Not started</option>
          {stages.map((stage) => <option key={stage.value} value={stage.value}>{stage.label}</option>)}
        </select>
      </label>
      <label className="text-xs text-[#c8c6bd]">
        Estimated delivery date
        <input
          className="mt-1.5 h-10 w-full rounded-lg border border-[#363636] bg-[#181818] px-3 text-sm"
          defaultValue={project.delivery_expected_at ?? ""}
          name="expectedAt"
          type="date"
        />
      </label>
      <label className="text-xs text-[#c8c6bd] sm:col-span-2">
        Customer update (optional)
        <textarea
          className="mt-1.5 min-h-20 w-full rounded-lg border border-[#363636] bg-[#181818] p-3 text-sm"
          defaultValue={project.delivery_notes ?? ""}
          maxLength={2000}
          name="deliveryNotes"
        />
      </label>
      {state?.error && <p className="text-xs text-red-400 sm:col-span-2" role="alert">{state.error}</p>}
      {state?.success && <p className="text-xs text-green-400 sm:col-span-2" role="status">{state.success}</p>}
      <button className="rounded-lg bg-[#214d38] px-4 py-2.5 text-xs font-semibold sm:col-span-2 sm:justify-self-start" disabled={pending} type="submit">
        {pending ? "Updating customer..." : "Update delivery progress"}
      </button>
    </form>
  );
}

function ProjectCard({ project }: { project: SiteProject }) {
  const quotation = project.quotation;
  const total = Number(quotation.total);
  const currentIndex = stages.findIndex((stage) => stage.value === project.delivery_status);

  return (
    <article className="rounded-2xl border border-[#303030] bg-[#171717] p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#999]">Assessment {project.id}</p>
          <h3 className="mt-1 text-base font-semibold">{project.customer_info.organizationName || "Project"}</h3>
          <p className="mt-1 text-xs text-[#999]">
            {project.customer_info.organizationAddress || project.installation_info.exactLocation || "Address not recorded"}
          </p>
        </div>
        <span className="rounded-full border border-[#3b3b3b] px-3 py-1 text-[10px] uppercase text-[#ddd]">
          {project.delivery_status.replace(/_/g, " ")}
        </span>
      </div>
      <div className="mt-4 grid gap-2 text-xs sm:grid-cols-3">
        <p><span className="text-[#888]">Quotation:</span> {String(quotation.quotationNo ?? project.id)}</p>
        <p><span className="text-[#888]">Project total:</span> {Number.isFinite(total) ? currency.format(total) : "—"}</p>
        <p><span className="text-[#888]">Balance payment:</span> {project.balance_payment_status.replace(/_/g, " ")}</p>
      </div>
      <ol aria-label="Delivery and installation progress" className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stages.map((stage, index) => {
          const complete = currentIndex >= index;
          const current = currentIndex === index;
          return (
            <li aria-current={current ? "step" : undefined} className="flex items-center gap-2 text-xs" key={stage.value}>
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                complete ? "border-[#ff9a4d] bg-[#2a1609] text-[#ff9a4d]" : "border-[#414141] text-[#888]"
              }`}>
                {complete ? "✓" : index + 1}
              </span>
              <span className={complete ? "font-semibold text-[#f2b27f]" : "text-[#999]"}>{stage.label}</span>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-xs text-[#aaa]">
        Estimated delivery: {project.delivery_expected_at || "Not set"}
        {project.delivery_updated_at ? ` · Last updated ${timestampFormat.format(new Date(project.delivery_updated_at))}` : ""}
      </p>
      {project.delivery_notes && <p className="mt-2 whitespace-pre-wrap text-xs text-[#c8c6bd]">{project.delivery_notes}</p>}
      <DeliveryProgressForm project={project} />
    </article>
  );
}

export function ProjectDeliveryTab({ projects }: { projects: SiteProject[] }) {
  return (
    <Panel>
      <PanelHeading
        title="Project delivery and installation"
        description="Update each accepted project’s delivery stage, estimated date, and customer-facing note. Customers see the timeline in their assessment account."
        action={`${projects.length} active projects`}
      />
      {projects.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#999]">No accepted projects are ready for delivery updates.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {projects.map((project) => <ProjectCard key={project.id} project={project} />)}
        </div>
      )}
    </Panel>
  );
}
