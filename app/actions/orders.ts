"use server";

import { revalidatePath } from "next/cache";
import { backendFetch } from "@/lib/backend-api";

export async function updateDeliveryStatus(
  _previousState: { success?: string; error?: string } | null,
  formData: FormData,
): Promise<{ success?: string; error?: string }> {
  const orderId = formData.get("orderId");
  const deliveryStatus = formData.get("deliveryStatus");
  if (typeof orderId !== "string" || typeof deliveryStatus !== "string") {
    return { error: "Order delivery status details are invalid." };
  }
  try {
    await backendFetch(`/api/v1/admin/orders/${encodeURIComponent(orderId)}/delivery-status`, {
      method: "PATCH",
      body: JSON.stringify({ deliveryStatus }),
    });
    revalidatePath("/business");
    return { success: "Order delivery status updated successfully." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "The delivery status could not be updated." };
  }
}
