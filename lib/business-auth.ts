import "server-only";

import { redirect } from "next/navigation";
import { backendFetch } from "@/lib/backend-api";

export async function getActiveBusinessAccount() {
  try {
    const response = await backendFetch("/api/v1/admin/account");
    const body = (await response.json()) as { account: {
      id: string;
      firstname: string;
      middlename: string | null;
      lastname: string | null;
      contactNo: string | null;
      email: string;
      role: "admin" | "staff";
      status: string;
      is_active: boolean;
    } };
    return body.account;
  } catch (error) {
    console.error("Could not verify the business user session.", error);
    redirect("/");
  }
}
