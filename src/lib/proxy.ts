import { supabase } from "@/integrations/supabase/client";

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/iptv-proxy`;

/**
 * Calls the iptv-proxy edge function to fetch a URL server-side (bypasses CORS).
 * Streams the upstream response back so large M3U playlists don't blow memory.
 */
export const proxyFetch = async <T = unknown>(
  url: string,
  responseType: "json" | "text" = "json"
): Promise<T> => {
  const { data: sess } = await supabase.auth.getSession();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    Authorization: `Bearer ${sess.session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
  };

  const res = await fetch(FUNCTIONS_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ url, responseType }),
  });

  if (!res.ok) {
    const errMsg = res.headers.get("x-proxy-error") || (await res.text().catch(() => "")) || `Proxy ${res.status}`;
    throw new Error(errMsg);
  }

  if (responseType === "text") return (await res.text()) as T;
  return (await res.json()) as T;
};
