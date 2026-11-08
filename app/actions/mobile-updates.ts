"use server";

import { revalidatePath } from "next/cache";
import { backendFetch } from "@/lib/backend-api";

export type MobileUpdateActionState = { error?: string; success?: string };

export async function publishMobileUpdate(
  _previousState: MobileUpdateActionState,
  formData: FormData,
): Promise<MobileUpdateActionState> {
  const version = String(formData.get("version") ?? "").trim();
  const platform = String(formData.get("platform") ?? "");
  const downloadUrl = String(formData.get("downloadUrl") ?? "").trim();
  const releaseNotes = String(formData.get("releaseNotes") ?? "").trim();
  if (!version || !["android", "ios", "both"].includes(platform) || !/^https?:\/\//i.test(downloadUrl)) {
    return { error: "Enter a version, supported platform, and valid download URL." };
  }
  try {
    await backendFetch("/api/v1/admin/mobile-updates", {
      method: "POST",
      body: JSON.stringify({ version, platform, downloadUrl, releaseNotes }),
    });
    revalidatePath("/business");
    return { success: `Mobile app update ${version} was saved.` };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Mobile app update could not be saved." };
  }
}
