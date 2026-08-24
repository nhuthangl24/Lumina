"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X, Star } from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

const RARITY_STYLES = {
  common:    { gradient: "from-gray-500 to-gray-700",  glow: "",                        label: "Common"    },
  rare:      { gradient: "from-blue-500 to-blue-700",   glow: "shadow-blue-500/40",     label: "Rare"      },
  epic:      { gradient: "from-purple-500 to-purple-800", glow: "shadow-purple-500/50", label: "Epic"      },
  legendary: { gradient: "from-yellow-400 to-orange-600", glow: "shadow-yellow-500/60", label: "Legendary" },
};

// Achievement popup shown after earning one
export function AchievementPopup({ achievement, onClose }: { achievement: Achievement; onClose: () => void }) {
  const style = RARITY_STYLES[achievement.rarity];

  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`fixed bottom-24 right-6 z-[200] bg-[#0e0e0e]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl ${style.glow} shadow-lg w-72`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${style.gradient} flex items-center justify-center text-2xl flex-shrink-0 shadow-lg`}>
          {achievement.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-yellow-400 text-[11px] font-bold uppercase tracking-wide">Achievement</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 ${
              achievement.rarity === "legendary" ? "text-yellow-400" :
              achievement.rarity === "epic" ? "text-purple-400" :
              achievement.rarity === "rare" ? "text-blue-400" : "text-gray-400"
            }`}>{style.label}</span>
          </div>
          <p className="text-white font-semibold text-sm leading-tight">{achievement.name}</p>
          <p className="text-white/50 text-xs mt-0.5">{achievement.description}</p>
        </div>
        <button onClick={onClose} className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors flex-shrink-0">
          <X className="w-3 h-3 text-white/50" />
        </button>
      </div>
      {/* Animated progress bar */}
      <div className="mt-3 w-full h-0.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${style.gradient} rounded-full`}
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: 5, ease: "linear" }}
        />
      </div>
    </motion.div>
  );
}

// Achievement checker - call this after key events
const ACHIEVEMENTS: Achievement[] = [
  { id: "first_pomodoro",     name: "Bước đầu tiên",        description: "Hoàn thành Pomodoro đầu tiên",      icon: "🌱", rarity: "common"    },
  { id: "pomodoros_10",       name: "Đang vào guồng",        description: "Hoàn thành 10 Pomodoro",            icon: "🔥", rarity: "common"    },
  { id: "pomodoros_50",       name: "Focus Adept",           description: "Hoàn thành 50 Pomodoro",            icon: "⚡", rarity: "rare"      },
  { id: "pomodoros_100",      name: "Focus Master",          description: "Hoàn thành 100 Pomodoro",           icon: "🏆", rarity: "epic"      },
  { id: "pomodoros_500",      name: "Focus Legend",          description: "Hoàn thành 500 Pomodoro",           icon: "👑", rarity: "legendary" },
  { id: "streak_3",           name: "Consistency Starter",   description: "Duy trì streak 3 ngày liên tiếp",   icon: "🗓️", rarity: "common"    },
  { id: "streak_7",           name: "Week Warrior",          description: "Duy trì streak 7 ngày liên tiếp",   icon: "🎖️", rarity: "rare"      },
  { id: "streak_30",          name: "Iron Discipline",       description: "Duy trì streak 30 ngày liên tiếp",  icon: "🛡️", rarity: "legendary" },
  { id: "level_5",            name: "Người học chăm chỉ",   description: "Đạt Level 5",                       icon: "🌟", rarity: "common"    },
  { id: "level_10",           name: "Lumina Veteran",        description: "Đạt Level 10",                      icon: "💎", rarity: "rare"      },
  { id: "marketplace_first",  name: "Người mua hàng đầu",   description: "Mua vật phẩm đầu tiên trong shop",  icon: "🛍️", rarity: "common"    },
];

export function useAchievements() {
  const [pendingAchievements, setPendingAchievements] = useState<Achievement[]>([]);

  const checkAchievements = (stats: { totalPomodoros: number; streak: number; level: number; firstPurchase?: boolean }) => {
    const earned = new Set<string>(JSON.parse(localStorage.getItem("promodo_achievements") || "[]"));
    const newOnes: Achievement[] = [];

    const checks = [
      { id: "first_pomodoro",    cond: stats.totalPomodoros >= 1    },
      { id: "pomodoros_10",      cond: stats.totalPomodoros >= 10   },
      { id: "pomodoros_50",      cond: stats.totalPomodoros >= 50   },
      { id: "pomodoros_100",     cond: stats.totalPomodoros >= 100  },
      { id: "pomodoros_500",     cond: stats.totalPomodoros >= 500  },
      { id: "streak_3",          cond: stats.streak >= 3            },
      { id: "streak_7",          cond: stats.streak >= 7            },
      { id: "streak_30",         cond: stats.streak >= 30           },
      { id: "level_5",           cond: stats.level >= 5             },
      { id: "level_10",          cond: stats.level >= 10            },
      { id: "marketplace_first", cond: stats.firstPurchase === true },
    ];

    for (const check of checks) {
      if (check.cond && !earned.has(check.id)) {
        earned.add(check.id);
        const a = ACHIEVEMENTS.find(x => x.id === check.id);
        if (a) newOnes.push(a);
      }
    }

    if (newOnes.length > 0) {
      localStorage.setItem("promodo_achievements", JSON.stringify([...earned]));
      setPendingAchievements(prev => [...prev, ...newOnes]);
    }
  };

  const dismissAchievement = (id: string) => {
    setPendingAchievements(prev => prev.filter(a => a.id !== id));
  };

  return { pendingAchievements, checkAchievements, dismissAchievement };
}

// Renderer component - place at root level
export function AchievementRenderer() {
  const { pendingAchievements, dismissAchievement } = useAchievements();

  // Listen for global achievement events
  useEffect(() => {
    const handleCheck = (e: CustomEvent) => {
      // handled via useAchievements hook in parent
    };
  }, []);

  return (
    <AnimatePresence>
      {pendingAchievements.slice(0, 1).map(a => (
        <AchievementPopup key={a.id} achievement={a} onClose={() => dismissAchievement(a.id)} />
      ))}
    </AnimatePresence>
  );
}
