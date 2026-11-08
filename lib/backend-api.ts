import "server-only";

import { createClient } from "@/lib/supabase/server";

const backendUrl = (
  process.env.BACKEND_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000"
).replace(/\/+$/, "");

export async function backendFetch(path: string, init: RequestInit = {}) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) {
    throw new Error("Your session has expired. Please sign in again.");
  }
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${data.session.access_token}`);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  let response: Response;
  try {
    response = await fetch(`${backendUrl}${path}`, { ...init, headers, cache: "no-store" });
  } catch (error) {
    console.error("[backend-api] Backend request failed:", error);
    throw new Error(
      `The backend service is unavailable at ${backendUrl}. Start the backend service and try again.`,
    );
  }
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Backend request failed with status ${response.status}.`);
  }
  return response;
}
