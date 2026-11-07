"use server";

import { revalidatePath } from "next/cache";
import { getActiveBusinessAccount } from "@/lib/business-auth";
import { backendFetch } from "@/lib/backend-api";

export type CreateBusinessAccountState = { error?: string; success?: string } | null;
export type BusinessAccountStatusState = { error?: string; success?: string } | null;
export type UpdateBusinessProfileState = { error?: string; success?: string } | null;

function getText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export async function createBusinessAccount(
  _previousState: CreateBusinessAccountState,
  formData: FormData,
): Promise<CreateBusinessAccountState> {
  const current = await getActiveBusinessAccount();
  if (current.role !== "admin") return { error: "Only a business admin can create business accounts." };
  const firstname = getText(formData, "firstname");
  const middlename = getText(formData, "middlename");
  const lastname = getText(formData, "lastname");
  const contactNo = getText(formData, "contactNo");
  const email = getText(formData, "email").toLowerCase();
  const role = getText(formData, "role");
  const password = formData.get("password");
  if (!firstname || !lastname || !email || typeof password !== "string" || (role !== "admin" && role !== "staff")) {
    return { error: "Enter the required account details and choose a valid role." };
  }
  try {
    await backendFetch("/api/v1/admin/business-accounts", {
      method: "POST",
      body: JSON.stringify({ firstname, middlename, lastname, contactNo, email, role, password }),
    });
    revalidatePath("/business");
    return { success: `${role === "admin" ? "Admin" : "Staff"} account created for ${email}. Share the temporary password securely.` };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not create the business account." };
  }
}

export async function setBusinessAccountActive(
  _previousState: BusinessAccountStatusState,
  formData: FormData,
): Promise<BusinessAccountStatusState> {
  const account = await getActiveBusinessAccount();
  if (account.role !== "admin") return { error: "Only a business admin can change account status." };
  const accountId = getText(formData, "accountId");
  const isActive = getText(formData, "isActive") === "true";
  try {
    await backendFetch(`/api/v1/admin/business-accounts/${accountId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    });
    revalidatePath("/business");
    return { success: `Business account ${isActive ? "activated" : "deactivated"}.` };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not update the business account status." };
  }
}

export async function updateBusinessProfile(
  _previousState: UpdateBusinessProfileState,
  formData: FormData,
): Promise<UpdateBusinessProfileState> {
  await getActiveBusinessAccount();
  try {
    await backendFetch("/api/v1/admin/account", {
      method: "PATCH",
      body: JSON.stringify({
        firstname: getText(formData, "firstname"),
        middlename: getText(formData, "middlename"),
        lastname: getText(formData, "lastname"),
        contactNo: getText(formData, "contactNo"),
      }),
    });
    revalidatePath("/business");
    return { success: "Profile updated." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save your profile changes." };
  }
}
