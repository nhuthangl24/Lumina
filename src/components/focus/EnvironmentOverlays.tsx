"use client";

import { useEffect, useRef } from "react";

// ─── Weather Overlays ─────────────────────────────────────────────────────────
function Rain({ heavy = false }: { heavy?: boolean }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[5]">
      {Array.from({ length: heavy ? 80 : 40 }).map((_, i) => (
        <div
          key={i}
          className="absolute top-0 w-px rounded-full opacity-60"
          style={{
            left: `${Math.random() * 100}%`,
            height: `${12 + Math.random() * 20}px`,
            background: "linear-gradient(to bottom, transparent, rgba(174,214,241,0.8))",
            animationName: "rain-fall",
            animationDuration: `${0.5 + Math.random() * 0.6}s`,
            animationDelay: `${Math.random() * 2}s`,
            animationIterationCount: "infinite",
            animationTimingFunction: "linear",
          }}
        />
      ))}
      {/* Puddle shimmer at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-8 opacity-20"
        style={{ background: "linear-gradient(to top, rgba(174,214,241,0.3), transparent)" }} />
    </div>
  );
}

function Snow() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[5]">
      {Array.from({ length: 60 }).map((_, i) => (
        <div
          key={i}
          className="absolute top-0 rounded-full bg-white"
          style={{
            left: `${Math.random() * 100}%`,
            width: `${3 + Math.random() * 5}px`,
            height: `${3 + Math.random() * 5}px`,
            opacity: 0.5 + Math.random() * 0.4,
            animationName: "snow-fall",
            animationDuration: `${3 + Math.random() * 5}s`,
            animationDelay: `${Math.random() * 5}s`,
            animationIterationCount: "infinite",
            animationTimingFunction: "linear",
          }}
        />
      ))}
    </div>
  );
}

function CherryBlossom() {
  const petals = ["🌸", "🌺", "🌼"];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[5]">
      {Array.from({ length: 25 }).map((_, i) => (
        <div
          key={i}
          className="absolute top-0"
          style={{
            left: `${Math.random() * 100}%`,
            fontSize: `${14 + Math.random() * 14}px`,
            animationName: "petal-fall",
            animationDuration: `${5 + Math.random() * 7}s`,
            animationDelay: `${Math.random() * 8}s`,
            animationIterationCount: "infinite",
            animationTimingFunction: "ease-in-out",
          }}
        >
          {petals[Math.floor(Math.random() * petals.length)]}
        </div>
      ))}
    </div>
  );
}

function AutumnLeaves() {
  const leaves = ["🍁", "🍂", "🍃"];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[5]">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute top-0"
          style={{
            left: `${Math.random() * 100}%`,
            fontSize: `${16 + Math.random() * 16}px`,
            animationName: "petal-fall",
            animationDuration: `${6 + Math.random() * 8}s`,
            animationDelay: `${Math.random() * 8}s`,
            animationIterationCount: "infinite",
            animationTimingFunction: "ease-in-out",
          }}
        >
          {leaves[Math.floor(Math.random() * leaves.length)]}
        </div>
      ))}
    </div>
  );
}

function Fireflies() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[5]">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${20 + Math.random() * 70}%`,
            width: "6px", height: "6px",
            background: "rgba(160,255,120,0.9)",
            boxShadow: "0 0 8px 4px rgba(160,255,120,0.5)",
            animationName: "firefly-glow",
            animationDuration: `${2 + Math.random() * 3}s`,
            animationDelay: `${Math.random() * 4}s`,
            animationIterationCount: "infinite",
            animationTimingFunction: "ease-in-out",
          }}
        />
      ))}
    </div>
  );
}

function NorthernLights() {
  return (
    <div className="absolute inset-0 pointer-events-none z-[5] overflow-hidden">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="absolute inset-x-0 top-0"
          style={{
            height: "60%",
            background: `linear-gradient(180deg,
              ${i === 0 ? "rgba(0,255,180,0.15)" : i === 1 ? "rgba(100,0,255,0.12)" : "rgba(0,200,255,0.10)"}
              0%, transparent 100%)`,
            transform: `skewY(${-2 + i * 2}deg) translateY(${i * 15}%)`,
            animationName: "aurora-wave",
            animationDuration: `${6 + i * 2}s`,
            animationDelay: `${i * 1.5}s`,
            animationIterationCount: "infinite",
            animationTimingFunction: "ease-in-out",
          }}
        />
      ))}
    </div>
  );
}

function Thunderstorm() {
  const flashRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const flash = () => {
      if (!flashRef.current) return;
      flashRef.current.style.opacity = "0.6";
      setTimeout(() => { if (flashRef.current) flashRef.current.style.opacity = "0"; }, 80);
      setTimeout(() => {
        if (!flashRef.current) return;
        flashRef.current.style.opacity = "0.3";
        setTimeout(() => { if (flashRef.current) flashRef.current.style.opacity = "0"; }, 60);
      }, 120);
    };
    const id = setInterval(flash, 4000 + Math.random() * 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[5]">
      <Rain heavy />
      {/* Lightning flash */}
      <div ref={flashRef} className="absolute inset-0 bg-white transition-opacity duration-75" style={{ opacity: 0 }} />
    </div>
  );
}

