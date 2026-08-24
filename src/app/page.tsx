"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { BottomDock } from "@/components/focus/BottomDock";
import { FloatingTimer } from "@/components/focus/FloatingTimer";
import { GuidedTour } from "@/components/focus/GuidedTour";
import { translations, Language } from "@/lib/i18n";
import { X, Plus, Check, Coins, Info, Settings2, Sparkles, Volume2, Store, Globe, Clock, Headphones, Users, User, Play, SkipForward, SkipBack, Cloud } from "lucide-react";
import { MarketplaceModal } from "@/components/marketplace/MarketplaceModal";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { FriendsPanel } from "@/components/friends/FriendsPanel";
import { VirtualRoomWidget } from "@/components/room/VirtualRoomWidget";
import { MusicPlayerWidget } from "@/components/focus/MusicPlayerWidget";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { toast } from "sonner";
import { DashboardOverlay } from "@/components/focus/DashboardOverlay";
import { AnalyticsDashboard } from "@/components/dashboard/AnalyticsDashboard";
import { LayoutDashboard } from "lucide-react";
import { ClockWeatherWidget } from "@/components/focus/ClockWeatherWidget";
import { StatsLevelWidget } from "@/components/focus/StatsLevelWidget";
import { AmbientMixerWidget } from "@/components/focus/AmbientMixerWidget";
import { MiniTaskWidget } from "@/components/focus/MiniTaskWidget";
import { PetWidget } from "@/components/focus/PetWidget";
import { EnvironmentOverlays } from "@/components/focus/EnvironmentOverlays";
import { DailyMissionsWidget } from "@/components/focus/DailyMissionsWidget";
import { RewardToastSystem, StreakWidget } from "@/components/focus/RewardSystem";
import { AchievementPopup, useAchievements } from "@/components/focus/AchievementsSystem";
import { GlobalAudioPlayers } from "@/components/focus/GlobalAudioPlayers";
import { useAmbientStore } from "@/store/useAmbientStore";

