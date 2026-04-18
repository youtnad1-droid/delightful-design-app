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
    let stallTimer: number | null = null;
    let started = false;
    let cancelled = false;

    // Reset video element
    video.pause();
    video.removeAttribute("src");
    video.load();

    const playWithHls = () => {
      hls = new Hls(
        live
          ? {
              autoStartLoad: true,
              enableWorker: true,
              // Buffer tuning — preload before starting, keep a healthy cushion
              maxBufferLength: 30,
              maxMaxBufferLength: 60,
              backBufferLength: 30,
              // Latency — start ~10s behind live edge for stability
              liveSyncDuration: 10,
              liveMaxLatencyDuration: 20,
              // Reduce freezes on small gaps
              maxBufferHole: 1,
              highBufferWatchdogPeriod: 2,
              // Network timeouts
              manifestLoadingTimeOut: 10000,
              levelLoadingTimeOut: 10000,
              fragLoadingTimeOut: 20000,
            }
          : { enableWorker: true }
      );
      hls.loadSource(proxiedSrc);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (live) video.muted = true;
        // For VOD, autoplay immediately. For live, wait until ~10s buffered.
        if (!live && autoPlay) video.play().catch(() => {});
      });

      // Preload ~10s of buffer before starting live playback
      if (live) {
        hls.on(Hls.Events.FRAG_BUFFERED, () => {
          if (started || cancelled || !autoPlay) return;
          const buffered = video.buffered;
          if (buffered.length > 0) {
            const bufferAhead = buffered.end(buffered.length - 1) - video.currentTime;
            if (bufferAhead >= 10) {
              started = true;
              video.play().catch(() => {});
            }
          }
        });

        // Watchdog: if the stream stalls (readyState < 2), kick the loader
        stallTimer = window.setInterval(() => {
          if (cancelled || !hls) return;
          if (started && video.readyState < 2 && !video.paused) {
            console.warn("Live stream stalled → reloading");
            hls.startLoad();
          }
        }, 5000);
      }

      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (!data.fatal) return;
        console.error("HLS error:", data);
        // If the "playlist" is actually MPEG-TS (no EXTM3U), fall back to mpegts.js
        if (data.details === "manifestParsingError" && live) {
          hls?.destroy();
          hls = null;
          playWithMpegts();
          return;
        }
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            console.log("Network error → retrying...");
            hls?.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.log("Media error → recovering...");
            hls?.recoverMediaError();
            break;
          default:
            hls?.destroy();
            hls = null;
            break;
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
      if (autoPlay) {
        const p = mpegtsPlayer.play() as unknown as Promise<void> | void;
        if (p && typeof (p as Promise<void>).catch === "function") (p as Promise<void>).catch(() => {});
      }
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
