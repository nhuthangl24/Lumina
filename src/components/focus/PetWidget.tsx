"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useMotionValue, useAnimation, AnimatePresence } from "framer-motion";

// ─── Pet Designs ──────────────────────────────────────────────────────────────
const PETS: Record<string, {
  idle: string; walk: string; sleep: string; excited: string;
  label: string; color: string; glow: string; size: number;
}> = {
  "pixel-cat": {
    idle:    "🐱", walk: "🐱", sleep: "😸", excited: "😻",
    label: "Pixel Cat", color: "#c084fc", glow: "rgba(192,132,252,0.5)", size: 56,
  },
  "study-fox": {
    idle:    "🦊", walk: "🦊", sleep: "🦊", excited: "🦊",
    label: "Study Fox", color: "#fb923c", glow: "rgba(251,146,60,0.5)", size: 56,
  },
  "night-owl": {
    idle:    "🦉", walk: "🦉", sleep: "🦉", excited: "🦉",
    label: "Night Owl", color: "#60a5fa", glow: "rgba(96,165,250,0.5)", size: 56,
  },
  "capybara-chill": {
    idle:    "🦫", walk: "🦫", sleep: "🦫", excited: "🦫",
    label: "Capybara", color: "#34d399", glow: "rgba(52,211,153,0.5)", size: 56,
  },
  "cyber-dragon": {
    idle:    "🐉", walk: "🐉", sleep: "🐉", excited: "🔥",
    label: "Cyber Dragon", color: "#f472b6", glow: "rgba(244,114,182,0.6)", size: 64,
  },
  "pixel-ghost": {
    idle:    "👻", walk: "👻", sleep: "👻", excited: "👻",
    label: "Ghost", color: "#e2e8f0", glow: "rgba(226,232,240,0.4)", size: 52,
  },
};

const WALK_EVERY  = 7000;
const SLEEP_AFTER = 120_000;

type Mode = "idle" | "walk" | "excited" | "sleeping";

