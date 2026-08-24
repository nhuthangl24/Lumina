"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Target, CheckCircle, Circle, Coins, Zap, X, ChevronRight, Gift } from "lucide-react";

interface Mission {
  id: string;
  missionName: string;
  description: string;
  type: string;
  target: number;
  progress: number;
  completed: boolean;
  coinReward: number;
  xpReward: number;
  gemReward: number;
  claimedAt: string | null;
}

export function DailyMissionsWidget() {
  const { data: session } = useSession();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchMissions = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const res = await fetch("/api/missions/daily");
      if (res.ok) {
        const data = await res.json();
        setMissions(data);
      }
    } catch {}
    setLoading(false);
  }, [session]);

  useEffect(() => {
    fetchMissions();

    const handlePomodoroComplete = async () => {
      if (!session) return;
      const res = await fetch("/api/missions/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "complete_pomodoro", amount: 1 }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.rewards?.completed?.length > 0) {
          data.rewards.completed.forEach((name: string) => {
            toast.success(`🎯 Nhiệm vụ hoàn thành: ${name}`, {
              description: `+${data.rewards.coins} Xu · +${data.rewards.xp} XP`,
              duration: 4000,
            });
          });
        }
        fetchMissions();
      }
    };

    window.addEventListener("promodo_pomodoro_complete", handlePomodoroComplete);
    return () => window.removeEventListener("promodo_pomodoro_complete", handlePomodoroComplete);
  }, [session, fetchMissions]);

  if (!session) return null;

  const completedCount = missions.filter(m => m.completed).length;
  const allDone = completedCount === missions.length && missions.length > 0;

  return (
    <div className="relative">
      {/* Trigger button */}
      <motion.button
        onClick={() => { setIsOpen(!isOpen); if (!isOpen) fetchMissions(); }}
        className="relative flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2 hover:bg-white/10 transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
      >
        <Target className="w-4 h-4 text-emerald-400" />
        <span className="text-white/80 text-xs font-medium">Nhiệm vụ</span>
        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${allDone ? "bg-emerald-400/20 text-emerald-400" : "bg-white/10 text-white/60"}`}>
          {completedCount}/{missions.length}
        </span>
        {!allDone && completedCount > 0 && (
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
        )}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 left-0 w-80 bg-[#0e0e0e]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-400/20 flex items-center justify-center">
                  <Target className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Nhiệm vụ hôm nay</h3>
                  <p className="text-white/40 text-[11px]">Reset lúc 00:00 mỗi ngày</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                <X className="w-3.5 h-3.5 text-white/50" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="px-4 pt-3 pb-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-white/50 text-[11px]">{completedCount}/{missions.length} hoàn thành</span>
                {allDone && (
                  <span className="text-emerald-400 text-[11px] font-bold flex items-center gap-1">
                    <Gift className="w-3 h-3" /> Hoàn thành toàn bộ!
                  </span>
                )}
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: missions.length > 0 ? `${(completedCount / missions.length) * 100}%` : "0%" }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Mission List */}
            <div className="p-3 space-y-2">
              {loading && missions.length === 0 ? (
                <div className="text-center py-6 text-white/30 text-sm">Đang tải...</div>
              ) : (
                missions.map(mission => {
                  const progress = Math.min(mission.progress / mission.target, 1);
                  return (
                    <motion.div
                      key={mission.id}
                      layout
                      className={`rounded-xl p-3 border transition-all ${
                        mission.completed
                          ? "bg-emerald-500/10 border-emerald-500/20"
                          : "bg-white/[0.03] border-white/5 hover:border-white/10"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex-shrink-0">
                          {mission.completed ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Circle className="w-4 h-4 text-white/20" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium leading-tight ${mission.completed ? "text-white/50 line-through" : "text-white"}`}>
                            {mission.missionName}
                          </p>
                          <p className="text-white/30 text-xs mt-0.5">{mission.description}</p>

                          {/* Progress bar */}
                          {!mission.completed && mission.target > 1 && (
                            <div className="mt-2">
                              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full bg-primary rounded-full"
                                  animate={{ width: `${progress * 100}%` }}
                                  transition={{ duration: 0.4 }}
                                />
                              </div>
                              <p className="text-white/30 text-[10px] mt-0.5">{mission.progress}/{mission.target}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          {mission.coinReward > 0 && (
                            <span className="text-yellow-400 text-[11px] font-bold flex items-center gap-0.5">
                              🪙 +{mission.coinReward}
                            </span>
                          )}
                          {mission.xpReward > 0 && (
                            <span className="text-purple-400 text-[11px] font-bold flex items-center gap-0.5">
                              <Zap className="w-2.5 h-2.5" /> +{mission.xpReward}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-3 border-t border-white/5 bg-white/[0.02]">
              <p className="text-white/30 text-[11px] text-center">
                Hoàn thành Pomodoro để tiến độ tự động cập nhật ✨
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
