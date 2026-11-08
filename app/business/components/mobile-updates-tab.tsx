"use client";

import { useActionState } from "react";
import type { DashboardData } from "@/lib/dashboard-data";
import { publishMobileUpdate, type MobileUpdateActionState } from "@/app/actions/mobile-updates";
import { Panel, PanelHeading } from "./dashboard-primitives";

const initialState: MobileUpdateActionState = {};

export function MobileUpdatesTab({
  updates,
}: {
  updates?: DashboardData["mobileAppUpdates"];
}) {
  const [state, formAction, pending] = useActionState(publishMobileUpdate, initialState);
  const releases = Array.isArray(updates) ? updates : [];

  return (
    <section className="space-y-5">
      <Panel>
        <PanelHeading
          title="Mobile app updates"
          description="Prepare a release link for the mobile app without changing the mobile app source code."
          action="Admin only"
        />
        <form action={formAction} className="grid gap-4 md:grid-cols-2">
          <label className="text-xs font-medium text-[#c8c6bd]">
            Version
            <input className="mt-1.5 w-full rounded-lg border border-[#363636] bg-[#181818] px-3 py-2.5 text-sm text-[#f0efe9]" name="version" placeholder="1.0.1" required />
          </label>
          <label className="text-xs font-medium text-[#c8c6bd]">
            Platform
            <select className="mt-1.5 w-full rounded-lg border border-[#363636] bg-[#181818] px-3 py-2.5 text-sm text-[#f0efe9]" defaultValue="both" name="platform">
              <option value="both">Android and iOS</option>
              <option value="android">Android</option>
              <option value="ios">iOS</option>
            </select>
          </label>
          <label className="md:col-span-2 text-xs font-medium text-[#c8c6bd]">
            Download or store link
            <input className="mt-1.5 w-full rounded-lg border border-[#363636] bg-[#181818] px-3 py-2.5 text-sm text-[#f0efe9]" name="downloadUrl" placeholder="https://..." required type="url" />
          </label>
          <label className="md:col-span-2 text-xs font-medium text-[#c8c6bd]">
            Release notes
            <textarea className="mt-1.5 w-full rounded-lg border border-[#363636] bg-[#181818] px-3 py-2.5 text-sm text-[#f0efe9]" name="releaseNotes" placeholder="What changed in this release?" rows={3} />
          </label>
          {state.error && <p className="md:col-span-2 text-xs text-[#ff8585]" role="alert">{state.error}</p>}
          {state.success && <p className="md:col-span-2 text-xs text-[#72d98d]" role="status">{state.success}</p>}
          <button className="w-fit rounded-lg bg-[#f97316] px-4 py-2.5 text-sm font-semibold text-[#090909] disabled:opacity-50" disabled={pending} type="submit">
            {pending ? "Saving..." : "Save update release"}
          </button>
        </form>
      </Panel>

      <Panel>
        <PanelHeading title="Release history" description="Versions prepared for the mobile app update flow." action={`${releases.length} release${releases.length === 1 ? "" : "s"}`} />
        {releases.length === 0 ? (
          <p className="rounded-xl border border-[#292929] bg-[#181818] px-4 py-7 text-center text-sm text-[#999]">No mobile app releases have been prepared.</p>
        ) : (
          <div className="space-y-3">
            {releases.map((update) => (
              <article className="rounded-xl border border-[#292929] bg-[#151515] p-4" key={update.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#f0efe9]">Version {update.version}</p>
                    <p className="mt-1 text-xs text-[#999]">{update.platform.toUpperCase()} · {new Date(update.created_at).toLocaleString()}</p>
                  </div>
                  <span className="rounded-full bg-[#2a1609] px-3 py-1.5 text-[11px] font-medium text-[#ff9a4d]">{update.status}</span>
                </div>
                <a className="mt-3 block truncate text-xs text-[#72c7ed] hover:underline" href={update.download_url} rel="noreferrer" target="_blank">{update.download_url}</a>
                {update.release_notes && <p className="mt-2 text-xs leading-5 text-[#999]">{update.release_notes}</p>}
              </article>
            ))}
          </div>
        )}
      </Panel>
    </section>
  );
}
