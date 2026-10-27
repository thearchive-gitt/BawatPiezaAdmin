import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getActiveBusinessAccount() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    console.error("Could not verify the business user session.", authError);
    throw new Error("Could not verify your session. Please try signing in again.");
  }

  if (!user) {
    redirect("/");
  }

  const { data: account, error: accountError } = await supabase
    .from("business_accounts")
    .select(
      "id, firstname, middlename, lastname, contactNo, email, role, status, is_active",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (accountError) {
    console.error("Could not load the business account.", accountError);
    throw new Error(
      "Could not load your business account. Check the business_accounts row-level security policy.",
    );
  }

  if (
    !account ||
    (account.role !== "admin" && account.role !== "staff") ||
    account.status !== "active" ||
    !account.is_active
  ) {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.error("Could not end an inactive business session.", signOutError);
    }
    redirect("/");
  }

  return account;
}
