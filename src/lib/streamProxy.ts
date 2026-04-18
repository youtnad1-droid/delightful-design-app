// Wraps a stream URL so playback requests go through the iptv-proxy edge function.
// This bypasses CORS issues that prevent <video>/HLS.js from loading IPTV streams directly.
const PROXY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/iptv-proxy`;

export const proxiedStreamUrl = (url: string): string => {
  if (!url) return url;
  return `${PROXY_URL}?url=${encodeURIComponent(url)}`;
};
