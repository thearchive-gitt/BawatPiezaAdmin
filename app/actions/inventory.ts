"use server";

import { revalidatePath } from "next/cache";
import { backendFetch } from "@/lib/backend-api";

export type InventoryActionState = {
  error?: string;
  success?: string;
};

export async function updateInventoryStock(
  _previousState: InventoryActionState,
  formData: FormData,
): Promise<InventoryActionState> {
  const productId = String(formData.get("productId") ?? "");
  const stock = Number(formData.get("stock"));
  if (!productId || !Number.isInteger(stock) || stock < 0) {
    return { error: "Enter a valid non-negative whole-number stock value." };
  }

  try {
    await backendFetch(`/api/v1/admin/inventory/${encodeURIComponent(productId)}`, {
      method: "PATCH",
      body: JSON.stringify({ stock }),
    });
    revalidatePath("/business");
    return { success: "Inventory updated. The ecommerce catalog now uses this stock." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Inventory could not be updated." };
  }
}