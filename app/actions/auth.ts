"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type LoginState = {
  error: string;
} | null;

export async function signInBusiness(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (!isSupabaseConfigured()) {
    return {
      error:
        "Sign-in is not configured yet. Add your Supabase URL and publishable key to the environment.",
    };
  }

  const email = formData.get("email");
  const password = formData.get("password");

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    return { error: "Enter your business email and password." };
  }

  const supabase = await createClient();
  const { data, error: signInError } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (signInError || !data.user) {
    return { error: "Email or password is incorrect." };
  }

  const { data: account, error: accountError } = await supabase
    .from("business_accounts")
    .select("role, status, is_active")
    .eq("id", data.user.id)
    .maybeSingle();

  if (accountError) {
    console.error("Could not verify the business account after sign-in.", accountError);
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.error("Could not end an unverified business session.", signOutError);
    }

    return {
      error:
        "We couldn't verify your business access. Contact your administrator.",
    };
  }

  if (
    !account ||
    (account.role !== "admin" && account.role !== "staff") ||
    account.status !== "active" ||
    !account.is_active
  ) {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.error("Could not end a session without business access.", signOutError);
    }

    return {
      error:
        "This account is not active for business access. Contact your administrator.",
    };
  }

  redirect("/business");
}

export async function signOutBusiness() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase authentication is not configured.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Could not sign out the business user.", error);
    throw new Error("Could not sign out. Please try again.");
  }

  redirect("/");
}