export function PetWidget({ petId }: { petId: string | null }) {
  const pet = petId ? (PETS[petId] ?? PETS["study-fox"]) : null;

  const mx = useMotionValue(80);
  const my = useMotionValue(typeof window !== "undefined" ? window.innerHeight - 200 : 500);
  const ctrl = useAnimation();

  const [mode, setMode] = useState<Mode>("idle");
  const [reaction, setReaction] = useState<string | null>(null);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [facingLeft, setFacingLeft] = useState(false);

  const sleepRef = useRef<NodeJS.Timeout | null>(null);
  const walkRef  = useRef<NodeJS.Timeout | null>(null);
  const reactRef = useRef<NodeJS.Timeout | null>(null);
  const lastX    = useRef(80);

  useEffect(() => {
    const v = parseInt(localStorage.getItem("promodo_pet_xp") || "0", 10);
    setXp(v); setLevel(Math.floor(v / 200) + 1);
  }, []);

  useEffect(() => {
    const h = () => {
      const newXp = parseInt(localStorage.getItem("promodo_pet_xp") || "0", 10) + 30;
      localStorage.setItem("promodo_pet_xp", newXp.toString());
      setXp(newXp); setLevel(Math.floor(newXp / 200) + 1);
      react("excited", "🎉 Xong rồi!");
    };
    window.addEventListener("promodo_pomodoro_complete", h);
    return () => window.removeEventListener("promodo_pomodoro_complete", h);
  }, []);

  const resetSleep = useCallback(() => {
    if (sleepRef.current) clearTimeout(sleepRef.current);
    sleepRef.current = setTimeout(() => setMode("sleeping"), SLEEP_AFTER);
  }, []);

  const react = useCallback((m: Mode, text: string) => {
    setMode(m);
    setReaction(text);
    if (reactRef.current) clearTimeout(reactRef.current);
    reactRef.current = setTimeout(() => { setReaction(null); setMode("idle"); }, 2500);
    resetSleep();
  }, [resetSleep]);

  const walkTo = useCallback((tx: number, ty: number, dur: number) => {
    setFacingLeft(tx < lastX.current);
    lastX.current = tx;
    setMode("walk");
    ctrl.start({ x: tx, y: ty, transition: { duration: dur, ease: "easeInOut" } })
      .then(() => setMode("idle"));
  }, [ctrl]);

  const walkRandom = useCallback(() => {
    if (dragging) return;
    const W = window.innerWidth  - 100;
    const H = window.innerHeight - 140;
    const tx = Math.max(10, Math.random() * W);
    const ty = Math.max(60, Math.random() * H);
    walkTo(tx, ty, 4 + Math.random() * 4);
  }, [dragging, walkTo]);

  useEffect(() => {
    if (!pet) return;
    resetSleep();
    walkRef.current = setInterval(() => {
      if (mode !== "sleeping") walkRandom();
    }, WALK_EVERY);
    return () => {
      if (walkRef.current)  clearInterval(walkRef.current);
      if (sleepRef.current) clearTimeout(sleepRef.current);
      if (reactRef.current) clearTimeout(reactRef.current);
    };
  }, [pet, mode, walkRandom, resetSleep]);

  if (!pet) return null;

  const isSleeping = mode === "sleeping";
  const isExcited  = mode === "excited";
  const isWalking  = mode === "walk";
  const emoji = isExcited ? pet.excited : isSleeping ? pet.sleep : pet.idle;
  const xpPct = ((xp % 200) / 200) * 100;

  return (
    <motion.div
      drag dragMomentum={false} dragElastic={0}
      animate={ctrl}
      onDragStart={() => {
        setDragging(true);
        if (isSleeping) react("excited", "😲 Ơi dậy rồi!");
        resetSleep();
      }}
      onDragEnd={e => {
        setDragging(false);
        resetSleep();
      }}
      className="select-none cursor-grab active:cursor-grabbing"
      style={{ x: mx, y: my, position: "fixed", zIndex: 90, touchAction: "none", width: 90 }}
    >
      {/* Reaction bubble */}
      <AnimatePresence>
        {reaction && (
          <motion.div
            key="reaction"
            initial={{ opacity: 0, y: 6, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.8 }}
            className="absolute -top-11 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 backdrop-blur border border-white/10 rounded-2xl px-3 py-1.5 text-white text-xs font-semibold shadow-xl pointer-events-none"
          >
            {reaction}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ZZZ when sleeping */}
      {isSleeping && (
        <motion.span
          animate={{ y: [-2, -14], opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut" }}
          className="absolute -top-8 right-0 text-sm pointer-events-none"
        >
          💤
        </motion.span>
      )}

      {/* Pet body */}
      <motion.div
        onClick={() => {
          if (isSleeping) react("excited", "😲 Dậy nào!");
          else react("excited", "😊 Xin chào!");
        }}
        className="relative flex flex-col items-center"
        animate={
          isSleeping ? { rotate: [0, -8, 0], scaleY: [1, 0.92, 1] } :
          isExcited  ? { y: [0, -18, 0, -10, 0], scale: [1, 1.2, 1, 1.12, 1] } :
          isWalking  ? { y: [0, -5, 0, -5, 0] } :
          { y: [0, -4, 0] }
        }
        transition={
          isSleeping ? { repeat: Infinity, duration: 3, ease: "easeInOut" } :
          isExcited  ? { duration: 0.7 } :
          isWalking  ? { repeat: Infinity, duration: 0.5, ease: "easeInOut" } :
          { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
        }
        style={{ scaleX: facingLeft && isWalking ? -1 : 1 }}
      >
        {/* Glow ring */}
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-60 pointer-events-none"
          style={{
            background: pet.glow,
            transform: "scale(1.5) translateY(20%)",
          }}
        />

        {/* Emoji pet */}
        <span
          className="relative z-10 drop-shadow-2xl"
          style={{ fontSize: pet.size, lineHeight: 1, filter: `drop-shadow(0 4px 12px ${pet.glow})` }}
        >
          {emoji}
        </span>

        {/* Shadow on ground */}
        <div
          className="w-10 h-2 rounded-full mt-0.5 opacity-30 blur-sm"
          style={{ background: pet.color }}
        />
      </motion.div>

      {/* Name + Level */}
      <div className="flex items-center justify-center gap-1 mt-1">
        <span className="text-white/60 text-[10px] font-medium drop-shadow">{pet.label}</span>
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
          style={{ background: `${pet.color}25`, color: pet.color }}
        >
          Lv.{level}
        </span>
      </div>

      {/* XP bar */}
      <div className="mx-3 mt-0.5 h-0.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          animate={{ width: `${xpPct}%` }}
          transition={{ duration: 0.8 }}
          style={{ background: `linear-gradient(to right, ${pet.color}60, ${pet.color})` }}
        />
      </div>
    </motion.div>
  );
}
