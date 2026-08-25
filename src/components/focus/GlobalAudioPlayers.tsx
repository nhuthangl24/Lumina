"use client";

import { useEffect, useRef } from "react";
import { useAmbientStore } from "@/store/useAmbientStore";

function AudioPlayer({ src, volume }: { src: string; volume: number }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const playAttempted = useRef(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
      if (volume > 0) {
        if (!playAttempted.current || audioRef.current.paused) {
           const playPromise = audioRef.current.play();
           if (playPromise !== undefined) {
             playPromise.catch(() => {
               // Autoplay blocked by browser until user gesture
             });
           }
           playAttempted.current = true;
        }
      } else {
        audioRef.current.pause();
        playAttempted.current = false;
      }
    }
  }, [volume]);

  return <audio ref={audioRef} src={src} loop />;
}

export function GlobalAudioPlayers() {
  const { rainVolume, cafeVolume, fireVolume, officeVolume, oceanVolume } = useAmbientStore();

  return (
    <>
      <AudioPlayer src="/sounds/rain.mp3" volume={rainVolume} />
      <AudioPlayer src="/sounds/cafe.mp3" volume={cafeVolume} />
      <AudioPlayer src="/sounds/fire.mp3" volume={fireVolume} />
      <AudioPlayer src="/sounds/keyboard.mp3" volume={officeVolume} />
      <AudioPlayer src="/sounds/ocean.mp3" volume={oceanVolume} />
    </>
  );
}
