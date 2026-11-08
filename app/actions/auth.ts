"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const backendUrl = (process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/+$/, "");

export type LoginState = {
  error: string;
} | null;

function getUserFriendlyAuthError(error: string | undefined) {
  const normalizedError = error?.toLowerCase() ?? "";

  if (
    normalizedError.includes("invalid login credentials") ||
    normalizedError.includes("email or password is incorrect")
  ) {
    return "Incorrect email or password. Please try again.";
  }

  if (
    normalizedError.includes("incorrect password") ||
    normalizedError.includes("no business account exists") ||
    normalizedError.includes("confirm your business email") ||
    normalizedError.includes("valid business email") ||
    normalizedError.includes("required") ||
    normalizedError.includes("not active for business access")
  ) {
    return error ?? "Unable to sign in. Please try again.";
  }

  return "Unable to sign in. Please try again.";
}

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
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return { error: "Please enter a valid business email address." };
  }

  let response: Response;
  try {
    response = await fetch(`${backendUrl}/api/v1/auth/business-signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      cache: "no-store",
    });
  } catch (error) {
    console.error("Business sign-in request failed.", error);
    return { error: "Unable to reach the sign-in service. Please try again." };
  }

  const body = (await response.json().catch(() => null)) as
    | { session?: Parameters<Awaited<ReturnType<typeof createClient>>["auth"]["setSession"]>[0]; error?: string }
    | null;
  if (!response.ok || !body?.session) {
    return { error: getUserFriendlyAuthError(body?.error) };
  }

  const supabase = await createClient();
  const { error: sessionError } = await supabase.auth.setSession(body.session);
  if (sessionError) {
    console.error("Could not persist the business session.", sessionError);
    return { error: "Sign-in succeeded, but the session could not be saved." };
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
