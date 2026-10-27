"use server";

import { revalidatePath } from "next/cache";
import { getActiveBusinessAccount } from "@/lib/business-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export type CreateBusinessAccountState = {
  error?: string;
  success?: string;
} | null;

export type BusinessAccountStatusState = {
  error?: string;
  success?: string;
} | null;

export type UpdateBusinessProfileState = {
  error?: string;
  success?: string;
} | null;

function getText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export async function createBusinessAccount(
  _previousState: CreateBusinessAccountState,
  formData: FormData,
): Promise<CreateBusinessAccountState> {
  const currentAccount = await getActiveBusinessAccount();
  if (currentAccount.role !== "admin") {
    return {
      error: "Only a business admin can create business accounts.",
    };
  }

  const firstname = getText(formData, "firstname");
  const middlename = getText(formData, "middlename");
  const lastname = getText(formData, "lastname");
  const contactNo = getText(formData, "contactNo");
  const email = getText(formData, "email").toLowerCase();
  const role = getText(formData, "role");
  const password = formData.get("password");

  if (
    !firstname ||
    !lastname ||
    !email ||
    typeof password !== "string" ||
    (role !== "admin" && role !== "staff")
  ) {
    return {
      error: "Enter the required account details and choose a valid role.",
    };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }

  if (
    firstname.length > 100 ||
    middlename.length > 100 ||
    lastname.length > 100 ||
    contactNo.length > 30 ||
    email.length > 254
  ) {
    return { error: "One or more account fields exceed the allowed length." };
  }

  if (password.length < 8 || password.length > 128) {
    return {
      error: "The temporary password must be between 8 and 128 characters.",
    };
  }

  let supabaseAdmin;
  try {
    supabaseAdmin = createAdminClient();
  } catch (error) {
    console.error("Business account provisioning is not configured.", error);
    return {
      error:
        "Business account creation is not configured. Set the server-only Supabase service-role key and restart the app.",
    };
  }

  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstname,
        middle_name: middlename || null,
        last_name: lastname,
      },
    });

  if (authError || !authData.user) {
    if (authError) {
      console.error("Could not create the business Auth user.", authError);
    }

    return {
      error:
        "Could not create the account. The email may already be registered, or Supabase rejected the password.",
    };
  }

  const { error: profileError } = await supabaseAdmin
    .from("business_accounts")
    .insert({
      id: authData.user.id,
      firstname,
      middlename: middlename || null,
      lastname,
      contactNo: contactNo || null,
      email,
      role,
      status: "active",
      is_active: true,
    });

  if (profileError) {
    console.error("Could not save the business account profile.", profileError);
    const { error: rollbackError } =
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);

    if (rollbackError) {
      console.error(
        "Could not remove the Auth user after business account creation failed.",
        rollbackError,
      );
      return {
        error:
          "The business profile could not be saved and the Auth user could not be rolled back. Contact your Supabase administrator before retrying.",
      };
    }

    return {
      error:
        "The business profile could not be saved. Check your Supabase setup, then try again.",
    };
  }

  revalidatePath("/business");
  return {
    success: `${role === "admin" ? "Admin" : "Staff"} account created for ${email}. Share the temporary password securely.`,
  };
}

export async function setBusinessAccountActive(
  _previousState: BusinessAccountStatusState,
  formData: FormData,
): Promise<BusinessAccountStatusState> {
  const currentAccount = await getActiveBusinessAccount();
  if (currentAccount.role !== "admin") {
    return { error: "Only a business admin can change account status." };
  }

  const accountId = getText(formData, "accountId");
  const isActiveValue = getText(formData, "isActive");
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      accountId,
    ) ||
    (isActiveValue !== "true" && isActiveValue !== "false")
  ) {
    return { error: "The business account status request is invalid." };
  }

  const isActive = isActiveValue === "true";
  if (!isActive && accountId === currentAccount.id) {
    return { error: "You cannot deactivate your own business account." };
  }

  let supabaseAdmin;
  try {
    supabaseAdmin = createAdminClient();
  } catch (error) {
    console.error("Business account status management is not configured.", error);
    return {
      error:
        "Business account status management is not configured. Check the server-only Supabase service-role key.",
    };
  }

  const { data: targetAccount, error: targetError } = await supabaseAdmin
    .from("business_accounts")
    .select("role, status, is_active")
    .eq("id", accountId)
    .maybeSingle();

  if (targetError) {
    console.error("Could not load the target business account.", targetError);
    return { error: "Could not load the selected business account." };
  }
  if (!targetAccount) {
    return { error: "The selected business account was not found." };
  }

  if (
    !isActive &&
    targetAccount.role === "admin" &&
    targetAccount.is_active &&
    targetAccount.status === "active"
  ) {
    const { count, error: countError } = await supabaseAdmin
      .from("business_accounts")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin")
      .eq("status", "active")
      .eq("is_active", true);

    if (countError) {
      console.error("Could not verify active business admins.", countError);
      return { error: "Could not verify whether another active admin exists." };
    }
    if ((count ?? 0) <= 1) {
      return {
        error: "The last active admin account cannot be deactivated.",
      };
    }
  }

  const { error: updateError } = await supabaseAdmin
    .from("business_accounts")
    .update({
      status: isActive ? "active" : "suspended",
      is_active: isActive,
    })
    .eq("id", accountId);

  if (updateError) {
    console.error("Could not update business account status.", updateError);
    return { error: "Could not update the business account status." };
  }

  revalidatePath("/business");
  return {
    success: `Business account ${isActive ? "activated" : "deactivated"}.`,
  };
}

export async function updateBusinessProfile(
  _previousState: UpdateBusinessProfileState,
  formData: FormData,
): Promise<UpdateBusinessProfileState> {
  const account = await getActiveBusinessAccount();
  const firstname = getText(formData, "firstname");
  const middlename = getText(formData, "middlename");
  const lastname = getText(formData, "lastname");
  const contactNo = getText(formData, "contactNo");

  if (!firstname || firstname.length > 100) {
    return { error: "First name is required and must be 100 characters or fewer." };
  }
  if (middlename.length > 100 || lastname.length > 100) {
    return { error: "Names must be 100 characters or fewer." };
  }
  if (contactNo.length > 30) {
    return { error: "Contact number must be 30 characters or fewer." };
  }

  let supabaseAdmin;
  try {
    supabaseAdmin = createAdminClient();
  } catch (error) {
    console.error("Business profile editing is not configured.", error);
    return {
      error:
        "Profile editing is not configured. Check the server-only Supabase service-role key.",
    };
  }

  const { error } = await supabaseAdmin
    .from("business_accounts")
    .update({
      firstname,
      middlename: middlename || null,
      lastname: lastname || null,
      contactNo: contactNo || null,
    })
    .eq("id", account.id);

  if (error) {
    console.error("Could not update the business profile.", error);
    return { error: "Could not save your profile changes." };
  }

  revalidatePath("/business");
  return { success: "Profile updated." };
}
