"use client";

import { Suspense, useRef, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations, Environment, ContactShadows, PresentationControls } from "@react-three/drei";
import { motion, useMotionValue, useAnimation } from "framer-motion";
import * as THREE from "three";

// ─── Pet Config: ALL models served from /public/models ───────────────────────
// Fox has 3 anims: "Survey", "Walk", "Run"
// Robot has multiple: "Idle", "Walking", "Running", "Dance", etc.
// Parrot/Flamingo/Stork/Horse have morph-target animations (looping)
const PET_CONFIG: Record<string, {
  model: string;
  idleAnim: string;
  walkAnim?: string;
  excitedAnim?: string;
  sleepAnim?: string;
  scale: number;
  posY: number;
  rotY: number;
  label: string; emoji: string; color: string;
}> = {
  "pixel-cat": {
    model: "/models/fox.glb",
    idleAnim: "Survey", walkAnim: "Walk", excitedAnim: "Run",
    scale: 0.012, posY: -0.6, rotY: 0.3,
    label: "Mèo Pixel", emoji: "🐱", color: "#a78bfa",
  },
  "study-fox": {
    model: "/models/fox.glb",
    idleAnim: "Survey", walkAnim: "Walk", excitedAnim: "Run",
    scale: 0.012, posY: -0.6, rotY: 0,
    label: "Cáo Học", emoji: "🦊", color: "#fb923c",
  },
  "night-owl": {
    model: "/models/stork.glb",
    idleAnim: "ArmatureAction",
    scale: 0.011, posY: -0.5, rotY: 0.5,
    label: "Cú Đêm", emoji: "🦉", color: "#60a5fa",
  },
  "capybara-chill": {
    model: "/models/flamingo.glb",
    idleAnim: "ArmatureAction",
    scale: 0.011, posY: -0.6, rotY: 0.3,
    label: "Capybara", emoji: "🦫", color: "#34d399",
  },
  "cyber-dragon": {
    model: "/models/robot.glb",
    idleAnim: "Idle", walkAnim: "Walking", excitedAnim: "Dance",
    scale: 0.55, posY: -0.85, rotY: 0.3,
    label: "Rồng Cyber", emoji: "🐲", color: "#f472b6",
  },
  "pixel-ghost": {
    model: "/models/parrot.glb",
    idleAnim: "ArmatureAction",
    scale: 0.014, posY: -0.4, rotY: 0,
    label: "Bóng Ma", emoji: "👻", color: "#e2e8f0",
  },
};

// ─── Animated 3D Model (uses useAnimations hook properly) ─────────────────────
function Pet3DModel({ cfg, animMode }: {
  cfg: typeof PET_CONFIG[string];
  animMode: "idle" | "walk" | "excited" | "sleeping";
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(cfg.model);
  const { actions, mixer } = useAnimations(animations, groupRef);
  const bobT = useRef(0);

  // Switch animations based on mode
  useEffect(() => {
    if (!actions || !mixer) return;

    const animName =
      animMode === "excited" && cfg.excitedAnim ? cfg.excitedAnim :
      animMode === "walk"    && cfg.walkAnim    ? cfg.walkAnim    :
      cfg.idleAnim;

    // Fade out all, fade in target
    Object.values(actions).forEach(a => a?.fadeOut(0.3));
    const target = actions[animName];
    if (target) {
      target.reset().fadeIn(0.3).play();
      target.timeScale = animMode === "sleeping" ? 0.25 : 1;
    }
  }, [animMode, actions, mixer, cfg]);

  // Floating / breathing effect
  useFrame((_, delta) => {
    bobT.current += delta;
    if (!groupRef.current) return;
    if (animMode === "sleeping") {
      groupRef.current.position.y = cfg.posY + Math.sin(bobT.current * 0.8) * 0.025;
    } else if (animMode === "excited") {
      groupRef.current.position.y = cfg.posY + Math.abs(Math.sin(bobT.current * 7)) * 0.18;
    } else {
      groupRef.current.position.y = cfg.posY + Math.sin(bobT.current * 1.4) * 0.04;
    }
  });

  return (
    <group ref={groupRef} position={[0, cfg.posY, 0]} rotation={[0, cfg.rotY, 0]}>
      <primitive object={scene.clone(true)} scale={cfg.scale} />
    </group>
  );
}

// ─── Fallback ball ────────────────────────────────────────────────────────────
function FallbackBall({ color }: { color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.012;
      ref.current.position.y = Math.sin(Date.now() * 0.001) * 0.1;
    }
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.6, 32, 32]} />
      <meshStandardMaterial color={color} roughness={0.15} metalness={0.7} />
    </mesh>
  );
}

function PetCanvas({ cfg, animMode }: {
  cfg: typeof PET_CONFIG[string];
  animMode: "idle" | "walk" | "excited" | "sleeping";
}) {
  const [err, setErr] = useState(false);
  return (
    <Canvas
      camera={{ position: [0, 0.5, 3.2], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 8, 5]} intensity={1.4} castShadow />
      <pointLight position={[-4, 4, -4]} intensity={0.7} color={cfg.color} />

      <PresentationControls
        global
        polar={[-Math.PI / 5, Math.PI / 5]}
        azimuth={[-Math.PI, Math.PI]}
      >
        <Suspense fallback={<FallbackBall color={cfg.color} />}>
          {err
            ? <FallbackBall color={cfg.color} />
            : <Pet3DModel cfg={cfg} animMode={animMode} />
          }
        </Suspense>
      </PresentationControls>

      <ContactShadows
        position={[0, -1.1, 0]}
        opacity={0.45}
        scale={4}
        blur={2.5}
        far={2}
      />
      <Environment preset="city" />
    </Canvas>
  );
}

