import { useEffect, useRef } from "react";
import Hls from "hls.js";
import mpegts from "mpegts.js";
import { proxiedStreamUrl } from "@/lib/streamProxy";

interface Props {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  className?: string;
  /** Hint that this is a live stream (Live TV) — enables HLS.js / mpegts.js with live-tuned config. */
  isLive?: boolean;
}

const isLiveUrl = (url: string) =>
  /\.m3u8(\?|$)/i.test(url) || /\/live\//i.test(url) || /\.ts(\?|$)/i.test(url);

const VideoPlayer = ({ src, poster, autoPlay = true, className = "", isLive }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    const proxiedSrc = proxiedStreamUrl(src);
    const live = isLive ?? isLiveUrl(src);
    const canNativeHls = video.canPlayType("application/vnd.apple.mpegurl") !== "";

    let hls: Hls | null = null;
    let mpegtsPlayer: mpegts.Player | null = null;
    let cancelled = false;

    // Reset video element
    video.pause();
    video.removeAttribute("src");
    video.load();

    const playWithHls = () => {
      hls = new Hls(
        live
          ? { enableWorker: true, lowLatencyMode: true, liveSyncDuration: 3, maxBufferLength: 20, backBufferLength: 30 }
          : { enableWorker: true }
      );
      hls.loadSource(proxiedSrc);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (live) video.muted = true;
        if (autoPlay) video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (!data.fatal) return;
        console.error("HLS error:", data);
        // If the "playlist" is actually MPEG-TS (no EXTM3U), fall back to mpegts.js
        if (data.details === "manifestParsingError" && live) {
          hls?.destroy();
          hls = null;
          playWithMpegts();
        } else if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls?.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls?.recoverMediaError();
        }
      });
    };

    const playWithMpegts = () => {
      if (!mpegts.isSupported()) {
        console.error("mpegts.js not supported in this browser");
        return;
      }
      mpegtsPlayer = mpegts.createPlayer(
        { type: "mpegts", isLive: live, url: proxiedSrc },
        { enableWorker: true, liveBufferLatencyChasing: live, lazyLoad: false }
      );
      mpegtsPlayer.attachMediaElement(video);
      mpegtsPlayer.load();
      if (live) video.muted = true;
      if (autoPlay) mpegtsPlayer.play()?.catch(() => {});
      mpegtsPlayer.on(mpegts.Events.ERROR, (type, detail) => {
        console.error("mpegts.js error:", type, detail);
      });
    };

    // Decide initial engine
    if (live && Hls.isSupported()) {
      // Try HLS first; auto-fallback to mpegts on parse error
      playWithHls();
    } else if (live && canNativeHls) {
      video.src = proxiedSrc;
      video.muted = true;
      if (autoPlay) video.play().catch(() => {});
    } else {
      // VOD / direct file (mp4, mkv, etc.)
      video.src = proxiedSrc;
      if (autoPlay) video.play().catch(() => {});
    }

    return () => {
      cancelled = true;
      if (hls) hls.destroy();
      if (mpegtsPlayer) {
        try {
          mpegtsPlayer.pause();
          mpegtsPlayer.unload();
          mpegtsPlayer.detachMediaElement();
          mpegtsPlayer.destroy();
        } catch {}
      }
      video.removeAttribute("src");
      video.load();
    };
  }, [src, autoPlay, isLive]);

  return (
    <video
      ref={videoRef}
      poster={poster}
      controls
      playsInline
      crossOrigin="anonymous"
      className={`w-full h-full bg-black ${className}`}
    />
  );
};

export default VideoPlayer;
