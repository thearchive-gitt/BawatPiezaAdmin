"use server";

import { redirect } from "next/navigation";
import { backendFetch } from "@/lib/backend-api";

const allowedTabs = new Set([
  "overview",
  "devices",
  "firmware",
  "mobile-updates",
  "staff",
  "customers",
  "inventory",
  "sales",
  "sales-customers",
  "delivery-map",
  "concerns",
  "maintenance",
  "notifications",
  "site-assessments",
  "gcash-setup",
]);

export async function openBusinessNotification(formData: FormData): Promise<void> {
  const notificationId = formData.get("notificationId");
  const requestedTab = formData.get("tab");
  const tab = typeof requestedTab === "string" && allowedTabs.has(requestedTab)
    ? requestedTab
    : "notifications";

  if (typeof notificationId === "string" && notificationId) {
    await backendFetch(`/api/v1/notifications/${encodeURIComponent(notificationId)}/read`, {
      method: "PATCH",
    });
  }

  redirect(`/business?tab=${tab}`);
}
