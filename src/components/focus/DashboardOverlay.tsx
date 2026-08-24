import { useSession } from "next-auth/react";
import Image from "next/image";
import { ArrowLeft, CheckCircle2, Coins, Flame, Settings, Trophy, User, X, Timer } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { NotificationBell } from "../notifications/NotificationBell";
import { useLanguage } from "@/lib/LanguageContext";

export function DashboardOverlay({ onClose }: { onClose: () => void }) {
  const { data: session, update: updateSession } = useSession();
  const { t } = useLanguage();
  
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/user/profile")
        .then(res => res.json())
        .then(data => setProfile(data))
        .catch(console.error);
    }
  }, [session]);

  useEffect(() => {
    // Fetch completed tasks count for stats
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/tasks");
        if (res.ok) {
          const tasks = await res.json();
          setCompletedTasksCount(tasks.filter((t: any) => t.done).length);
        }
      } catch (error) {
        console.error("Failed to fetch stats", error);
      }
    };
    
    if (session) {
      fetchStats();
    }
  }, [session]);

  const user = session?.user as any;
  const level = profile?.level || 1;
  const xp = profile?.xp || 0;
  const streak = profile?.streak || 0;

  const xpInCurrentLevel = xp % 500;
  const xpProgressPct = (xpInCurrentLevel / 500) * 100;

  let tierName = "Bronze Member";
  let tierColor = "text-indigo-400";
  let tierBg = "bg-indigo-500/20 border-indigo-500/30";
  let tierGradient = "from-indigo-500/10 to-purple-500/10 border-indigo-500/20";
  let barColor = "bg-indigo-500";
  let nextTierName = "Silver";
  
  if (level >= 50) { tierName = "Master Member"; tierColor = "text-red-500"; tierBg = "bg-red-500/20 border-red-500/30"; tierGradient = "from-red-500/10 to-orange-500/10 border-red-500/20"; barColor = "bg-red-500"; nextTierName = "Max Tier"; }
  else if (level >= 40) { tierName = "Diamond Member"; tierColor = "text-cyan-400"; tierBg = "bg-cyan-500/20 border-cyan-500/30"; tierGradient = "from-cyan-500/10 to-blue-500/10 border-cyan-500/20"; barColor = "bg-cyan-500"; nextTierName = "Master"; }
  else if (level >= 30) { tierName = "Platinum Member"; tierColor = "text-emerald-400"; tierBg = "bg-emerald-500/20 border-emerald-500/30"; tierGradient = "from-emerald-500/10 to-teal-500/10 border-emerald-500/20"; barColor = "bg-emerald-500"; nextTierName = "Diamond"; }
  else if (level >= 20) { tierName = "Gold Member"; tierColor = "text-yellow-400"; tierBg = "bg-yellow-500/20 border-yellow-500/30"; tierGradient = "from-yellow-500/10 to-orange-500/10 border-yellow-500/20"; barColor = "bg-yellow-500"; nextTierName = "Platinum"; }
  else if (level >= 10) { tierName = "Silver Member"; tierColor = "text-slate-300"; tierBg = "bg-slate-500/20 border-slate-500/30"; tierGradient = "from-slate-500/10 to-gray-500/10 border-slate-500/20"; barColor = "bg-slate-400"; nextTierName = "Gold"; }

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", password: "" });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.name) setEditForm(prev => ({ ...prev, name: user.name }));
  }, [user]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        await updateSession({ name: editForm.name });
        toast.success("Cập nhật thành công!");
        setIsEditing(false);
      } else {
        toast.error("Lỗi khi cập nhật.");
      }
    } catch (e) {
      toast.error("Lỗi khi cập nhật.");
    }
    setIsSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        await fetch("/api/user/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: data.url })
        });
        await updateSession({ image: data.url });
        toast.success("Đã cập nhật Avatar!");
      }
    } catch (err) {
      toast.error("Lỗi khi upload avatar.");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xl p-6 pointer-events-auto"
    >
      <div className="w-full max-w-5xl h-auto max-h-[90vh] bg-white/5 border border-white/10 rounded-3xl shadow-2xl overflow-y-auto custom-scrollbar relative flex flex-col">
        {/* Header Navigation */}
        <div className="sticky top-0 z-20 bg-black/40 backdrop-blur-xl border-b border-white/10 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onClose}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
            >
              <ArrowLeft className="w-5 h-5 text-white/70" />
            </button>
            <h2 className="text-2xl font-heading font-bold text-white">Your Profile</h2>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="font-bold text-yellow-400">{user?.coins?.toLocaleString() || '0'}</span>
            </div>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Profile Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1 space-y-6"
          >
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/20 to-transparent" />
              
              <div className="relative w-28 h-28 rounded-full border-4 border-black shadow-xl overflow-hidden mb-6 z-10 bg-zinc-800 group">
                {user?.image ? (
                  <Image sizes="(max-width: 768px) 100vw, 33vw" src={user.image} fill alt="Profile" className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold bg-primary text-white uppercase">
                    {user?.name?.[0] || user?.email?.[0]}
                  </div>
                )}
                {isEditing && (
                  <label className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-bold">Đổi ảnh</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                  </label>
                )}
              </div>
              
              {!isEditing ? (
                <>
                  <h2 className="text-2xl font-bold text-white mb-1 relative z-10">{user?.name || 'Focused Ninja'}</h2>
                  <p className="text-white/50 text-sm mb-6 relative z-10">{user?.email}</p>
                </>
              ) : (
                <div className="w-full flex flex-col gap-2 mb-4 relative z-10">
                  <input 
                    type="text" 
                    value={editForm.name} 
                    onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Tên mới"
                    className="w-full bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                  />
                  <input 
                    type="password" 
                    value={editForm.password} 
                    onChange={e => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Mật khẩu mới (bỏ trống nếu không đổi)"
                    className="w-full bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
              )}
              
              <div className={`w-full grid ${isEditing ? 'grid-cols-2' : 'grid-cols-1'} gap-3 mt-4 relative z-10`}>
                {!isEditing ? (
                  <>
                    <button onClick={() => setIsEditing(true)} className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                      <User className="w-4 h-4" />
                      Chỉnh sửa hồ sơ
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={handleSaveProfile} disabled={isSaving} className="w-full bg-primary hover:bg-primary/80 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center">
                      {isSaving ? "Đang lưu..." : "Lưu"}
                    </button>
                    <button onClick={() => setIsEditing(false)} className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center">
                      Hủy
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {/* Rank / Tier Card */}
            <div className={`bg-gradient-to-br ${tierGradient} backdrop-blur-2xl border rounded-3xl p-6 shadow-2xl relative overflow-hidden`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className={`${tierColor} font-semibold text-sm uppercase tracking-wider mb-1`}>Current Tier</h3>
                  <p className="text-2xl font-bold text-white">{tierName}</p>
                </div>
                <div className={`w-12 h-12 rounded-full ${tierBg} flex items-center justify-center border`}>
                  <Trophy className={`w-6 h-6 ${tierColor}`} />
                </div>
              </div>
              <div className="w-full bg-black/40 rounded-full h-2 mb-2 relative overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(2, xpProgressPct)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`${barColor} h-2 rounded-full`} 
                />
              </div>
              <p className="text-xs text-white/50 text-right">{level < 50 ? `${Math.round(xpProgressPct)}% to ${nextTierName}` : "Max Level Reached"}</p>
            </div>
          </motion.div>

          {/* Right Column: Statistics & Activity */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            <h2 className="text-3xl font-heading font-bold text-white mb-6">Your Analytics</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Stat Box 1 */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 mb-4">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <p className="text-white/50 text-sm font-medium mb-1">Total Pomodoros</p>
                <h3 className="text-4xl font-bold text-white">{profile?.totalPomodoros || 0}</h3>
              </div>
              
              {/* Stat Box 2 */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30 mb-4">
                  <Flame className="w-6 h-6 text-orange-400" />
                </div>
                <p className="text-white/50 text-sm font-medium mb-1">Current Streak</p>
                <div className="flex items-end gap-2">
                  <h3 className="text-4xl font-bold text-white">{streak}</h3>
                  <span className="text-white/50 pb-1">days</span>
                </div>
              </div>
            </div>

            {/* Recent Activity Panel */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mt-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                Recent Activity
              </h3>
              
              {profile?.totalPomodoros > 0 || completedTasksCount > 0 ? (
                <div className="space-y-4">
                  {profile?.totalPomodoros > 0 && (
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/20 border border-white/5">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                        <Timer className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Hoàn thành Pomodoro</p>
                        <p className="text-white/40 text-xs">Bạn đã tập trung được {profile.totalPomodoros} phiên</p>
                      </div>
                    </div>
                  )}
                  {completedTasksCount > 0 && (
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/20 border border-white/5">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Hoàn thành nhiệm vụ</p>
                        <p className="text-white/40 text-xs">Bạn đã hoàn thành {completedTasksCount} nhiệm vụ</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                    <CheckCircle2 className="w-8 h-8 text-white/20" />
                  </div>
                  <p className="text-white/60 font-medium">No activity yet</p>
                  <p className="text-white/40 text-sm mt-1">Start a focus session to earn coins!</p>
                  <button 
                    onClick={onClose}
                    className="mt-6 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold text-sm transition-colors"
                  >
                    Focus Now
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
