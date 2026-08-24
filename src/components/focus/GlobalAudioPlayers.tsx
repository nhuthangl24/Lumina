"use client";

import { useEffect, useRef } from "react";
import { useAmbientStore } from "@/store/useAmbientStore";

export function GlobalAudioPlayers() {
  const { rainVolume, cafeVolume, fireVolume, officeVolume, oceanVolume } = useAmbientStore();

  const rainRef = useRef<HTMLAudioElement | null>(null);
  const cafeRef = useRef<HTMLAudioElement | null>(null);
  const fireRef = useRef<HTMLAudioElement | null>(null);
  const officeRef = useRef<HTMLAudioElement | null>(null);
  const oceanRef = useRef<HTMLAudioElement | null>(null);

  const syncVolume = (ref: React.RefObject<HTMLAudioElement | null>, volume: number) => {
    if (ref.current) {
      ref.current.volume = volume / 100;
      if (volume > 0 && ref.current.paused) ref.current.play().catch(()=>{});
      if (volume === 0 && !ref.current.paused) ref.current.pause();
    }
  };

  useEffect(() => syncVolume(rainRef, rainVolume), [rainVolume]);
  useEffect(() => syncVolume(cafeRef, cafeVolume), [cafeVolume]);
  useEffect(() => syncVolume(fireRef, fireVolume), [fireVolume]);
  useEffect(() => syncVolume(officeRef, officeVolume), [officeVolume]);
  useEffect(() => syncVolume(oceanRef, oceanVolume), [oceanVolume]);

  return (
    <div style={{ display: "none" }}>
      <audio ref={rainRef} src="https://actions.google.com/sounds/v1/water/rain_on_roof.ogg" loop />
      <audio ref={cafeRef} src="https://actions.google.com/sounds/v1/crowds/restaurant_chatter.ogg" loop />
      <audio ref={fireRef} src="https://actions.google.com/sounds/v1/ambiences/fire.ogg" loop />
      <audio ref={officeRef} src="https://actions.google.com/sounds/v1/office/keyboard_typing_fast.ogg" loop />
      <audio ref={oceanRef} src="https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg" loop />
    </div>
  );
}
