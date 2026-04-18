import { supabase } from "@/integrations/supabase/client";

interface ProxyResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
  diagnostics?: Record<string, unknown>;
}

/**
 * Calls the iptv-proxy edge function to fetch a URL server-side (bypasses CORS).
 */
export const proxyFetch = async <T = unknown>(
  url: string,
  responseType: "json" | "text" = "json"
): Promise<T> => {
  const { data, error } = await supabase.functions.invoke<ProxyResult<T>>("iptv-proxy", {
    body: { url, responseType },
  });
  if (error) throw new Error(error.message || "Proxy request failed");
  if (!data?.ok) throw new Error(data?.error || "Proxy request failed");
  return data.data as T;
};