// ─── Main floating widget ─────────────────────────────────────────────────────
const SIZE = 170;
const WALK_EVERY = 6000;      // walk every 6s
const SLEEP_AFTER = 120_000;  // sleep after 2min idle

export function Pet3DWidget({ petId }: { petId: string | null }) {
  const cfg = petId ? (PET_CONFIG[petId] ?? PET_CONFIG["study-fox"]) : null;

  const motionX = useMotionValue(60);
  const motionY = useMotionValue(
    typeof window !== "undefined" ? window.innerHeight - 300 : 500
  );
  const animControls = useAnimation();

  const [animMode, setAnimMode] = useState<"idle" | "walk" | "excited" | "sleeping">("idle");
  const [reaction, setReaction] = useState<string | null>(null);
  const [petXp, setPetXp] = useState(0);
  const [petLevel, setPetLevel] = useState(1);
  const [dragging, setDragging] = useState(false);

  const sleepTimer = useRef<NodeJS.Timeout | null>(null);
  const walkTimer  = useRef<NodeJS.Timeout | null>(null);
  const reactTimer = useRef<NodeJS.Timeout | null>(null);

  // XP
  useEffect(() => {
    const xp = parseInt(localStorage.getItem("promodo_pet_xp") || "0", 10);
    setPetXp(xp); setPetLevel(Math.floor(xp / 200) + 1);
  }, []);

  useEffect(() => {
    const h = () => {
      const newXp = parseInt(localStorage.getItem("promodo_pet_xp") || "0", 10) + 30;
      localStorage.setItem("promodo_pet_xp", newXp.toString());
      setPetXp(newXp); setPetLevel(Math.floor(newXp / 200) + 1);
      react("excited", "🎉 Xong rồi!");
    };
    window.addEventListener("promodo_pomodoro_complete", h);
    return () => window.removeEventListener("promodo_pomodoro_complete", h);
  }, []);

  // Reset sleep timer
  const resetSleep = useCallback(() => {
    if (sleepTimer.current) clearTimeout(sleepTimer.current);
    sleepTimer.current = setTimeout(() => setAnimMode("sleeping"), SLEEP_AFTER);
  }, []);

  // Show reaction
  const react = useCallback((mode: "idle" | "walk" | "excited" | "sleeping", text: string) => {
    setAnimMode(mode);
    setReaction(text);
    if (reactTimer.current) clearTimeout(reactTimer.current);
    reactTimer.current = setTimeout(() => { setReaction(null); setAnimMode("idle"); }, 2500);
    resetSleep();
  }, [resetSleep]);

  // Auto-walk
  const walkRandom = useCallback(() => {
    if (dragging) return;
    const W = window.innerWidth - SIZE - 20;
    const H = window.innerHeight - SIZE - 60;
    const tx = Math.max(10, Math.random() * W);
    const ty = Math.max(60, Math.random() * H);
    const dur = 3 + Math.random() * 4;

    setAnimMode("walk");
    animControls.start({
      x: tx, y: ty,
      transition: { duration: dur, ease: "easeInOut" },
    }).then(() => setAnimMode("idle"));
  }, [dragging, animControls]);

  useEffect(() => {
    if (!cfg) return;
    resetSleep();
    walkTimer.current = setInterval(() => {
      if (animMode !== "sleeping") walkRandom();
    }, WALK_EVERY);
    return () => {
      if (walkTimer.current)  clearInterval(walkTimer.current);
      if (sleepTimer.current) clearTimeout(sleepTimer.current);
      if (reactTimer.current) clearTimeout(reactTimer.current);
    };
  }, [cfg, animMode, walkRandom, resetSleep]);

  if (!cfg) return null;

  const xpPct = ((petXp % 200) / 200) * 100;

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      style={{ x: motionX, y: motionY, position: "fixed", zIndex: 90, width: SIZE, touchAction: "none" }}
      animate={animControls}
      onDragStart={() => {
        setDragging(true);
        if (animMode === "sleeping") react("idle", "😲 Dậy rồi!");
        else setAnimMode("idle");
        resetSleep();
      }}
      onDragEnd={() => { setDragging(false); resetSleep(); }}
      className="select-none cursor-grab active:cursor-grabbing"
    >
      {/* Reaction bubble */}
      {reaction && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs font-semibold whitespace-nowrap shadow-xl pointer-events-none z-10"
        >
          {reaction}
        </motion.div>
      )}

      {/* Sleep ZZZ */}
      {animMode === "sleeping" && (
        <motion.span
          animate={{ y: [-2, -10], opacity: [0.9, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeOut" }}
          className="absolute -top-7 right-3 text-base pointer-events-none"
        >
          💤
        </motion.span>
      )}

      {/* 3D canvas — no background */}
      <div
        style={{ width: SIZE, height: SIZE }}
        onClick={() => {
          if (animMode === "sleeping") react("idle", "😲 Dậy nào!");
          else react("excited", "😊 Xin chào!");
        }}
      >
        <PetCanvas cfg={cfg} animMode={animMode} />
      </div>

      {/* Name + level */}
      <div className="flex items-center justify-center gap-1.5 -mt-1">
        <span className="text-white/60 text-[11px] drop-shadow font-medium">{cfg.emoji} {cfg.label}</span>
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
          style={{ background: `${cfg.color}30`, color: cfg.color }}
        >
          Lv.{petLevel}
        </span>
      </div>

      {/* XP bar */}
      <div className="mx-4 mt-1 h-0.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${xpPct}%`, background: `linear-gradient(to right, ${cfg.color}80, ${cfg.color})` }}
        />
      </div>
    </motion.div>
  );
}
