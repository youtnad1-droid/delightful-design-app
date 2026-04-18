import { useEffect, useRef } from "react";
import Hls from "hls.js";
import { proxiedStreamUrl } from "@/lib/streamProxy";

interface Props {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  className?: string;
  /** Hint that this is a live stream (Live TV) — enables HLS.js with live-tuned config. */
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
    const isHls = /\.m3u8(\?|$)/i.test(src) || live;
    const canNativeHls = video.canPlayType("application/vnd.apple.mpegurl") !== "";

    let hls: Hls | null = null;

    // Reset video element
    video.pause();
    video.removeAttribute("src");
    video.load();

    if (isHls && Hls.isSupported()) {
      // Prefer HLS.js (works on Chrome/Edge/Firefox). Live-tuned config for Live TV.
      hls = new Hls(
        live
          ? { enableWorker: true, lowLatencyMode: true, liveSyncDuration: 3, maxBufferLength: 20, backBufferLength: 30 }
          : { enableWorker: true }
      );
      hls.loadSource(proxiedSrc);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (live) video.muted = true; // help autoplay for live
        if (autoPlay) video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) {
          console.error("HLS fatal error:", data);
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls?.startLoad();
          else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls?.recoverMediaError();
        }
      });
    } else if (isHls && canNativeHls) {
      // Safari native HLS
      video.src = proxiedSrc;
      if (live) video.muted = true;
      if (autoPlay) video.play().catch(() => {});
    } else {
      // VOD / direct file (mp4, mkv, etc.)
      video.src = proxiedSrc;
      if (autoPlay) video.play().catch(() => {});
    }

    return () => {
      if (hls) hls.destroy();
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
