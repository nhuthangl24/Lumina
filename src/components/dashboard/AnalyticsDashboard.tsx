"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { BarChart3, CheckCircle2, Clock, CalendarDays, TrendingUp, Award, Zap } from "lucide-react";
import { motion } from "framer-motion";

export function AnalyticsDashboard({ onClose }: { onClose: () => void }) {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/user/profile").then(r => r.json()).then(setProfile).catch(console.error);
      fetch("/api/tasks").then(r => r.json()).then(setTasks).catch(console.error);
    }
  }, [session]);

  const completedTasks = tasks.filter(t => t.done).length;
  const totalTasks = tasks.length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const focusMinutes = profile?.totalPomodoros ? profile.totalPomodoros * 25 : 0;
  const focusHours = (focusMinutes / 60).toFixed(1);

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-black/20">
      {/* Header Cards */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:bg-white/10 transition-colors"
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-colors" />
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-white/60 text-xs font-bold uppercase tracking-wider">Tổng giờ học</h3>
          </div>
          <div className="relative z-10">
            <span className="text-4xl font-bold text-white tracking-tighter">{focusHours}</span>
            <span className="text-white/50 font-medium ml-1">giờ</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:bg-white/10 transition-colors"
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl group-hover:bg-emerald-500/30 transition-colors" />
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-white/60 text-xs font-bold uppercase tracking-wider">Nhiệm vụ</h3>
          </div>
          <div className="relative z-10 flex items-end gap-2">
            <span className="text-4xl font-bold text-white tracking-tighter">{completedTasks}</span>
            <span className="text-white/50 font-medium pb-1">hoàn thành</span>
          </div>
        </motion.div>
      </div>

      {/* Progress Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            Tỷ lệ hoàn thành nhiệm vụ
          </h3>
          <span className="text-xl font-bold text-indigo-400">{taskCompletionRate}%</span>
        </div>
        <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${taskCompletionRate}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full relative"
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </motion.div>
        </div>
        <p className="text-center text-xs text-white/40 mt-4">
          Bạn đã hoàn thành {completedTasks} trên tổng số {totalTasks} nhiệm vụ đã tạo.
        </p>
      </motion.div>

      {/* Streak and Level */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
              <Zap className="w-5 h-5 text-orange-400" />
            </div>
            <span className="text-xs font-bold text-orange-400 bg-orange-400/10 px-2 py-1 rounded-full uppercase">Streak</span>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-white">{profile?.streak || 0}</span>
            <span className="text-white/50 text-sm ml-1">ngày liên tiếp</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <Award className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="text-xs font-bold text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded-full uppercase">Cấp độ</span>
          </div>
          <div>
            <span className="text-white/50 text-sm mr-1">Lv.</span>
            <span className="text-3xl font-extrabold text-white">{profile?.level || 1}</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
