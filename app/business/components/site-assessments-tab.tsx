"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  issueProjectQuotation,
  reviewSiteAssessment,
  reviewSiteAssessmentBalancePayment,
  reviewSiteAssessmentDownpayment,
  type SiteAssessmentActionState,
} from "@/app/actions/site-assessments";
import type { DashboardData, SiteAssessment } from "@/lib/dashboard-data";
import { NewBadge, Panel, PanelHeading, StatusBadge } from "./dashboard-primitives";

const initialState: SiteAssessmentActionState = null;
const currency = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });
const timestampFormat = new Intl.DateTimeFormat("en-PH", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Manila",
});

type EvaluationRecord = Record<string, unknown>;

function asEvaluationRecord(value: unknown): EvaluationRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as EvaluationRecord
    : {};
}

function evaluationText(value: unknown, suffix = "") {
  if (typeof value === "string" && value.trim()) return `${value.trim()}${suffix}`;
  if (typeof value === "number" && Number.isFinite(value)) return `${value}${suffix}`;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return "Not recorded";
}

function EvaluationSection({
  title,
  fields,
}: {
  title: string;
  fields: Array<{ label: string; value: unknown; suffix?: string; wide?: boolean }>;
}) {
  return (
    <section className="mt-4 rounded-lg border border-[#303030] bg-[#151515] p-4">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-[#ff9a4d]">{title}</h4>
      <dl className="mt-3 grid gap-x-5 gap-y-3 text-xs sm:grid-cols-2 lg:grid-cols-3">
        {fields.map((field) => (
          <div className={field.wide ? "sm:col-span-2 lg:col-span-3" : ""} key={field.label}>
            <dt className="text-[#888]">{field.label}</dt>
            <dd className="mt-1 whitespace-pre-wrap text-[#e1e1dc]">{evaluationText(field.value, field.suffix)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function SiteEvaluationReport({
  assessment,
  evaluation,
}: {
  assessment: SiteAssessment;
  evaluation: EvaluationRecord;
}) {
  const customer = assessment.customer_info;
  const installation = assessment.installation_info;
  const physical = asEvaluationRecord(evaluation.physicalEnvironment);
  const lighting = asEvaluationRecord(evaluation.lighting);
  const electrical = asEvaluationRecord(evaluation.electrical);
  const feasibility = asEvaluationRecord(evaluation.feasibility);
  const signOff = asEvaluationRecord(evaluation.signOff);
  const recommendations = Array.isArray(evaluation.recommendations)
    ? evaluation.recommendations.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];

  return (
    <div className="mt-3">
      <EvaluationSection
        title="Assessment record"
        fields={[
          { label: "Assessment reference no.", value: assessment.id },
          { label: "Date of inspection", value: evaluation.inspectionDate },
          { label: "Time of inspection", value: evaluation.inspectionTime },
          { label: "Assessor", value: evaluation.assessorName },
          { label: "Organization", value: customer.organizationName },
          { label: "Contact person and position", value: `${customer.contactPerson || "Not recorded"}${customer.contactPosition ? ` · ${customer.contactPosition}` : ""}` },
          { label: "Contact number / email", value: `${customer.contactNumber || "Not recorded"} · ${customer.email || "Not recorded"}` },
          { label: "Site address", value: customer.organizationAddress, wide: true },
          { label: "Specific installation area", value: installation.areaName },
          { label: "Exact installation location", value: installation.exactLocation },
        ]}
      />
      <EvaluationSection
        title="1. Physical and environmental assessment"
        fields={[
          { label: "Usable pathway length", value: physical.usableLength, suffix: " m" },
          { label: "Usable pathway width", value: physical.usableWidth, suffix: " m" },
          { label: "Proposed installation area", value: physical.area, suffix: " m²" },
          { label: "Floor / surface material", value: physical.floorMaterial },
          { label: "Floor stability and condition", value: physical.floorCondition },
          { label: "Slope / level changes", value: physical.slope },
          { label: "Rain / water exposure", value: physical.rainExposure },
          { label: "Drainage / water accumulation", value: physical.drainage },
          { label: "Sun / heat exposure", value: physical.sunExposure },
          { label: "Nearby obstructions", value: physical.obstructions },
        ]}
      />
      <EvaluationSection
        title="2. Existing lighting and energy demand"
        fields={[
          { label: "Lights currently installed", value: lighting.installed },
          { label: "LED fixtures to support", value: lighting.fixtures, suffix: " fixtures" },
          { label: "Rated power per fixture", value: lighting.powerPerFixture, suffix: " W" },
          { label: "Power rating source", value: lighting.powerVerified === true ? "Verified from label" : lighting.powerVerified === false ? "Estimated" : null },
          { label: "Total connected lighting load", value: lighting.totalLoad, suffix: " W" },
          { label: "Typical operating hours", value: lighting.operatingHours, suffix: " hours/day" },
          { label: "Operating schedule", value: lighting.schedule },
          { label: "Estimated daily lighting demand", value: lighting.dailyEnergyDemand, suffix: " Wh/day" },
          { label: "Calculation / assumptions", value: lighting.assumptions, wide: true },
          { label: "Lighting and energy-demand observations", value: lighting.observations, wide: true },
        ]}
      />
      <EvaluationSection
        title="3. Electrical and battery installation"
        fields={[
          { label: "Grid supply", value: electrical.gridSupply },
          { label: "Cable routing feasibility", value: electrical.cableRouting },
          { label: "Battery / control equipment location", value: electrical.equipmentLocation },
          { label: "Rain, flood, and impact protection", value: electrical.weatherProtection },
          { label: "Ventilation and heat dissipation", value: electrical.ventilation },
          { label: "Inspection and maintenance access", value: electrical.maintenanceAccess },
          { label: "Grounding / earthing provision", value: electrical.grounding },
          { label: "Electrical / battery-area observations", value: electrical.observations, wide: true },
        ]}
      />
      <EvaluationSection
        title="4. Preliminary feasibility evaluation"
        fields={[
          { label: "Tiles the customer plans to purchase", value: evaluation.tilesToPurchase, suffix: " tiles" },
          { label: "Physical space and floor condition", value: feasibility.physicalSpace },
          { label: "Pedestrian activity", value: feasibility.pedestrianActivity },
          { label: "Environmental exposure and drainage", value: feasibility.exposureDrainage },
          { label: "Lighting demand match", value: feasibility.lightingDemand },
          { label: "Electrical / battery equipment location", value: feasibility.equipmentLocation },
          { label: "Safety and accessibility", value: feasibility.safetyAccessibility },
          { label: "Reason / evidence", value: feasibility.evidence, wide: true },
        ]}
      />
      <section className="mt-4 rounded-lg border border-[#303030] bg-[#151515] p-4">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-[#ff9a4d]">5. Assessor recommendation</h4>
        {recommendations.length ? (
          <ul className="mt-3 list-inside list-disc space-y-1 text-xs text-[#e1e1dc]">
            {recommendations.map((recommendation) => <li key={recommendation}>{recommendation}</li>)}
          </ul>
        ) : (
          <p className="mt-3 text-xs text-[#e1e1dc]">Not recorded</p>
        )}
      </section>
      <EvaluationSection
        title="6. Review and sign-off"
        fields={[
          { label: "BawatPieza Operations Representative / Site Assessor", value: signOff.operationsRepresentative },
          { label: "Sign-off date", value: signOff.date },
        ]}
      />
      <p className="mt-3 text-xs text-[#999]">Site assessment is not final installation approval.</p>
    </div>
  );
}

function ReviewForm({
  assessment,
  assessors,
}: {
  assessment: SiteAssessment;
  assessors: DashboardData["businessAccounts"];
}) {
  const [state, action, pending] = useActionState(reviewSiteAssessment, initialState);
  return (
    <form action={action} className="mt-5 grid gap-3 rounded-xl border border-[#303030] bg-[#111] p-4 sm:grid-cols-2">
      <input name="assessmentId" type="hidden" value={assessment.id} />
      <label className="text-xs text-[#c8c6bd]">
        Review decision
        <select className="mt-1.5 h-10 w-full rounded-lg border border-[#363636] bg-[#181818] px-3 text-sm" defaultValue={assessment.status === "declined" ? "declined" : assessment.status === "accepted" ? "accepted" : "pending"} name="status">
          <option value="pending">Pending</option>
          <option value="accepted">Accept and schedule site visit</option>
          <option value="declined">Decline</option>
        </select>
      </label>
      <label className="text-xs text-[#c8c6bd]">
        Assign site assessor (required to accept)
        <select className="mt-1.5 h-10 w-full rounded-lg border border-[#363636] bg-[#181818] px-3 text-sm" defaultValue={assessment.assigned_assessor_id ?? ""} name="assessorId">
          <option value="">Select an assessor</option>
          {assessors.filter((person) => person.role === "site_assessor" && person.is_active && person.status === "active").map((person) => (
            <option key={person.id} value={person.id}>{person.firstname} {person.lastname} · {person.email}</option>
          ))}
        </select>
      </label>
      <label className="text-xs text-[#c8c6bd] sm:col-span-2">
        Admin notes (optional)
        <textarea className="mt-1.5 min-h-20 w-full rounded-lg border border-[#363636] bg-[#181818] p-3 text-sm" defaultValue={assessment.admin_notes ?? ""} maxLength={2000} name="adminNotes" />
      </label>
      {state?.error && <p className="text-xs text-red-400 sm:col-span-2" role="alert">{state.error}</p>}
      {state?.success && <p className="text-xs text-green-400 sm:col-span-2" role="status">{state.success}</p>}
      <button className="rounded-lg bg-[#214d38] px-4 py-2.5 text-xs font-semibold sm:col-span-2 sm:justify-self-start" disabled={pending} type="submit">
        {pending ? "Saving review..." : "Save review and notify"}
      </button>
    </form>
  );
}

function QuotationForm({
  assessment,
  businessAccounts,
  approvedByFallback,
}: {
  assessment: SiteAssessment;
  businessAccounts: DashboardData["businessAccounts"];
  approvedByFallback: string;
}) {
  const [state, action, pending] = useActionState(issueProjectQuotation, initialState);
  const quote = assessment.quotation;
  const specs = quote?.technicalSpecs as Record<string, string> | undefined;
  const timeline = quote?.timeline as Record<string, string> | undefined;
  const lineItems = quote?.lineItems as Array<{ description: string; amount: number }> | undefined;
  const siteEvaluation = assessment.site_evaluation;
  const reportedTiles = siteEvaluation?.tilesToPurchase;
  const tileCount = typeof reportedTiles === "number" && Number.isInteger(reportedTiles) && reportedTiles > 0
    ? String(reportedTiles)
    : typeof reportedTiles === "string" && /^\d+$/.test(reportedTiles.trim())
      ? reportedTiles.trim()
      : assessment.installation_info.estimatedTiles || specs?.tiles || "";
  const assigningAdmin = businessAccounts.find((person) => person.id === assessment.assessor_assigned_by);
  const approvedBy = assigningAdmin
    ? [assigningAdmin.firstname, assigningAdmin.middlename, assigningAdmin.lastname].filter(Boolean).join(" ")
    : approvedByFallback;
  const amount = (description: string) => lineItems?.find((item) => item.description === description)?.amount ?? "";
  const date = new Date();
  const issued = date.toISOString().slice(0, 10);
  const validUntil = new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  return (
    <form action={action} className="mt-5 rounded-xl border border-[#303030] bg-[#111] p-4">
      <input name="assessmentId" type="hidden" value={assessment.id} />
      <h3 className="text-sm font-semibold text-[#f7f7f2]">Prepare project proposal &amp; quotation</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="text-xs text-[#c8c6bd]">Quotation number<input className="mt-1.5 h-10 w-full rounded-lg border border-[#363636] bg-[#181818] px-3 text-sm" defaultValue={typeof quote?.quotationNo === "string" ? quote.quotationNo : `BP-${date.getFullYear()}-${assessment.id.slice(0, 8).toUpperCase()}`} name="quotationNo" required /></label>
        <label className="text-xs text-[#c8c6bd]">Date issued<input className="mt-1.5 h-10 w-full rounded-lg border border-[#363636] bg-[#181818] px-3 text-sm" defaultValue={typeof quote?.dateIssued === "string" ? quote.dateIssued : issued} name="dateIssued" required type="date" /></label>
        <label className="text-xs text-[#c8c6bd]">Valid until<input className="mt-1.5 h-10 w-full rounded-lg border border-[#363636] bg-[#181818] px-3 text-sm" defaultValue={typeof quote?.validUntil === "string" ? quote.validUntil : validUntil} name="validUntil" required type="date" /></label>
        <label className="text-xs text-[#c8c6bd]">Approved by (admin who assigned the assessor)<input className="mt-1.5 h-10 w-full rounded-lg border border-[#363636] bg-[#181818] px-3 text-sm" defaultValue={approvedBy} name="approvedBy" readOnly required /></label>
        <label className="text-xs text-[#c8c6bd]">Tiles<input className="mt-1.5 h-10 w-full rounded-lg border border-[#363636] bg-[#181818] px-3 text-sm" defaultValue={tileCount} name="tiles" required /></label>
        <label className="text-xs text-[#c8c6bd]">Sandbox / tile housing<input className="mt-1.5 h-10 w-full rounded-lg border border-[#363636] bg-[#181818] px-3 text-sm" defaultValue={specs?.housing ?? ""} name="housing" required /></label>
        <label className="text-xs text-[#c8c6bd]">Battery capacity<input className="mt-1.5 h-10 w-full rounded-lg border border-[#363636] bg-[#181818] px-3 text-sm" defaultValue={specs?.batteryCapacity ?? ""} name="batteryCapacity" required /></label>
        <label className="text-xs text-[#c8c6bd]">Battery capacity percentage<input className="mt-1.5 h-10 w-full rounded-lg border border-[#363636] bg-[#181818] px-3 text-sm" defaultValue={specs?.batteryPercentage ?? ""} name="batteryPercentage" required /></label>
        <label className="text-xs text-[#c8c6bd]">Battery / power management<input className="mt-1.5 h-10 w-full rounded-lg border border-[#363636] bg-[#181818] px-3 text-sm" defaultValue={specs?.batteryManagement ?? ""} name="batteryManagement" required /></label>
      </div>
      <h4 className="mt-5 text-xs font-semibold uppercase tracking-wide text-[#ff9a4d]">Itemized quotation (PHP)</h4>
      <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["Tiles", "tilesAmount"],
          ["Sandbox / tile housing fabrication", "housingAmount"],
          ["Battery and storage components", "batteryAmount"],
          ["Electrical and power conditioning components", "electricalAmount"],
          ["Labor and fabrication", "laborAmount"],
          ["Installation", "installationAmount"],
        ].map(([label, name]) => (
          <label className="text-xs text-[#c8c6bd]" key={name}>{label}<input className="mt-1.5 h-10 w-full rounded-lg border border-[#363636] bg-[#181818] px-3 text-sm" defaultValue={amount(label)} min="0" name={name} required step="0.01" type="number" /></label>
        ))}
      </div>
      <h4 className="mt-5 text-xs font-semibold uppercase tracking-wide text-[#ff9a4d]">Project timeline</h4>
      <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Fabrication", "fabricationDuration"],
          ["Installation", "installationDuration"],
          ["Testing", "testingDuration"],
          ["Total duration", "totalDuration"],
        ].map(([label, name]) => (
          <label className="text-xs text-[#c8c6bd]" key={name}>{label}<input className="mt-1.5 h-10 w-full rounded-lg border border-[#363636] bg-[#181818] px-3 text-sm" defaultValue={timeline?.[name.replace("Duration", "").toLowerCase()] ?? timeline?.total ?? ""} name={name} required /></label>
        ))}
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <label className="text-xs text-[#c8c6bd]">Warranty coverage<textarea className="mt-1.5 min-h-20 w-full rounded-lg border border-[#363636] bg-[#181818] p-3 text-sm" defaultValue={typeof quote?.warrantyCoverage === "string" ? quote.warrantyCoverage : ""} name="warrantyCoverage" required /></label>
        <label className="text-xs text-[#c8c6bd]">Maintenance schedule<textarea className="mt-1.5 min-h-20 w-full rounded-lg border border-[#363636] bg-[#181818] p-3 text-sm" defaultValue={typeof quote?.maintenanceSchedule === "string" ? quote.maintenanceSchedule : ""} name="maintenanceSchedule" required /></label>
        <label className="text-xs text-[#c8c6bd]">Payment terms<textarea className="mt-1.5 min-h-20 w-full rounded-lg border border-[#363636] bg-[#181818] p-3 text-sm" defaultValue={typeof quote?.paymentTerms === "string" ? quote.paymentTerms : ""} name="paymentTerms" required /></label>
      </div>
      {state?.error && <p className="mt-3 text-xs text-red-400" role="alert">{state.error}</p>}
      {state?.success && <p className="mt-3 text-xs text-green-400" role="status">{state.success}</p>}
      <button className="mt-4 rounded-lg bg-[#214d38] px-4 py-2.5 text-xs font-semibold" disabled={pending} type="submit">{pending ? "Sending quotation..." : "Send quotation to client"}</button>
    </form>
  );
}

function DownpaymentReviewForm({ assessment }: { assessment: SiteAssessment }) {
  const [state, action, pending] = useActionState(reviewSiteAssessmentDownpayment, initialState);
  return (
    <form action={action} className="mt-4 grid gap-3 rounded-xl border border-[#303030] bg-[#111] p-4 sm:grid-cols-2">
      <input name="assessmentId" type="hidden" value={assessment.id} />
      <label className="text-xs text-[#c8c6bd] sm:col-span-2">
        Review note (required when rejecting)
        <textarea className="mt-1.5 min-h-20 w-full rounded-lg border border-[#363636] bg-[#181818] p-3 text-sm" maxLength={2000} name="reviewNotes" />
      </label>
      {state?.error && <p className="text-xs text-red-400 sm:col-span-2" role="alert">{state.error}</p>}
      {state?.success && <p className="text-xs text-green-400 sm:col-span-2" role="status">{state.success}</p>}
      <button className="rounded-lg bg-[#214d38] px-4 py-2.5 text-xs font-semibold" disabled={pending} name="decision" type="submit" value="verified">
        {pending ? "Saving..." : "Verify payment and accept quotation"}
      </button>
      <button className="rounded-lg border border-red-800 px-4 py-2.5 text-xs font-semibold text-red-300" disabled={pending} name="decision" type="submit" value="rejected">
        Reject proof
      </button>
    </form>
  );
}

function BalancePaymentReviewForm({ assessment }: { assessment: SiteAssessment }) {
  const [state, action, pending] = useActionState(reviewSiteAssessmentBalancePayment, initialState);
  return (
    <form action={action} className="mt-4 grid gap-3 rounded-xl border border-[#303030] bg-[#111] p-4 sm:grid-cols-2">
      <input name="assessmentId" type="hidden" value={assessment.id} />
      <label className="text-xs text-[#c8c6bd] sm:col-span-2">
        Review note (required when rejecting)
        <textarea className="mt-1.5 min-h-20 w-full rounded-lg border border-[#363636] bg-[#181818] p-3 text-sm" maxLength={2000} name="reviewNotes" />
      </label>
      {state?.error && <p className="text-xs text-red-400 sm:col-span-2" role="alert">{state.error}</p>}
      {state?.success && <p className="text-xs text-green-400 sm:col-span-2" role="status">{state.success}</p>}
      <button className="rounded-lg bg-[#214d38] px-4 py-2.5 text-xs font-semibold" disabled={pending} name="decision" type="submit" value="verified">
        {pending ? "Saving..." : "Verify balance payment"}
      </button>
      <button className="rounded-lg border border-red-800 px-4 py-2.5 text-xs font-semibold text-red-300" disabled={pending} name="decision" type="submit" value="rejected">
        Reject proof
      </button>
    </form>
  );
}

function AssessmentDetailsDialog({
  assessment,
  businessAccounts,
  onClose,
  approvedByFallback,
}: {
  assessment: SiteAssessment;
  businessAccounts: DashboardData["businessAccounts"];
  onClose: () => void;
  approvedByFallback: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const customer = assessment.customer_info;
  const installation = assessment.installation_info;
  const productInterests = Array.isArray(assessment.interested_products) ? assessment.interested_products : [];
  const evaluation = assessment.site_evaluation;

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      aria-labelledby={`assessment-details-title-${assessment.id}`}
      className="fixed inset-0 z-50 m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-5xl overflow-y-auto rounded-2xl border border-[#303030] bg-[#111] p-0 text-[#f7f7f2] shadow-2xl backdrop:bg-black/70"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      ref={dialogRef}
    >
      <div className="p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#999]">Request {assessment.id}</p>
            <h2 className="mt-1 text-xl font-semibold" id={`assessment-details-title-${assessment.id}`}>{customer.organizationName}</h2>
            <div className="mt-2"><StatusBadge status={assessment.status.replace(/_/g, " ")} /></div>
          </div>
          <button
            aria-label="Close assessment details"
            autoFocus
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg text-[#888] transition hover:bg-[#242424]"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        <dl className="mt-5 grid gap-x-6 gap-y-3 text-xs sm:grid-cols-2 lg:grid-cols-3">
          <div><dt className="text-[#888]">Organization</dt><dd className="mt-1 text-[#e1e1dc]">{customer.organizationName}</dd></div>
          <div><dt className="text-[#888]">Contact person and position</dt><dd className="mt-1 text-[#e1e1dc]">{customer.contactPerson}{customer.contactPosition ? ` · ${customer.contactPosition}` : ""}</dd></div>
          <div><dt className="text-[#888]">Email and contact number</dt><dd className="mt-1 text-[#e1e1dc]">{customer.email} · {customer.contactNumber}</dd></div>
          <div><dt className="text-[#888]">Organization address</dt><dd className="mt-1 text-[#e1e1dc]">{customer.organizationAddress}</dd></div>
          <div><dt className="text-[#888]">Installation area</dt><dd className="mt-1 text-[#e1e1dc]">{installation.areaName}</dd></div>
          <div><dt className="text-[#888]">Exact installation location</dt><dd className="mt-1 text-[#e1e1dc]">{installation.exactLocation}</dd></div>
          <div className="sm:col-span-2"><dt className="text-[#888]">Intended purpose</dt><dd className="mt-1 whitespace-pre-wrap text-[#e1e1dc]">{installation.purpose}</dd></div>
          <div><dt className="text-[#888]">Estimated pathway length</dt><dd className="mt-1 text-[#e1e1dc]">{installation.estimatedLength ? `${installation.estimatedLength} m` : "Not provided"}</dd></div>
          <div><dt className="text-[#888]">Estimated pathway width</dt><dd className="mt-1 text-[#e1e1dc]">{installation.estimatedWidth ? `${installation.estimatedWidth} m` : "Not provided"}</dd></div>
          <div><dt className="text-[#888]">Estimated number of tiles</dt><dd className="mt-1 text-[#e1e1dc]">{installation.estimatedTiles || "Not provided"}</dd></div>
          <div><dt className="text-[#888]">Current floor material</dt><dd className="mt-1 text-[#e1e1dc]">{installation.floorMaterial || "Not provided"}</dd></div>
          <div><dt className="text-[#888]">Preferred assessment date</dt><dd className="mt-1 text-[#e1e1dc]">{assessment.preferred_assessment_date}</dd></div>
          <div><dt className="text-[#888]">Existing LED lighting</dt><dd className="mt-1 text-[#e1e1dc]">{assessment.existing_led_lighting}</dd></div>
        </dl>

        {productInterests.length > 0 && (
          <div className="mt-4 text-xs text-[#c8c6bd]">
            <strong>Product interests for planning</strong>
            <ul className="mt-1 list-inside list-disc">
              {productInterests.map((product) => (
                <li key={product.id}>{product.name} · reference quantity {product.quantity}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {assessment.site_photos.map((photo, index) => <a className="text-xs text-[#ff9a4d] underline" href={photo} key={photo} rel="noreferrer" target="_blank">View site photo {index + 1}</a>)}
        </div>
        {assessment.additional_remarks && <p className="mt-3 whitespace-pre-wrap text-xs text-[#c8c6bd]"><strong>Customer remarks:</strong> {assessment.additional_remarks}</p>}
        {assessment.admin_notes && <p className="mt-2 whitespace-pre-wrap text-xs text-[#c8c6bd]"><strong>Admin notes:</strong> {assessment.admin_notes}</p>}
        {assessment.status === "pending" || assessment.status === "accepted" || assessment.status === "declined" ? (
          <ReviewForm assessment={assessment} assessors={businessAccounts} />
        ) : null}
        {evaluation && (
          <details className="mt-5 rounded-xl border border-[#303030] bg-[#111] p-4">
            <summary className="cursor-pointer text-sm font-semibold">Site assessment and technical evaluation</summary>
            <SiteEvaluationReport assessment={assessment} evaluation={evaluation} />
          </details>
        )}
        {assessment.status === "site_assessed" ? (
          <QuotationForm assessment={assessment} businessAccounts={businessAccounts} approvedByFallback={approvedByFallback} />
        ) : null}
        {assessment.downpayment_status && assessment.downpayment_status !== "unpaid" && (
          <section className="mt-5 rounded-xl border border-[#303030] bg-[#151515] p-4">
            <h3 className="text-sm font-semibold">Quotation downpayment · {assessment.downpayment_status}</h3>
            <dl className="mt-3 grid gap-3 text-xs sm:grid-cols-2">
              <div><dt className="text-[#888]">Amount</dt><dd className="mt-1 text-[#e1e1dc]">{assessment.downpayment_amount === null ? "—" : currency.format(Number(assessment.downpayment_amount))}</dd></div>
              <div><dt className="text-[#888]">Payment reference</dt><dd className="mt-1 text-[#e1e1dc]">{assessment.downpayment_reference || "Not provided"}</dd></div>
              <div><dt className="text-[#888]">Submitted</dt><dd className="mt-1 text-[#e1e1dc]">{assessment.downpayment_submitted_at ? new Date(assessment.downpayment_submitted_at).toLocaleString() : "—"}</dd></div>
              <div><dt className="text-[#888]">Customer representative</dt><dd className="mt-1 text-[#e1e1dc]">{assessment.downpayment_customer_name || "—"}</dd></div>
              {assessment.downpayment_proof_url && (
                <div><dt className="text-[#888]">Proof of payment</dt><dd className="mt-1"><a className="text-[#ff9a4d] underline" href={assessment.downpayment_proof_url} rel="noreferrer" target="_blank">View proof image</a></dd></div>
              )}
              {assessment.downpayment_review_notes && <div className="sm:col-span-2"><dt className="text-[#888]">Review note</dt><dd className="mt-1 whitespace-pre-wrap text-[#e1e1dc]">{assessment.downpayment_review_notes}</dd></div>}
            </dl>
            {assessment.downpayment_status === "pending" && <DownpaymentReviewForm assessment={assessment} />}
          </section>
        )}
        {assessment.balance_payment_status && assessment.balance_payment_status !== "unpaid" && (
          <section className="mt-5 rounded-xl border border-[#303030] bg-[#151515] p-4">
            <h3 className="text-sm font-semibold">Remaining balance payment · {assessment.balance_payment_status}</h3>
            <dl className="mt-3 grid gap-3 text-xs sm:grid-cols-2">
              <div><dt className="text-[#888]">Amount</dt><dd className="mt-1 text-[#e1e1dc]">{assessment.balance_payment_amount === null ? "—" : currency.format(Number(assessment.balance_payment_amount))}</dd></div>
              <div><dt className="text-[#888]">Payment reference</dt><dd className="mt-1 text-[#e1e1dc]">{assessment.balance_payment_reference || "Not provided"}</dd></div>
              <div><dt className="text-[#888]">Submitted</dt><dd className="mt-1 text-[#e1e1dc]">{assessment.balance_payment_submitted_at ? timestampFormat.format(new Date(assessment.balance_payment_submitted_at)) : "—"}</dd></div>
              {assessment.balance_payment_proof_url && (
                <div><dt className="text-[#888]">Proof of payment</dt><dd className="mt-1"><a className="text-[#ff9a4d] underline" href={assessment.balance_payment_proof_url} rel="noreferrer" target="_blank">View proof image</a></dd></div>
              )}
              {assessment.balance_payment_review_notes && <div className="sm:col-span-2"><dt className="text-[#888]">Review note</dt><dd className="mt-1 whitespace-pre-wrap text-[#e1e1dc]">{assessment.balance_payment_review_notes}</dd></div>}
            </dl>
            {assessment.balance_payment_status === "pending" && <BalancePaymentReviewForm assessment={assessment} />}
          </section>
        )}
        {assessment.quotation && (
          <p className="mt-3 text-xs text-[#999]">Quotation status: <strong className="text-[#e7e7e2]">{assessment.status.replace(/_/g, " ")}</strong> · Total: {currency.format(Number(assessment.quotation.total ?? 0))}</p>
        )}
      </div>
    </dialog>
  );
}

export function SiteAssessmentsTab({
  assessments,
  businessAccounts,
  approvedByFallback,
  newAssessmentIds,
}: {
  assessments: SiteAssessment[];
  businessAccounts: DashboardData["businessAccounts"];
  approvedByFallback: string;
  newAssessmentIds: string[];
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
  const normalizedSearch = search.trim().toLowerCase();
  const filteredAssessments = assessments.filter((assessment) => {
    if (statusFilter !== "all" && assessment.status !== statusFilter) return false;
    if (!normalizedSearch) return true;
    const customer = assessment.customer_info;
    const installation = assessment.installation_info;
    return [
      assessment.id,
      customer.organizationName,
      customer.contactPerson,
      customer.email,
      customer.contactNumber,
      installation.areaName,
      installation.exactLocation,
    ].some((value) => typeof value === "string" && value.toLowerCase().includes(normalizedSearch));
  });
  const selectedAssessment = assessments.find((assessment) => assessment.id === selectedAssessmentId) ?? null;

  return (
    <div className="space-y-5">
      <Panel>
        <PanelHeading title="Site assessment requests" description="Review feasibility requests, assign site assessors, and prepare quotations after the visit." action={`${assessments.length} requests`} />
        <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
          <label className="text-xs text-[#c8c6bd]">
            Search requests
            <input
              className="mt-1.5 h-10 w-full rounded-lg border border-[#363636] bg-[#181818] px-3 text-sm text-[#f0efe9]"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Organization, contact, email, location, or request ID"
              type="search"
              value={search}
            />
          </label>
          <label className="text-xs text-[#c8c6bd]">
            Filter by status
            <select
              className="mt-1.5 h-10 w-full rounded-lg border border-[#363636] bg-[#181818] px-3 text-sm text-[#f0efe9]"
              onChange={(event) => setStatusFilter(event.target.value)}
              value={statusFilter}
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="declined">Declined</option>
              <option value="site_assessed">Site assessed</option>
              <option value="quotation_sent">Quotation sent</option>
              <option value="quotation_accepted">Quotation accepted</option>
              <option value="quotation_declined">Quotation declined</option>
            </select>
          </label>
        </div>
        {assessments.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#999]">No assessment requests yet.</p>
        ) : filteredAssessments.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#999]">No requests match this search and status filter.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-[#303030]">
            <table className="w-full min-w-[850px] border-collapse text-left text-xs">
              <thead className="bg-[#111] text-[#999]">
                <tr>
                  <th className="px-4 py-3 font-medium">Request</th>
                  <th className="px-4 py-3 font-medium">Organization / contact</th>
                  <th className="px-4 py-3 font-medium">Installation area</th>
                  <th className="px-4 py-3 font-medium">Preferred visit</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssessments.map((assessment) => (
                  <tr
                    aria-label={`View assessment for ${assessment.customer_info.organizationName}`}
                    className="cursor-pointer border-t border-[#303030] text-[#e1e1dc] outline-none transition hover:bg-[#202020] focus-visible:bg-[#202020] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#f97316]"
                    key={assessment.id}
                    onClick={() => setSelectedAssessmentId(assessment.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedAssessmentId(assessment.id);
                      }
                    }}
                    tabIndex={0}
                  >
                    <td className="px-4 py-3 font-mono text-[11px] text-[#aaa]">
                      <div className="flex items-center gap-2">
                        {assessment.id.slice(0, 8).toUpperCase()}
                        {newAssessmentIds.includes(assessment.id) && <NewBadge />}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="block font-semibold">{assessment.customer_info.organizationName}</span>
                      <span className="mt-1 block text-[#999]">{assessment.customer_info.contactPerson}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="block">{assessment.installation_info.areaName}</span>
                      <span className="mt-1 block text-[#999]">{assessment.installation_info.exactLocation}</span>
                    </td>
                    <td className="px-4 py-3">{assessment.preferred_assessment_date}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={assessment.status === "quotation_sent" && assessment.downpayment_status === "pending" ? "payment pending verification" : assessment.status.replace(/_/g, " ")} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      {selectedAssessment && (
        <AssessmentDetailsDialog
          assessment={selectedAssessment}
          businessAccounts={businessAccounts}
          approvedByFallback={approvedByFallback}
          onClose={() => setSelectedAssessmentId(null)}
        />
      )}
    </div>
  );
}
