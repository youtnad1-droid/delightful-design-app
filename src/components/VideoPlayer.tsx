import { useEffect, useRef } from "react";
import Hls from "hls.js";

interface Props {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  className?: string;
}

const VideoPlayer = ({ src, poster, autoPlay = true, className = "" }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    let hls: Hls | null = null;
    const isHls = /\.m3u8(\?|$)/i.test(src);
    const canNativeHls = video.canPlayType("application/vnd.apple.mpegurl") !== "";

    if (isHls && Hls.isSupported() && !canNativeHls) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) console.error("HLS fatal error:", data);
      });
    } else {
      video.src = src;
    }

    if (autoPlay) video.play().catch(() => {});

    return () => {
      if (hls) hls.destroy();
      video.removeAttribute("src");
      video.load();
    };
  }, [src, autoPlay]);

  return (
    <video
      ref={videoRef}
      poster={poster}
      controls
      playsInline
      className={`w-full h-full bg-black ${className}`}
    />
  );
};

export default VideoPlayer;
