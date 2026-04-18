// IPTV Proxy: fetches Xtream API endpoints and M3U playlists server-side to bypass CORS.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ProxyRequest {
  url: string;
  // "json" for Xtream API responses, "text" for M3U playlist text
  responseType?: "json" | "text";
}

const isPrivateHost = (hostname: string): boolean => {
  const h = hostname.toLowerCase();
  if (h === "localhost" || h === "0.0.0.0" || h === "::1") return true;
  if (h.endsWith(".local") || h.endsWith(".internal")) return true;
  // IPv4 private ranges
  const m = h.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (m) {
    const [a, b] = [parseInt(m[1]), parseInt(m[2])];
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
  }
  return false;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (req.method !== "POST") {
      return json({ ok: false, error: "Method not allowed" }, 405);
    }
    const body = (await req.json()) as ProxyRequest;
    if (!body?.url || typeof body.url !== "string") {
      return json({ ok: false, error: "Missing 'url'" }, 400);
    }

    let target: URL;
    try {
      target = new URL(body.url);
    } catch {
      return json({ ok: false, error: "Invalid URL" }, 400);
    }
    if (!["http:", "https:"].includes(target.protocol)) {
      return json({ ok: false, error: "Only http/https supported" }, 400);
    }
    if (isPrivateHost(target.hostname)) {
      return json({ ok: false, error: "Private/loopback hosts are blocked" }, 400);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    let upstream: Response;
    try {
      upstream = await fetch(target.toString(), {
        method: "GET",
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
      return json({
        ok: false,
        error: e?.name === "AbortError" ? "Upstream timeout" : `Upstream fetch failed: ${e?.message || e}`,
        diagnostics: { requested_url: target.toString(), error_stage: "fetch" },
      });
    }
    clearTimeout(timeout);

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => "");
      return json({
        ok: false,
        error: `Upstream returned ${upstream.status}`,
        diagnostics: {
          requested_url: target.toString(),
          status: upstream.status,
          error_stage: "upstream_status",
          body_preview: text.slice(0, 300),
        },
      });
    }

    const responseType = body.responseType ?? "json";
    if (responseType === "text") {
      const text = await upstream.text();
      return json({ ok: true, data: text });
    }

    const text = await upstream.text();
    try {
      const parsed = JSON.parse(text);
      return json({ ok: true, data: parsed });
    } catch {
      return json({
        ok: false,
        error: "Upstream did not return valid JSON",
        diagnostics: { body_preview: text.slice(0, 300) },
      });
    }
  } catch (e: any) {
    return json({ ok: false, error: e?.message || "Unknown error" }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
