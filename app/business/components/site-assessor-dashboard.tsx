"use client";

import { useActionState } from "react";
import { submitSiteEvaluation, type SiteAssessmentActionState } from "@/app/actions/site-assessments";
import type { SiteAssessment } from "@/lib/dashboard-data";
import { DashboardShell } from "./dashboard-shell";
import { DataIssues, NewBadge, Panel, PanelHeading, StatusBadge } from "./dashboard-primitives";
import type { DashboardProps } from "./types";

const initialState: SiteAssessmentActionState = null;
const inputClass = "mt-1.5 h-10 w-full rounded-lg border border-[#363636] bg-[#181818] px-3 text-sm text-[#f0efe9] outline-none focus:border-[#f97316] focus:ring-4 focus:ring-[#f97316]/20";
const textClass = "mt-1.5 min-h-20 w-full rounded-lg border border-[#363636] bg-[#181818] p-3 text-sm text-[#f0efe9] outline-none focus:border-[#f97316] focus:ring-4 focus:ring-[#f97316]/20";

function Field({
  label,
  name,
  required = false,
  type = "text",
  options,
  defaultValue,
  readOnly = false,
  min,
  step,
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  options?: string[];
  defaultValue?: string;
  readOnly?: boolean;
  min?: string;
  step?: string;
}) {
  return (
    <label className="text-xs text-[#c8c6bd]">
      {label}
      {options ? (
        <select className={inputClass} name={name} required={required} defaultValue={defaultValue ?? ""}>
          <option value="">Select</option>
          {options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : (
        <input className={inputClass} defaultValue={defaultValue} min={min ?? (type === "number" ? "0" : undefined)} name={name} readOnly={readOnly} required={required} step={step ?? (type === "number" ? "any" : undefined)} type={type} />
      )}
    </label>
  );
}

function SiteVisitForm({ assessment, assessorName }: { assessment: SiteAssessment; assessorName: string }) {
  const [state, action, pending] = useActionState(submitSiteEvaluation, initialState);
  const customer = assessment.customer_info;
  const installation = assessment.installation_info;
  return (
    <form action={action} className="mt-5 space-y-6 rounded-xl border border-[#303030] bg-[#111] p-4 sm:p-5">
      <input name="assessmentId" type="hidden" value={assessment.id} />
      <section>
        <h3 className="text-sm font-semibold text-[#ff9a4d]">Assessment record</h3>
        <p className="mt-2 text-xs leading-5 text-[#aaa]">Assigned assessor: {assessorName}</p>
        <p className="mt-2 text-xs leading-5 text-[#aaa]">{customer.organizationName} · {customer.contactPerson} · {customer.contactNumber} · {customer.email}</p>
        <p className="text-xs leading-5 text-[#aaa]">{customer.organizationAddress} · {installation.areaName}: {installation.exactLocation}</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Date of inspection (client's requested date)" name="inspectionDate" required type="date" defaultValue={assessment.preferred_assessment_date} readOnly />
          <Field label="Time of inspection" name="inspectionTime" required type="time" />
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-[#f7f7f2]">1. Physical and environmental assessment</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Usable pathway length (m)" name="usableLength" required type="number" />
          <Field label="Usable pathway width (m)" name="usableWidth" required type="number" />
          <Field label="Proposed installation area (m²)" name="area" type="number" />
          <Field label="Floor / surface material" name="floorMaterial" required />
          <Field label="Floor stability and condition" name="floorCondition" options={["Suitable", "Concern"]} required />
          <Field label="Slope / level changes" name="slope" options={["Acceptable", "Concern"]} required />
          <Field label="Rain / water exposure" name="rainExposure" options={["Low", "Moderate", "High"]} required />
          <Field label="Drainage / water accumulation" name="drainage" options={["Adequate", "Concern"]} required />
          <Field label="Sun / heat exposure" name="sunExposure" options={["Low", "Moderate", "High"]} required />
          <Field label="Nearby obstructions" name="obstructions" options={["None", "Present"]} required />
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-[#f7f7f2]">2. Existing lighting and energy demand</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Are lights installed?" name="lightsInstalled" options={["Yes", "No", "Planned", "Unknown"]} required />
          <Field label="LED fixtures to support" name="fixtures" type="number" />
          <Field label="Rated power per fixture (W)" name="powerPerFixture" type="number" />
          <label className="flex items-center gap-2 self-end pb-3 text-xs text-[#c8c6bd]"><input name="powerVerified" type="checkbox" />Power verified from label</label>
          <Field label="Total connected lighting load (W)" name="totalLoad" type="number" />
          <Field label="Operating hours per day" name="operatingHours" type="number" />
          <Field label="Operating schedule" name="operatingSchedule" />
          <Field label="Estimated daily demand (Wh/day)" name="dailyEnergyDemand" type="number" />
          <Field label="Calculation / assumptions" name="energyAssumptions" />
        </div>
        <label className="mt-3 block text-xs text-[#c8c6bd]">Lighting and energy-demand observations<textarea className={textClass} name="lightingObservations" /></label>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-[#f7f7f2]">3. Electrical and battery installation</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Grid supply" name="gridSupply" options={["Available", "Not available"]} required />
          <Field label="Cable routing" name="cableRouting" options={["Suitable", "Concern"]} required />
          <Field label="Battery / control equipment location" name="equipmentLocation" options={["Suitable", "Concern"]} required />
          <Field label="Protection from rain, flooding, impact" name="weatherProtection" options={["Adequate", "Concern"]} required />
          <Field label="Ventilation and heat dissipation" name="ventilation" options={["Adequate", "Concern"]} required />
          <Field label="Access for inspection and maintenance" name="maintenanceAccess" options={["Adequate", "Concern"]} required />
          <Field label="Grounding / earthing" name="grounding" options={["Verified", "Requires review"]} required />
        </div>
        <label className="mt-3 block text-xs text-[#c8c6bd]">Electrical / battery-area observations<textarea className={textClass} name="electricalObservations" /></label>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-[#f7f7f2]">4. Preliminary feasibility evaluation</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Number of tiles the customer plans to purchase" name="tilesToPurchase" required type="number" min="1" step="1" />
          <Field label="Physical space and floor condition" name="physicalSpace" options={["Suitable", "Conditional", "Unsuitable"]} required />
          <Field label="Pedestrian activity" name="pedestrianActivity" options={["Suitable", "Conditional", "Unsuitable"]} required />
          <Field label="Environmental exposure and drainage" name="exposureDrainage" options={["Suitable", "Conditional", "Unsuitable"]} required />
          <Field label="Lighting demand match" name="lightingDemand" options={["Suitable", "Conditional", "Unsuitable"]} required />
          <Field label="Electrical / battery equipment location" name="equipmentFeasibility" options={["Suitable", "Conditional", "Unsuitable"]} required />
          <Field label="Safety and accessibility" name="safetyAccessibility" options={["Suitable", "Conditional", "Unsuitable"]} required />
        </div>
        <label className="mt-3 block text-xs text-[#c8c6bd]">Reason / evidence<textarea className={textClass} name="feasibilityEvidence" required /></label>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-[#f7f7f2]">5. Assessor recommendation</h3>
        <div className="mt-3 grid gap-2 text-xs text-[#c8c6bd]">
          {[
            "Proceed to detailed system design and energy feasibility calculations",
            "Proceed only after listed conditions / corrective actions are completed",
            "Conduct additional measurements or a longer pedestrian traffic study",
            "Request additional information or documents from the customer",
            "Do not recommend installation at this location at this time",
          ].map((recommendation) => <label className="flex items-start gap-2" key={recommendation}><input className="mt-0.5" name="recommendations" type="checkbox" value={recommendation} />{recommendation}</label>)}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-[#f7f7f2]">6. Review and sign-off</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="BawatPieza Operations Representative / Site Assessor" name="operationsRepresentative" required defaultValue={assessorName} readOnly />
          <Field label="Sign-off date (client's requested inspection date)" name="signOffDate" required type="date" defaultValue={assessment.preferred_assessment_date} readOnly />
        </div>
        <p className="mt-3 text-xs text-[#aaa]">Site assessment is not final installation approval.</p>
      </section>

      {state?.error && <p className="text-xs text-red-400" role="alert">{state.error}</p>}
      {state?.success && <p className="text-xs text-green-400" role="status">{state.success}</p>}
      <button className="rounded-lg bg-[#214d38] px-5 py-3 text-xs font-semibold" disabled={pending} type="submit">{pending ? "Submitting evaluation..." : "Submit technical evaluation to admin"}</button>
    </form>
  );
}

export function SiteAssessorDashboard({
  activeTab,
  data,
  email,
  fullName,
  profile,
  notifications,
}: DashboardProps) {
  const assessorName = fullName.trim();
  const newAssessmentIds = data.notifications.flatMap((notification) =>
    !notification.read_at && notification.entity_type === "site_assessment" && notification.entity_id
      ? [notification.entity_id]
      : [],
  );
  return (
    <DashboardShell activeTab={activeTab} email={email} fullName={fullName} profile={profile} role="site_assessor" notifications={notifications}>
      <DataIssues issues={data.issues} />
      <Panel>
        <PanelHeading title="Assigned site assessments" description="Complete the technical evaluation during the visit. This report does not authorize installation." action={`${data.siteAssessments.length} assigned`} />
        {data.siteAssessments.length === 0 ? <p className="py-8 text-center text-sm text-[#999]">No site visits are assigned to your account.</p> : (
          <div className="space-y-5">
            {data.siteAssessments.map((assessment) => (
              <article className="rounded-2xl border border-[#303030] bg-[#171717] p-4 sm:p-5" key={assessment.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[#999]">
                      Assessment {assessment.id}
                      {newAssessmentIds.includes(assessment.id) && <NewBadge />}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold">{assessment.customer_info.organizationName}</h2>
                  </div>
                  <StatusBadge status={assessment.status.replace(/_/g, " ")} />
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  {assessment.site_photos.map((photo) => <a className="text-xs text-[#ff9a4d] underline" href={photo} key={photo} rel="noreferrer" target="_blank">View customer site photo</a>)}
                </div>
                {assessment.site_evaluation ? (
                  <p className="mt-4 text-sm text-green-400">Technical evaluation submitted to admin.</p>
                ) : <SiteVisitForm assessment={assessment} assessorName={assessorName} />}
              </article>
            ))}
          </div>
        )}
      </Panel>
    </DashboardShell>
  );
}