// ─── Lighting Overlays ────────────────────────────────────────────────────────
const LIGHTING_STYLES: Record<string, React.CSSProperties> = {
  "cozy-warm":      { background: "rgba(255,160,50,0.12)", mixBlendMode: "multiply" },
  "golden-hour":    { background: "rgba(255,200,50,0.18)", mixBlendMode: "overlay" },
  "moonlight-blue": { background: "rgba(30,60,180,0.18)", mixBlendMode: "multiply" },
  "neon-purple":    { background: "rgba(140,0,255,0.15)", mixBlendMode: "screen" },
  "rgb-cycle":      { animationName: "rgb-cycle", animationDuration: "6s", animationIterationCount: "infinite" },
};

// ─── Effect Overlays ──────────────────────────────────────────────────────────
function MagicSparkles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[6]">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute text-lg"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationName: "sparkle-pop",
            animationDuration: `${1.5 + Math.random() * 2}s`,
            animationDelay: `${Math.random() * 4}s`,
            animationIterationCount: "infinite",
          }}
        >✨</div>
      ))}
    </div>
  );
}

function ConfettiBurst() {
  const colors = ["#f472b6","#60a5fa","#34d399","#fbbf24","#a78bfa"];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[6]">
      {Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-sm"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-${Math.random() * 20}%`,
            background: colors[Math.floor(Math.random() * colors.length)],
            animationName: "confetti-drop",
            animationDuration: `${3 + Math.random() * 4}s`,
            animationDelay: `${Math.random() * 5}s`,
            animationIterationCount: "infinite",
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  );
}

function CyberMatrix() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[5] font-mono">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute top-0 text-green-400 text-xs opacity-30"
          style={{
            left: `${i * 5}%`,
            animationName: "matrix-fall",
            animationDuration: `${3 + Math.random() * 4}s`,
            animationDelay: `${Math.random() * 3}s`,
            animationIterationCount: "infinite",
            animationTimingFunction: "linear",
            whiteSpace: "nowrap",
          }}
        >
          {Array.from({ length: 20 }).map(() => String.fromCharCode(33 + Math.random() * 93)).join("")}
        </div>
      ))}
    </div>
  );
}

// ─── Cursor System ────────────────────────────────────────────────────────────
const CURSOR_CSS: Record<string, string> = {
  "pixel-cursor":        "crosshair",
  "magic-wand":          "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\"><text y=\"28\" font-size=\"28\">🪄</text></svg>') 0 28, pointer",
  "crystal-glass-cursor":"url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\"><text y=\"28\" font-size=\"28\">💎</text></svg>') 16 16, pointer",
};

// ─── Main Overlay Manager ─────────────────────────────────────────────────────
interface EquippedItems {
  weather?: string;
  lighting?: string;
  effect?: string;
  cursor?: string;
}

export function EnvironmentOverlays({ equipped }: { equipped: EquippedItems }) {
  // Apply cursor
  useEffect(() => {
    const cur = equipped.cursor ? (CURSOR_CSS[equipped.cursor] ?? "auto") : "auto";
    document.body.style.cursor = cur;
    return () => { document.body.style.cursor = "auto"; };
  }, [equipped.cursor]);

  const lightingStyle = equipped.lighting ? LIGHTING_STYLES[equipped.lighting] : null;

  return (
    <>
      {/* Weather */}
      {equipped.weather === "rainy-day"      && <Rain />}
      {equipped.weather === "thunderstorm"   && <Thunderstorm />}
      {equipped.weather === "snowfall"       && <Snow />}
      {equipped.weather === "cherry-blossom" && <CherryBlossom />}
      {equipped.weather === "autumn-leaves"  && <AutumnLeaves />}
      {equipped.weather === "fireflies"      && <Fireflies />}
      {equipped.weather === "northern-lights"&& <NorthernLights />}

      {/* Lighting overlay */}
      {lightingStyle && (
        <div
          className="absolute inset-0 pointer-events-none z-[4]"
          style={lightingStyle}
        />
      )}

      {/* Effects */}
      {equipped.effect === "magic-sparkles"  && <MagicSparkles />}
      {equipped.effect === "confetti-burst"  && <ConfettiBurst />}
      {equipped.effect === "cyber-matrix"    && <CyberMatrix />}
      {equipped.effect === "fireflies"       && <Fireflies />}
    </>
  );
}
