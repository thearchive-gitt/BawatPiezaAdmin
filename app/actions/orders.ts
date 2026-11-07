"use server";

import { revalidatePath } from "next/cache";
import { backendFetch } from "@/lib/backend-api";

export async function updateDeliveryStatus(
  formData: FormData,
) {
  const orderId = formData.get("orderId");
  const deliveryStatus = formData.get("deliveryStatus");
  if (typeof orderId !== "string" || typeof deliveryStatus !== "string") {
    throw new Error("Order delivery status details are invalid.");
  }
  await backendFetch(`/api/v1/admin/orders/${encodeURIComponent(orderId)}/delivery-status`, {
    method: "PATCH",
    body: JSON.stringify({ deliveryStatus }),
  });
  revalidatePath("/business");
}
