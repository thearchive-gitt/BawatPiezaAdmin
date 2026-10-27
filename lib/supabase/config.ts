function normalizeSupabaseUrl(value: string) {
  let url = value.trim().replace(/^["']|["']$/g, "");
  const markdownLink = url.match(/^\[(https?:\/\/[^\]]+)\]\((?:https?:\/\/[^\s)]+)\)$/);

  if (markdownLink) {
    url = markdownLink[1];
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error(
      "Invalid Supabase URL. Set SUPABASE_URL to a plain project URL such as https://your-project.supabase.co.",
    );
  }

  if (
    (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") ||
    !parsedUrl.hostname ||
    parsedUrl.pathname !== "/" ||
    parsedUrl.search ||
    parsedUrl.hash
  ) {
    throw new Error(
      "Invalid Supabase URL. Set SUPABASE_URL to the plain HTTP or HTTPS project URL without a path, query, or Markdown formatting.",
    );
  }

  return parsedUrl.origin;
}

export function isSupabaseConfigured() {
  return Boolean(
    (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      (process.env.SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  );
}

export function getSupabaseConfig() {
  const rawUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!rawUrl || !key) {
    throw new Error(
      "Missing Supabase configuration. Set SUPABASE_URL and SUPABASE_ANON_KEY (or their NEXT_PUBLIC_ equivalents) in .env.local.",
    );
  }

  return { url: normalizeSupabaseUrl(rawUrl), key };
}
