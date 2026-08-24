"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Zap, Coins } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface RewardPopup {
  id: number;
  coins: number;
  xp: number;
  leveledUp?: boolean;
}

// Floating +Coins +XP popup after each Pomodoro
export function RewardToastSystem() {
  const [popups, setPopups] = useState<RewardPopup[]>([]);
  const { data: session, update: updateSession } = useSession();

  useEffect(() => {
    const handleReward = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const id = Date.now() + Math.random();
      setPopups(prev => [...prev, { id, coins: detail.coins ?? 0, xp: detail.xp ?? 0, leveledUp: detail.leveledUp }]);

      // Remove after animation
      setTimeout(() => setPopups(prev => prev.filter(p => p.id !== id)), 3000);

      // Level up toast
      if (detail.leveledUp) {
        setTimeout(() => toast.success("🎉 Lên cấp!", { description: "Chúc mừng bạn đạt level mới!" }), 200);
      }

      // Refresh session to update coin display
      updateSession();
    };

    window.addEventListener("promodo_reward_earned", handleReward);
    return () => window.removeEventListener("promodo_reward_earned", handleReward);
  }, [updateSession]);

  return (
    <div className="fixed left-1/2 top-24 -translate-x-1/2 z-[150] pointer-events-none flex flex-col items-center gap-2">
      <AnimatePresence>
        {popups.map(popup => (
          <motion.div
            key={popup.id}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-3 flex items-center gap-4 shadow-2xl"
          >
            <div className="flex items-center gap-1.5 text-yellow-400 font-bold">
              <span className="text-lg">🪙</span>
              <span>+{popup.coins}</span>
            </div>
            <div className="w-px h-5 bg-white/10" />
            <div className="flex items-center gap-1.5 text-purple-400 font-bold">
              <Zap className="w-4 h-4" />
              <span>+{popup.xp} XP</span>
            </div>
            {popup.leveledUp && (
              <>
                <div className="w-px h-5 bg-white/10" />
                <span className="text-emerald-400 font-bold text-sm">⬆️ Level Up!</span>
              </>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Streak display widget
export function StreakWidget() {
  const { data: session } = useSession();
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (session) {
      const s = (session.user as any)?.streak ?? 0;
      setStreak(s);
    }
  }, [session]);

  useEffect(() => {
    // Also check login streak
    const checkStreak = async () => {
      if (!session) return;
      try {
        const res = await fetch("/api/rewards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "login" }),
        });
        if (res.ok) {
          const data = await res.json();
          // Update streak from server (handled server-side)
        }
      } catch {}
    };

    // Only call login reward once per session
    const lastLogin = localStorage.getItem("promodo_last_login_reward");
    const today = new Date().toISOString().split("T")[0];
    if (lastLogin !== today) {
      localStorage.setItem("promodo_last_login_reward", today);
      checkStreak();
    }
  }, [session]);

  if (!session || streak === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 rounded-xl px-3 py-1.5"
    >
      <Flame className="w-4 h-4 text-orange-400" />
      <span className="text-orange-400 font-bold text-sm">{streak}</span>
      <span className="text-orange-400/60 text-xs">ngày</span>
    </motion.div>
  );
}
