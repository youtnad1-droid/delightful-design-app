// IPTV Proxy: streams Xtream API + M3U playlists server-side to bypass CORS.
// Streams upstream body directly to avoid memory limits on large playlists.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Expose-Headers": "x-proxy-status, x-proxy-error",
};

const isPrivateHost = (h: string): boolean => {
  h = h.toLowerCase();
  if (h === "localhost" || h === "0.0.0.0" || h === "::1") return true;
  if (h.endsWith(".local") || h.endsWith(".internal")) return true;
  const m = h.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (m) {
    const [a, b] = [+m[1], +m[2]];
    if (a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
  }
  return false;
};

const errResp = (msg: string, status = 400) =>
  new Response(msg, {
    status,
    headers: { ...corsHeaders, "Content-Type": "text/plain", "x-proxy-error": msg.slice(0, 200) },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return errResp("Method not allowed", 405);

  let body: { url?: string; responseType?: "json" | "text" };
  try {
    body = await req.json();
  } catch {
    return errResp("Invalid JSON body", 400);
  }
  if (!body.url) return errResp("Missing 'url'", 400);

  let target: URL;
  try {
    target = new URL(body.url);
  } catch {
    return errResp("Invalid URL", 400);
  }
  if (!["http:", "https:"].includes(target.protocol)) return errResp("Only http/https allowed", 400);
  if (isPrivateHost(target.hostname)) return errResp("Private/loopback hosts blocked", 400);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  let upstream: Response;
  try {
    upstream = await fetch(target.toString(), {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: "*/*",
      },
    });
  } catch (e: any) {
    clearTimeout(timeout);
    return errResp(e?.name === "AbortError" ? "Upstream timeout" : `Upstream fetch failed: ${e?.message || e}`, 502);
  }
  // Don't clear timeout — let it abort if streaming hangs. It's bound to controller.signal.

  const contentType =
    upstream.headers.get("content-type") ||
    (body.responseType === "text" ? "text/plain" : "application/json");

  // Stream the body straight through — no buffering, no JSON wrapping.
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      ...corsHeaders,
      "Content-Type": contentType,
      "x-proxy-status": String(upstream.status),
    },
  });
});
