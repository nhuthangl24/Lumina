import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Zap, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/lib/LanguageContext";

export function StatsLevelWidget() {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(true);
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/user/profile")
        .then(res => res.json())
        .then(data => setProfile(data))
        .catch(() => {});
    }
  }, [session?.user?.email]);

  useEffect(() => {
    const handlePomodoroComplete = () => {
      // Re-fetch profile when pomodoro completes to update XP/Level
      if (session?.user) {
        fetch("/api/user/profile")
          .then(res => res.json())
          .then(data => setProfile(data))
          .catch(() => {});
      }
    };
    window.addEventListener("promodo_pomodoro_complete", handlePomodoroComplete);
    return () => window.removeEventListener("promodo_pomodoro_complete", handlePomodoroComplete);
  }, [session?.user?.email]);

  if (!isVisible || !profile) return null;

  const level = profile.level || 1;
  const xp = profile.xp || 0;
  const coins = profile.coins || 0;
  
  const xpInCurrentLevel = xp % 500;
  const xpProgressPct = (xpInCurrentLevel / 500) * 100;

  let tierName = t("bronzeTier");
  let tierColor = "text-indigo-400";
  let tierBg = "bg-indigo-500/20 border-indigo-500/30";
  
  if (level >= 50) { tierName = t("masterTier"); tierColor = "text-red-500"; tierBg = "bg-red-500/20 border-red-500/30"; }
  else if (level >= 40) { tierName = t("diamondTier"); tierColor = "text-cyan-400"; tierBg = "bg-cyan-500/20 border-cyan-500/30"; }
  else if (level >= 30) { tierName = t("platinumTier"); tierColor = "text-emerald-400"; tierBg = "bg-emerald-500/20 border-emerald-500/30"; }
  else if (level >= 20) { tierName = t("goldTier"); tierColor = "text-yellow-400"; tierBg = "bg-yellow-500/20 border-yellow-500/30"; }
  else if (level >= 10) { tierName = t("silverTier"); tierColor = "text-slate-300"; tierBg = "bg-slate-500/20 border-slate-500/30"; }

  return (
    <motion.div 
      className="pointer-events-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 w-full shadow-xl relative group"
    >
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute top-3 right-4 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
      >
        <X className="w-3 h-3 text-white/70" />
      </button>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full ${tierBg} flex items-center justify-center border`}>
            <Trophy className={`w-4 h-4 ${tierColor}`} />
          </div>
          <div>
            <p className="text-white text-sm font-bold">{tierName}</p>
            <p className="text-white/50 text-xs">{t("level")} {level}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
          <Zap className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-white font-bold text-sm">{coins.toLocaleString()}</span>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs font-medium">
          <span className="text-white/60">{t("xpProgress")}</span>
          <span className="text-indigo-400">{xpInCurrentLevel} / 500</span>
        </div>
        <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden relative">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(2, xpProgressPct)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${level >= 20 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`} 
          />
        </div>
      </div>
    </motion.div>
  );
}
