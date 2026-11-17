"use client";

import { useActionState } from "react";
import { uploadSiteAssessmentPaymentQr, type SiteAssessmentActionState } from "@/app/actions/site-assessments";
import { Panel, PanelHeading } from "./dashboard-primitives";

const initialState: SiteAssessmentActionState = null;

export function GcashSetupTab({ paymentQrUrl }: { paymentQrUrl: string | null }) {
  const [state, action, pending] = useActionState(uploadSiteAssessmentPaymentQr, initialState);
  return (
    <Panel>
      <PanelHeading title="GCash payment QR setup" description="Configure the static QR code customers use to pay a quotation downpayment." />
      <div className="mt-4 flex flex-wrap items-start gap-5">
        {paymentQrUrl ? (
          <a className="text-xs text-[#ff9a4d] underline" href={paymentQrUrl} rel="noreferrer" target="_blank">View current GCash QR code</a>
        ) : (
          <p className="text-xs text-[#c8c6bd]">No GCash QR code is configured yet.</p>
        )}
        <form action={action} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <label className="text-xs text-[#c8c6bd]">
            Upload a static QR image (JPG, PNG, or WebP; up to 5 MB)
            <input accept="image/jpeg,image/png,image/webp" className="mt-1.5 block w-full text-xs" name="qrImage" required type="file" />
          </label>
          <button className="rounded-lg bg-[#214d38] px-4 py-2.5 text-xs font-semibold" disabled={pending} type="submit">
            {pending ? "Uploading..." : "Save GCash QR"}
          </button>
          {state?.error && <p className="text-xs text-red-400 sm:col-span-2" role="alert">{state.error}</p>}
          {state?.success && <p className="text-xs text-green-400 sm:col-span-2" role="status">{state.success}</p>}
        </form>
      </div>
    </Panel>
  );
}