export default function ImmersiveFocusPage() {
  const { data: session } = useSession();
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<"marketplace" | "settings" | "dashboard" | null>(null);
  const [showFriends, setShowFriends] = useState(false);

  const [lang, setLang] = useState<"en" | "vi" | "zh">("vi");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  
  const [showQuote, setShowQuote] = useState(true);
  const [showVirtualRoom, setShowVirtualRoom] = useState(true);
  
  const [widgetVisibility, setWidgetVisibility] = useState({
    clock: true,
    stats: true,
    tasks: true,
    music: true,
    ambient: true,
  });
  
  const [backgroundUrl, setBackgroundUrl] = useState("https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?q=80&w=3540&auto=format&fit=crop");
  const [equippedPetId, setEquippedPetId] = useState<string | null>(null);
  const [showPet, setShowPet] = useState(true);
  const [equippedWeather, setEquippedWeather] = useState<string | undefined>();
  const [equippedLighting, setEquippedLighting] = useState<string | undefined>();
  const [equippedEffect, setEquippedEffect] = useState<string | undefined>();
  const [equippedCursor, setEquippedCursor] = useState<string | undefined>();
  const [equippedBadge, setEquippedBadge] = useState<{ id: string; name: string } | null>(null);
  const [equippedSound, setEquippedSound] = useState<{ id: string; name: string } | null>(null);
  const { pendingAchievements, checkAchievements, dismissAchievement } = useAchievements();

  useEffect(() => {
    const savedBg = localStorage.getItem("promodo_background_url");
    if (savedBg) setBackgroundUrl(savedBg);
    const savedPet = localStorage.getItem("promodo_equipped_pet");
    if (savedPet) setEquippedPetId(savedPet);
    setEquippedWeather(localStorage.getItem("promodo_weather") || undefined);
    setEquippedLighting(localStorage.getItem("promodo_lighting") || undefined);
    setEquippedEffect(localStorage.getItem("promodo_effect") || undefined);
    setEquippedCursor(localStorage.getItem("promodo_cursor") || undefined);

    const savedVis = localStorage.getItem("promodo_widget_visibility");
    if (savedVis) {
      try { setWidgetVisibility(JSON.parse(savedVis)); } catch (e) {}
    }

    const handleSettings = () => {
      const s = localStorage.getItem("promodo_widget_visibility");
      if (s) { try { setWidgetVisibility(JSON.parse(s)); } catch (e) {} }
    };
    window.addEventListener("promodo_settings_updated", handleSettings);

    const savedBadge = localStorage.getItem("promodo_badge");
    if (savedBadge) {
      try { setEquippedBadge(JSON.parse(savedBadge)); } catch (e) {}
    }
    const savedSound = localStorage.getItem("promodo_sound");
    if (savedSound) {
      try { setEquippedSound(JSON.parse(savedSound)); } catch (e) {}
    }

    // 2. Sync from database if authenticated
    fetch("/api/user/profile")
      .then(res => res.json())
      .then(profile => {
        if (profile?.equippedItems) {
          const e = profile.equippedItems;
          if (e.backgroundUrl) { setBackgroundUrl(e.backgroundUrl); localStorage.setItem("promodo_background_url", e.backgroundUrl); }
          if (e.petId) { setEquippedPetId(e.petId); setShowPet(true); localStorage.setItem("promodo_equipped_pet", e.petId); }
          if (e.weatherId) { setEquippedWeather(e.weatherId); localStorage.setItem("promodo_weather", e.weatherId); }
          if (e.lightingId) { setEquippedLighting(e.lightingId); localStorage.setItem("promodo_lighting", e.lightingId); }
          if (e.effectId) { setEquippedEffect(e.effectId); localStorage.setItem("promodo_effect", e.effectId); }
          if (e.cursorId) { setEquippedCursor(e.cursorId); localStorage.setItem("promodo_cursor", e.cursorId); }
          if (e.badgeId) { setEquippedBadge({ id: e.badgeId, name: "" }); }
          if (e.ambientSoundId) { setEquippedSound({ id: e.ambientSoundId, name: "" }); }
          if (e.customUploads) { localStorage.setItem("promodo_uploaded_backgrounds", e.customUploads); }
        }
      })
      .catch(() => {});
  }, []);

  // Check achievements whenever a Pomodoro completes
  useEffect(() => {
    const handleComplete = async () => {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const p = await res.json();
          checkAchievements({ totalPomodoros: p.totalPomodoros, streak: p.streak, level: p.level });
        }
      } catch {}
    };
    window.addEventListener("promodo_pomodoro_complete", handleComplete);
    return () => window.removeEventListener("promodo_pomodoro_complete", handleComplete);
  }, [checkAchievements]);

  // Listen for all equip events from marketplace
  useEffect(() => {
    const handlePetEquip = (e: Event) => {
      const id = (e as CustomEvent).detail?.petId;
      if (id) { setEquippedPetId(id); setShowPet(true); localStorage.setItem("promodo_equipped_pet", id); }
    };
    const handleWeather = (e: Event) => {
      const id = (e as CustomEvent).detail?.id;
      setEquippedWeather(id); localStorage.setItem("promodo_weather", id ?? "");
    };
    const handleLighting = (e: Event) => {
      const id = (e as CustomEvent).detail?.id;
      setEquippedLighting(id); localStorage.setItem("promodo_lighting", id ?? "");
    };
    const handleEffect = (e: Event) => {
      const id = (e as CustomEvent).detail?.id;
      setEquippedEffect(id); localStorage.setItem("promodo_effect", id ?? "");
    };
    const handleCursor = (e: Event) => {
      const id = (e as CustomEvent).detail?.id;
      setEquippedCursor(id); localStorage.setItem("promodo_cursor", id ?? "");
    };
    const handleBadge = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setEquippedBadge(detail); localStorage.setItem("promodo_badge", JSON.stringify(detail));
    };
    const handleSound = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setEquippedSound(detail); localStorage.setItem("promodo_sound", JSON.stringify(detail));
    };
    window.addEventListener("promodo_pet_equipped",      handlePetEquip);
    window.addEventListener("promodo_weather_equipped",  handleWeather);
    window.addEventListener("promodo_lighting_equipped", handleLighting);
    window.addEventListener("promodo_effect_equipped",   handleEffect);
    window.addEventListener("promodo_cursor_equipped",   handleCursor);
    window.addEventListener("promodo_badge_equipped",    handleBadge);
    window.addEventListener("promodo_sound_equipped",    handleSound);
    return () => {
      window.removeEventListener("promodo_pet_equipped",      handlePetEquip);
      window.removeEventListener("promodo_weather_equipped",  handleWeather);
      window.removeEventListener("promodo_lighting_equipped", handleLighting);
      window.removeEventListener("promodo_effect_equipped",   handleEffect);
      window.removeEventListener("promodo_cursor_equipped",   handleCursor);
      window.removeEventListener("promodo_badge_equipped",    handleBadge);
      window.removeEventListener("promodo_sound_equipped",    handleSound);
    };
  }, []);
  
  const t = translations[lang];

  return (
    <>
    <div className="hidden lg:block fixed inset-0 w-screen h-screen overflow-hidden bg-black z-40">
      <div className="absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out">
        <Image
          key={backgroundUrl}
          src={backgroundUrl}
          alt="Immersive Background"
          fill
          sizes="100vw"
          unoptimized
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      </div>

      <EnvironmentOverlays equipped={{ weather: equippedWeather, lighting: equippedLighting, effect: equippedEffect, cursor: equippedCursor }} />
      <header id="tour-header" className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-50 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-4">
          <h1 className="text-2xl font-heading font-bold text-white drop-shadow-md tracking-wide">
            Lumina
          </h1>
          <DailyMissionsWidget />
        </div>
        <div className="pointer-events-auto flex gap-3 items-center">
          {equippedBadge && (
            <div className="bg-black/40 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-xl flex items-center gap-2 text-white shadow-lg">
              <span className="text-sm">🏅</span>
              <span className="text-xs font-semibold text-white/90">{equippedBadge.name}</span>
            </div>
          )}
          
          <div className="flex bg-black/40 backdrop-blur-md border border-white/20 rounded-xl p-1 shadow-lg">
            {(["en", "vi", "zh"] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors ${lang === l ? "bg-white text-black" : "text-white/70 hover:text-white"}`}
              >
                {l}
              </button>
            ))}
          </div>

          {session ? (
            <>
              <StreakWidget />
              <div className="bg-black/40 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl flex items-center gap-2 text-white shadow-lg">
                <span className="text-yellow-400 font-bold">{(session.user as any)?.coins?.toLocaleString() || '0'}</span>
                <Coins className="w-4 h-4 text-yellow-400" />
              </div>
              
              <div className="relative">
                <div 
                  className="w-10 h-10 rounded-full relative bg-primary border-2 border-white/20 shadow-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  {session.user?.image ? (
                    <Image sizes="(max-width: 768px) 100vw, 33vw" src={session.user.image} fill alt="User avatar" className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-indigo-400 flex items-center justify-center font-bold text-white uppercase">{session.user?.name?.[0] || session.user?.email?.[0]}</div>
                  )}
                </div>
                
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-14 w-48 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-1 z-50 pointer-events-auto"
                    >
                      <button 
                        onClick={() => {
                          setIsProfileOpen(false);
                          setIsDashboardOpen(true);
                        }}
                        className="w-full px-4 py-3 flex items-center gap-3 text-white/90 hover:bg-white/10 hover:text-white transition-colors text-sm font-medium text-left"
                      >
                        <User className="w-4 h-4" />
                        Hồ sơ (Profile)
                      </button>
                      <div className="w-full h-px bg-white/10 my-1" />
                      <button 
                        onClick={() => signOut()}
                        className="w-full px-4 py-3 flex items-center gap-3 text-red-400 hover:bg-white/10 hover:text-red-300 transition-colors text-sm font-medium text-left"
                      >
                        <X className="w-4 h-4" />
                        Log Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <Link href="/login" className="bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 px-5 py-2.5 rounded-xl flex items-center gap-2 text-white shadow-lg transition-colors font-medium text-sm pointer-events-auto">
              {t.login}
            </Link>
          )}
        </div>
      </header>

      <FloatingTimer />
      
      <div className="absolute right-[360px] top-24 flex flex-col gap-5 z-30 pointer-events-none items-end">
        {widgetVisibility.clock && (
          <motion.div drag dragMomentum={false} className="pointer-events-auto rounded-2xl w-72">
            <ClockWeatherWidget />
          </motion.div>
        )}
        {widgetVisibility.stats && (
          <motion.div drag dragMomentum={false} className="pointer-events-auto rounded-2xl w-72">
            <StatsLevelWidget />
          </motion.div>
        )}
        {widgetVisibility.tasks && (
          <motion.div drag dragMomentum={false} className="pointer-events-auto rounded-2xl w-72">
            <MiniTaskWidget />
          </motion.div>
        )}
      </div>

      <div className="absolute right-8 top-24 flex flex-col gap-5 z-30 pointer-events-none items-end">
        {widgetVisibility.music && (
          <motion.div drag dragMomentum={false} className="pointer-events-auto rounded-2xl w-72">
            <MusicPlayerWidget />
          </motion.div>
        )}
        {widgetVisibility.ambient && (
          <motion.div drag dragMomentum={false} className="pointer-events-auto rounded-2xl w-72">
            <AmbientMixerWidget />
          </motion.div>
        )}
      </div>

      <BottomDock onOpenPanel={(id) => {
        // Auth check
        if (!session && !["tasks", "notes", "music", "settings"].includes(id)) {
          toast.error("Vui lòng đăng nhập để sử dụng tính năng này!");
          return;
        }

        if (id === "dashboard") {
          setActiveModal("dashboard");
          setActivePanel(null);
          setShowFriends(false);
          return;
        }

        if (id === "friends") {
          setShowFriends(!showFriends);
          setActivePanel(null);
          setActiveModal(null);
        } else if (id === "marketplace" || id === "settings") {
          setActiveModal(activeModal === id ? null : id);
          setActivePanel(null);
          setShowFriends(false);
        } else {
          setActivePanel(activePanel === id ? null : id);
          setActiveModal(null);
          setShowFriends(false);
        }
      }} />

      {/* Backdrop for any active panel */}
      {activePanel && (
        <div className="fixed inset-0 z-40" onClick={() => setActivePanel(null)} />
      )}

      {/* Permanent Room Panel (Never unmounts to keep WebSocket alive) */}
      <motion.div
        initial={false}
        animate={{ 
          opacity: activePanel === "room" ? 1 : 0, 
          x: activePanel === "room" ? 0 : 400 
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={`absolute top-20 bottom-20 right-4 w-[360px] bg-black/60 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden ${activePanel === "room" ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        <div className="flex justify-between items-center p-5 border-b border-white/10 bg-white/5">
          <h2 className="text-white font-heading font-semibold capitalize text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Room
          </h2>
          <button 
            onClick={() => setActivePanel(null)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <VirtualRoomWidget />
        </div>
      </motion.div>

      {/* Other Panels (Can unmount safely) */}
      <AnimatePresence>
        {activePanel && activePanel !== "room" && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute top-20 bottom-20 right-4 w-[360px] bg-black/60 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden pointer-events-auto"
          >
            <div className="flex justify-between items-center p-5 border-b border-white/10 bg-white/5">
              <h2 className="text-white font-heading font-semibold capitalize text-lg flex items-center gap-2">
                {activePanel === "marketplace" && <Store className="w-5 h-5 text-yellow-400" />}
                {activePanel === "settings" && <Settings2 className="w-5 h-5 text-white/70" />}
                {activePanel}
              </h2>
              <button 
                onClick={() => setActivePanel(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {activePanel === "tasks" && <TasksPanelContent t={t} />}
              {activePanel === "notes" && <NotesPanelContent t={t} />}
              {activePanel === "music" && <MusicPanelContent t={t} />}
              {activePanel === "chat" && <ChatPanel />}
              {activePanel === "friends" && !session && (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{t.joinCommunity}</h3>
                  <p className="text-white/50 text-sm mb-6">{t.joinDesc}</p>
                  <Link href="/login" className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl transition-colors">
                    {t.signUpFree}
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDashboardOpen && (
          <DashboardOverlay onClose={() => setIsDashboardOpen(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`bg-[#111] border border-white/20 rounded-2xl shadow-2xl relative
                w-full max-w-md h-auto max-h-[85vh]
                flex flex-col overflow-hidden`}
            >

              {/* Settings modal */}
              {activeModal === "settings" && (
                <>
                  <div className="flex justify-between items-center p-5 border-b border-white/10 bg-white/5">
                    <h2 className="text-white font-heading font-semibold capitalize text-lg flex items-center gap-2">
                      <Settings2 className="w-5 h-5 text-white/70" />
                      Cài đặt
                    </h2>
                    <button
                      onClick={() => setActiveModal(null)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                    <SettingsPanelContent t={t} onClose={() => setActiveModal(null)} />
                  </div>
                </>
              )}

              {/* Dashboard modal */}
              {activeModal === "dashboard" && (
                <>
                  <div className="flex justify-between items-center p-5 border-b border-white/10 bg-white/5">
                    <h2 className="text-white font-heading font-semibold capitalize text-lg flex items-center gap-2">
                      <LayoutDashboard className="w-5 h-5 text-primary" />
                      Bảng Điều Khiển
                    </h2>
                    <button
                      onClick={() => setActiveModal(null)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <AnalyticsDashboard onClose={() => setActiveModal(null)} />
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent MarketplaceModal */}
      <div 
        className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 transition-opacity duration-200 ${activeModal === "marketplace" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setActiveModal(null)}
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          className="bg-[#111] border border-white/20 rounded-2xl shadow-2xl relative w-[95vw] max-w-none h-[95vh] flex flex-col overflow-hidden transform transition-transform duration-200"
          style={{ transform: activeModal === "marketplace" ? "scale(1)" : "scale(0.95)" }}
        >
          <MarketplaceModal
            onClose={() => setActiveModal(null)}
            onEquipBackground={(url) => setBackgroundUrl(url)}
          />
        </div>
      </div>

      {/* Pet Widget with close button */}
      {equippedPetId && showPet && (
        <div className="fixed z-[91]" style={{ bottom: 20, left: 20 }}>
          <button
            onClick={() => {
              setShowPet(false);
              localStorage.removeItem("promodo_equipped_pet");
              setEquippedPetId(null);
            }}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-black/60 border border-white/20 flex items-center justify-center hover:bg-red-500/80 transition-colors z-10"
          >
            <span className="text-white text-[10px] font-bold">✕</span>
          </button>
          <PetWidget petId={equippedPetId} />
        </div>
      )}

      {/* Floating reward popups */}
      <AnimatePresence>
        {showFriends && <FriendsPanel onClose={() => setShowFriends(false)} />}
      </AnimatePresence>

      <RewardToastSystem />

      {/* Achievement popups */}
      <AnimatePresence>
        {pendingAchievements.slice(0, 1).map(a => (
          <AchievementPopup key={a.id} achievement={a} onClose={() => dismissAchievement(a.id)} />
        ))}
      </AnimatePresence>
    </div>
    
    {/* Mobile/Small Tablet Blocker */}
    <div className="lg:hidden fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8 text-center">
      <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center border border-primary/30 mb-6">
        <Sparkles className="w-10 h-10 text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-3 font-heading">Desktop Required</h2>
      <p className="text-white/60">
        Lumina's immersive focus environment is designed for larger screens. 
        Please use a Desktop or a large Tablet to experience the full app.
      </p>
    </div>
    
    <GlobalAudioPlayers />
    </>
  );
}

// -----------------------------------------------------
// Sub-components for Panels
// -----------------------------------------------------



function TasksPanelContent({ t }: { t: any }) {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (session) {
      fetch("/api/tasks")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setTasks(data);
        });
    } else {
      const saved = localStorage.getItem("promodo_tasks");
      if (saved) {
        try { setTasks(JSON.parse(saved)); } catch (e) {}
      }
    }
  }, [session]);

  useEffect(() => {
    if (isMounted && !session) {
      localStorage.setItem("promodo_tasks", JSON.stringify(tasks));
      window.dispatchEvent(new Event('promodo_tasks_updated'));
    }
  }, [tasks, isMounted, session]);

  const toggleTask = async (id: string | number) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    // Optimistic UI
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));

    if (session) {
      await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ done: !task.done })
      });
      window.dispatchEvent(new Event('promodo_tasks_updated'));
    }
  };

  const deleteTask = async (id: string | number) => {
    setTasks(tasks.filter(t => t.id !== id));
    if (session) {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      window.dispatchEvent(new Event('promodo_tasks_updated'));
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    
    const text = newTaskText.trim();
    setNewTaskText("");

    if (session) {
      // Optimistic UI for DB
      const tempId = Date.now().toString();
      setTasks([...tasks, { id: tempId, text, done: false }]);
      
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ text })
      });
      const savedTask = await res.json();
      setTasks(prev => prev.map(t => t.id === tempId ? savedTask : t));
      window.dispatchEvent(new Event('promodo_tasks_updated'));
    } else {
      setTasks([...tasks, { id: Date.now(), text, done: false }]);
    }
  };

  return (
    <div className="p-5 space-y-4 flex flex-col h-full">
      <form onSubmit={addTask} className="relative">
        <input 
          type="text" 
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder={t.addTask + "..."}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-white outline-none focus:border-primary transition-colors text-sm"
        />
        <button 
          type="submit" 
          disabled={!newTaskText.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </form>
      
      <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar">
        {tasks.length === 0 && isMounted && (
          <div className="text-center text-white/30 text-sm mt-8">No tasks yet. Add one above!</div>
        )}
        {tasks.map(task => (
          <div key={task.id} className={`flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 transition-colors hover:bg-white/10 ${task.done ? 'opacity-50' : ''} group`}>
            <button 
              onClick={() => toggleTask(task.id)}
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${task.done ? 'bg-emerald-500 border-emerald-500' : 'border-white/30'}`}
            >
              {task.done && <Check className="w-3 h-3 text-white" />}
            </button>
            <span className={`text-sm text-white flex-1 truncate ${task.done ? 'line-through' : ''}`}>{task.text}</span>
            <button 
              onClick={() => deleteTask(task.id)}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded-lg text-white/50 hover:text-red-400 transition-all flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotesPanelContent({ t }: { t: any }) {
  const [note, setNote] = useState("");
  
  useEffect(() => {
    setNote(localStorage.getItem("promodo_note") || "");
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value);
    localStorage.setItem("promodo_note", e.target.value);
  };

  return (
    <div className="h-full flex flex-col p-5">
      <textarea 
        className="flex-1 w-full bg-transparent border-none outline-none text-white/90 resize-none placeholder:text-white/30 text-sm leading-relaxed"
        placeholder={t.notesPlaceholder}
        value={note}
        onChange={handleChange}
      />
    </div>
  );
}

function MusicPanelContent({ t }: { t: any }) {
  const { rainVolume, cafeVolume, fireVolume, officeVolume, oceanVolume, setVolume } = useAmbientStore();

  return (
    <div className="p-5 space-y-6">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-4">
        <div className="w-full h-[80px] rounded-xl overflow-hidden shadow-lg relative">
          <iframe 
            style={{ borderRadius: "12px" }}
            src="https://open.spotify.com/embed/playlist/37i9dQZF1DWWQRwui0ExPn?utm_source=generator&theme=0" 
            width="100%" 
            height="80" 
            frameBorder="0" 
            allowFullScreen={false} 
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
            loading="lazy"
          ></iframe>
        </div>
        <div className="text-center">
          <h3 className="text-white font-semibold">Lofi Study Beats</h3>
          <p className="text-white/50 text-xs mt-1">Spotify Playlist</p>
        </div>
      </div>
      
      <div>
        <h4 className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-3">{t.ambientSounds}</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-white text-sm w-16">Rain</span>
            <input 
              type="range" 
              className="flex-1 accent-primary bg-white/20 h-1.5 rounded-lg appearance-none cursor-pointer" 
              value={rainVolume}
              onChange={(e) => setVolume("rain", Number(e.target.value))}
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white text-sm w-16">Cafe</span>
            <input 
              type="range" 
              className="flex-1 accent-primary bg-white/20 h-1.5 rounded-lg appearance-none cursor-pointer" 
              value={cafeVolume}
              onChange={(e) => setVolume("cafe", Number(e.target.value))}
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white text-sm w-16">Lửa Trại</span>
            <input 
              type="range" 
              className="flex-1 accent-orange-500 bg-white/20 h-1.5 rounded-lg appearance-none cursor-pointer" 
              value={fireVolume}
              onChange={(e) => setVolume("fire", Number(e.target.value))}
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white text-sm w-16">Bàn Phím</span>
            <input 
              type="range" 
              className="flex-1 accent-gray-400 bg-white/20 h-1.5 rounded-lg appearance-none cursor-pointer" 
              value={officeVolume}
              onChange={(e) => setVolume("office", Number(e.target.value))}
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white text-sm w-16">Sóng Biển</span>
            <input 
              type="range" 
              className="flex-1 accent-cyan-400 bg-white/20 h-1.5 rounded-lg appearance-none cursor-pointer" 
              value={oceanVolume}
              onChange={(e) => setVolume("ocean", Number(e.target.value))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function MarketplacePanelContent({ onBuy, t }: { onBuy: (url: string) => void, t: any }) {
  const { data: session, update: updateSession } = useSession();
  const [activeTab, setActiveTab] = useState<"themes" | "timers" | "sounds">("themes");
  const [equippedTimer, setEquippedTimer] = useState("default");
  const [ownedItems, setOwnedItems] = useState<string[]>(["theme-1", "timer-default"]);
  const [isBuying, setIsBuying] = useState(false);
  
  useEffect(() => {
    setEquippedTimer(localStorage.getItem("promodo_timer_style") || "default");
    const savedOwned = localStorage.getItem("promodo_owned_items");
    if (savedOwned) {
      setOwnedItems(JSON.parse(savedOwned));
    }
  }, []);

  const handleEquipTimer = (id: string) => {
    localStorage.setItem("promodo_timer_style", id);
    setEquippedTimer(id);
    window.dispatchEvent(new Event('promodo_timer_style_updated'));
  };

  const THEMES = [
    { id: "theme-1", name: "Cozy Anime Room", price: 0, url: "https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?q=80&w=3540&auto=format&fit=crop" },
    { id: "theme-2", name: "Rainy Night City", price: 500, url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=3464&auto=format&fit=crop" },
    { id: "theme-3", name: "Minimalist Library", price: 300, url: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=3580&auto=format&fit=crop" },
  ];

  const TIMERS = [
    { id: "timer-default", name: "Classic Ring", price: 0, color: "bg-primary" },
    { id: "timer-cyberpunk", name: "Cyberpunk Neon", price: 200, color: "bg-fuchsia-500" },
    { id: "timer-zen", name: "Zen Circle", price: 150, color: "bg-orange-500" },
  ];

  const SOUNDS = [
    { id: "sound-tokyo", name: "Tokyo Night Rain", price: 100 },
    { id: "sound-lofi", name: "Lo-Fi Cafe", price: 100 },
  ];

  const handlePurchase = async (item: { id: string, price: number }) => {
    if (isBuying) return;
    setIsBuying(true);

    try {
      const res = await fetch("/api/marketplace/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: item.price })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        toast.error(data.error || "Giao dịch thất bại");
        return;
      }

      // Success
      const newOwned = [...ownedItems, item.id];
      setOwnedItems(newOwned);
      localStorage.setItem("promodo_owned_items", JSON.stringify(newOwned));
      toast.success("Mua thành công!");
      
      // Update session coins
      await updateSession();
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setIsBuying(false);
    }
  };

  if (!session) {
    return (
      <div className="p-5 text-center">
        <div className="w-16 h-16 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Store className="w-8 h-8 text-yellow-400" />
        </div>
        <h3 className="text-white font-semibold mb-2">{t.marketplaceLocked}</h3>
        <p className="text-white/50 text-sm mb-6">{t.marketplaceLockedDesc}</p>
        <Link href="/login" className="block w-full py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl transition-colors">
          {t.login}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex px-5 pt-4 pb-2 border-b border-white/10 gap-4">
        <button onClick={() => setActiveTab("themes")} className={`text-sm font-medium pb-2 border-b-2 transition-colors ${activeTab === "themes" ? "border-primary text-white" : "border-transparent text-white/50 hover:text-white/80"}`}>Ảnh nền</button>
        <button onClick={() => setActiveTab("timers")} className={`text-sm font-medium pb-2 border-b-2 transition-colors ${activeTab === "timers" ? "border-primary text-white" : "border-transparent text-white/50 hover:text-white/80"}`}>Đồng hồ</button>
        <button onClick={() => setActiveTab("sounds")} className={`text-sm font-medium pb-2 border-b-2 transition-colors ${activeTab === "sounds" ? "border-primary text-white" : "border-transparent text-white/50 hover:text-white/80"}`}>Âm thanh</button>
      </div>

      <div className="p-5 overflow-y-auto flex-1">
        {activeTab === "themes" && (
          <div className="grid grid-cols-2 gap-4">
            {THEMES.map(theme => {
              const isOwned = ownedItems.includes(theme.id) || theme.price === 0;
              return (
              <div key={theme.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 transition-colors flex flex-col">
                <div className="h-72 relative">
                  <Image sizes="(max-width: 768px) 100vw, 33vw" src={theme.url} alt={theme.name} fill className="object-cover" />
                </div>
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <h4 className="text-white font-medium text-sm">{theme.name}</h4>
                    <p className="text-yellow-400 text-xs font-bold mt-1">{theme.price === 0 ? t.free : `${theme.price} ${t.coins}`}</p>
                  </div>
                  <button 
                    disabled={isBuying && !isOwned}
                    onClick={() => isOwned ? onBuy(theme.url) : handlePurchase(theme)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${isOwned ? "bg-white/10 text-white hover:bg-white/20" : "bg-yellow-400 text-black hover:bg-yellow-500"}`}
                  >
                    {isOwned ? t.equip : (isBuying && !isOwned ? "..." : t.buy)}
                  </button>
                </div>
              </div>
            )})}
          </div>
        )}

        {activeTab === "timers" && (
          <div className="grid grid-cols-2 gap-4">
            {TIMERS.map(timer => {
              const isOwned = ownedItems.includes(timer.id) || timer.price === 0;
              const isEquipped = equippedTimer === timer.id.replace("timer-", "");
              return (
              <div key={timer.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center hover:border-white/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-full border-2 border-white/20 flex items-center justify-center ${timer.color}/20`}>
                    <Clock className={`w-7 h-7 ${timer.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{timer.name}</h4>
                    <p className="text-yellow-400 text-sm font-bold mt-1">{timer.price === 0 ? t.free : `${timer.price} ${t.coins}`}</p>
                  </div>
                </div>
                <button 
                  disabled={isBuying && !isOwned}
                  onClick={() => isOwned ? handleEquipTimer(timer.id.replace("timer-", "")) : handlePurchase(timer)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${isEquipped ? "bg-primary text-white" : isOwned ? "bg-white/10 text-white hover:bg-white/20" : "bg-yellow-400 text-black hover:bg-yellow-500"}`}
                >
                  {isEquipped ? "Đang dùng" : isOwned ? t.equip : (isBuying && !isOwned ? "..." : t.buy)}
                </button>
              </div>
            )})}
          </div>
        )}

        {activeTab === "sounds" && (
          <div className="grid grid-cols-2 gap-4">
            {SOUNDS.map(sound => {
              const isOwned = ownedItems.includes(sound.id) || sound.price === 0;
              return (
              <div key={sound.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center hover:border-white/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center">
                    <Headphones className="w-7 h-7 text-white/70" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{sound.name}</h4>
                    <p className="text-yellow-400 text-sm font-bold mt-1">{sound.price === 0 ? t.free : `${sound.price} ${t.coins}`}</p>
                  </div>
                </div>
                <button 
                  disabled={isBuying && !isOwned}
                  onClick={() => isOwned ? toast.success("Equipped!") : handlePurchase(sound)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${isOwned ? "bg-white/10 text-white hover:bg-white/20" : "bg-yellow-400 text-black hover:bg-yellow-500"}`}
                >
                  {isOwned ? t.equip : (isBuying && !isOwned ? "..." : t.buy)}
                </button>
              </div>
            )})}
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsPanelContent({ t, onClose }: { t: any, onClose: () => void }) {
  const [focusLength, setFocusLength] = useState(25);
  const [breakLength, setBreakLength] = useState(5);
  const [totalSessions, setTotalSessions] = useState(4);
  const [autoStartBreaks, setAutoStartBreaks] = useState(true);
  const [autoStartPomodoros, setAutoStartPomodoros] = useState(false);
  const [soundAlarms, setSoundAlarms] = useState(true);
  const [weatherCity, setWeatherCity] = useState("Ho Chi Minh");
  const [widgetVisibility, setWidgetVisibility] = useState({
    clock: true,
    stats: true,
    tasks: true,
    music: true,
    ambient: true,
  });

  useEffect(() => {
    const savedFocus = localStorage.getItem("promodo_focus_length");
    const savedBreak = localStorage.getItem("promodo_break_length");
    const savedSessions = localStorage.getItem("promodo_total_sessions");
    const savedAutoBreak = localStorage.getItem("promodo_auto_start_breaks");
    const savedAutoPomodoro = localStorage.getItem("promodo_auto_start_pomodoros");
    const savedSoundAlarms = localStorage.getItem("promodo_sound_alarms");
    const savedCity = localStorage.getItem("promodo_weather_city");
    if (savedFocus) setFocusLength(parseInt(savedFocus, 10));
    if (savedBreak) setBreakLength(parseInt(savedBreak, 10));
    if (savedSessions) setTotalSessions(parseInt(savedSessions, 10));
    if (savedAutoBreak !== null) setAutoStartBreaks(savedAutoBreak === "true");
    if (savedAutoPomodoro !== null) setAutoStartPomodoros(savedAutoPomodoro === "true");
    if (savedSoundAlarms !== null) setSoundAlarms(savedSoundAlarms === "true");
    if (savedCity) setWeatherCity(savedCity);
    
    const savedVis = localStorage.getItem("promodo_widget_visibility");
    if (savedVis) {
      try { setWidgetVisibility(JSON.parse(savedVis)); } catch (e) {}
    }
  }, []);

  const handleApply = () => {
    localStorage.setItem("promodo_focus_length", focusLength.toString());
    localStorage.setItem("promodo_break_length", breakLength.toString());
    localStorage.setItem("promodo_total_sessions", totalSessions.toString());
    localStorage.setItem("promodo_auto_start_breaks", autoStartBreaks.toString());
    localStorage.setItem("promodo_auto_start_pomodoros", autoStartPomodoros.toString());
    localStorage.setItem("promodo_sound_alarms", soundAlarms.toString());
    localStorage.setItem("promodo_weather_city", weatherCity);
    localStorage.setItem("promodo_widget_visibility", JSON.stringify(widgetVisibility));
    window.dispatchEvent(new Event('promodo_settings_updated'));
    toast.success("Đã áp dụng cài đặt thành công!");
    onClose();
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h4 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4" /> Thời gian học
        </h4>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between bg-black/40 border border-white/5 p-4 rounded-2xl hover:border-white/10 transition-colors">
            <div>
              <span className="text-white text-sm font-semibold">Focus Length</span>
              <p className="text-white/40 text-[10px] uppercase tracking-wider mt-0.5">Thời lượng tập trung (Phút)</p>
            </div>
            <input 
              type="number" 
              value={focusLength}
              onChange={(e) => setFocusLength(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 bg-white/10 text-white font-bold text-center rounded-xl py-2 text-sm outline-none border border-white/10 focus:border-primary focus:bg-primary/10 transition-all"
            />
          </div>
          
          <div className="flex items-center justify-between bg-black/40 border border-white/5 p-4 rounded-2xl hover:border-white/10 transition-colors">
            <div>
              <span className="text-white text-sm font-semibold">Break Length</span>
              <p className="text-white/40 text-[10px] uppercase tracking-wider mt-0.5">Thời gian nghỉ (Phút)</p>
            </div>
            <input 
              type="number" 
              value={breakLength}
              onChange={(e) => setBreakLength(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 bg-white/10 text-white font-bold text-center rounded-xl py-2 text-sm outline-none border border-white/10 focus:border-primary focus:bg-primary/10 transition-all"
            />
          </div>
          
          <div className="flex items-center justify-between bg-black/40 border border-white/5 p-4 rounded-2xl hover:border-white/10 transition-colors">
            <div>
              <span className="text-white text-sm font-semibold">Chu kỳ</span>
              <p className="text-white/40 text-[10px] uppercase tracking-wider mt-0.5">Số phiên mỗi vòng</p>
            </div>
            <input 
              type="number" 
              min="1"
              value={totalSessions}
              onChange={(e) => setTotalSessions(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 bg-white/10 text-white font-bold text-center rounded-xl py-2 text-sm outline-none border border-white/10 focus:border-primary focus:bg-primary/10 transition-all"
            />
          </div>
        </div>

        <h4 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
          <LayoutDashboard className="w-4 h-4" /> Hiển thị tiện ích (Widgets)
        </h4>
        <div className="space-y-3 mb-6">
          {Object.entries({
            clock: "Đồng hồ & Thời tiết",
            stats: "Chỉ số cấp độ",
            tasks: "Nhiệm vụ nhỏ",
            music: "Trình phát nhạc",
            ambient: "Mix âm thanh",
          }).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between bg-black/40 border border-white/5 p-4 rounded-2xl hover:border-white/10 transition-colors">
              <span className="text-white text-sm font-semibold">{label}</span>
              <div 
                onClick={() => {
                  const currentVal = widgetVisibility[key as keyof typeof widgetVisibility];
                  const next = { ...widgetVisibility, [key]: !currentVal };
                  setWidgetVisibility(next);
                  localStorage.setItem("promodo_widget_visibility", JSON.stringify(next));
                  setTimeout(() => {
                    window.dispatchEvent(new Event('promodo_settings_updated'));
                  }, 0);
                }}
                className={`w-12 h-7 rounded-full relative cursor-pointer transition-colors shadow-inner ${widgetVisibility[key as keyof typeof widgetVisibility] ? "bg-primary" : "bg-white/10"}`}
              >
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${widgetVisibility[key as keyof typeof widgetVisibility] ? "right-1" : "left-1"}`} />
              </div>
            </div>
          ))}
        </div>

        <h4 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
          <Settings2 className="w-4 h-4" /> Tự động hóa
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-black/40 border border-white/5 p-4 rounded-2xl hover:border-white/10 transition-colors">
            <div>
              <span className="text-white text-sm font-semibold">Tự động bắt đầu nghỉ</span>
              <p className="text-white/40 text-[10px] uppercase tracking-wider mt-0.5">Tự nhảy sang Break khi xong Focus</p>
            </div>
            <div 
              onClick={() => setAutoStartBreaks(!autoStartBreaks)}
              className={`w-12 h-7 rounded-full relative cursor-pointer transition-colors shadow-inner ${autoStartBreaks ? "bg-primary" : "bg-white/10"}`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${autoStartBreaks ? "right-1" : "left-1"}`} />
            </div>
          </div>
          
          <div className="flex items-center justify-between bg-black/40 border border-white/5 p-4 rounded-2xl hover:border-white/10 transition-colors">
            <div>
              <span className="text-white text-sm font-semibold">Tự động bắt đầu học</span>
              <p className="text-white/40 text-[10px] uppercase tracking-wider mt-0.5">Tự nhảy sang Focus khi xong Break</p>
            </div>
            <div 
              onClick={() => setAutoStartPomodoros(!autoStartPomodoros)}
              className={`w-12 h-7 rounded-full relative cursor-pointer transition-colors shadow-inner ${autoStartPomodoros ? "bg-primary" : "bg-white/10"}`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${autoStartPomodoros ? "right-1" : "left-1"}`} />
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h4 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
          <Headphones className="w-4 h-4" /> Thông báo
        </h4>
        <div className="flex items-center justify-between bg-black/40 border border-white/5 p-4 rounded-2xl hover:border-white/10 transition-colors">
          <div>
            <span className="text-white text-sm font-semibold">Âm thanh báo thức</span>
            <p className="text-white/40 text-[10px] uppercase tracking-wider mt-0.5">Đổ chuông khi hết thời gian</p>
          </div>
          <div 
            onClick={() => setSoundAlarms(!soundAlarms)}
            className={`w-12 h-7 rounded-full relative cursor-pointer transition-colors shadow-inner ${soundAlarms ? "bg-primary" : "bg-white/10"}`}
          >
            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${soundAlarms ? "right-1" : "left-1"}`} />
          </div>
        </div>
      </div>
      
      <div>
        <h4 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
          <Cloud className="w-4 h-4" /> Thời tiết
        </h4>
        <div className="flex items-center justify-between bg-black/40 border border-white/5 p-4 rounded-2xl hover:border-white/10 transition-colors">
          <div>
            <span className="text-white text-sm font-semibold">Thành phố</span>
            <p className="text-white/40 text-[10px] uppercase tracking-wider mt-0.5">Hiển thị thời tiết khu vực</p>
          </div>
          <input 
            type="text" 
            value={weatherCity}
            onChange={(e) => setWeatherCity(e.target.value)}
            className="w-32 bg-white/10 text-white font-bold text-center rounded-xl py-2 text-sm outline-none border border-white/10 focus:border-primary focus:bg-primary/10 transition-all"
            placeholder="VD: Hanoi"
          />
        </div>
      </div>
      
      <div className="pt-4">
        <button 
          onClick={handleApply}
          className="w-full py-3.5 bg-primary hover:bg-primary/80 active:scale-[0.98] text-white font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]"
        >
          Lưu Cài Đặt
        </button>
      </div>
    </div>
  );
}
