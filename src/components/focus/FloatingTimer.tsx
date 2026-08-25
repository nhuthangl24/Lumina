"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useTimerStore } from "@/store/useTimerStore";
import { Play, Pause, RotateCcw, CheckCircle, Clock, Square, StepForward } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/lib/LanguageContext";

export function FloatingTimer() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const { roomId, isHost, timeLeft: storeTimeLeft, initialTime: storeInitialTime, isRunning: storeIsRunning, mode: storeMode, setIsRunning: storeSetIsRunning, setMode: storeSetMode, setTimeLeft: storeSetTimeLeft, setInitialTime: storeSetInitialTime } = useTimerStore();
  const [localTimeLeft, setLocalTimeLeft] = useState(25 * 60);
  const [localInitialTime, setLocalInitialTime] = useState(25 * 60);
  const [localIsRunning, setLocalIsRunning] = useState(false);
  const [localMode, setLocalMode] = useState<"focus" | "break">("focus");
  const [currentTask, setCurrentTask] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [sessionCount, setSessionCount] = useState(1);
  const [totalSessions, setTotalSessions] = useState(4);
  const [timerStyle, setTimerStyle] = useState("default");
  
  // Add isSynced state, defaulting to true if in room
  const [isSynced, setIsSynced] = useState(true);
  const shouldSync = roomId && isSynced;

  const timeLeft = shouldSync ? storeTimeLeft : localTimeLeft;
  const initialTime = shouldSync ? storeInitialTime : localInitialTime;
  const isRunning = shouldSync ? storeIsRunning : localIsRunning;
  const mode = shouldSync ? storeMode : localMode;

  const setTimeLeft = shouldSync ? storeSetTimeLeft : setLocalTimeLeft;
  const setInitialTime = shouldSync ? storeSetInitialTime : setLocalInitialTime;
  const setIsRunning = shouldSync ? storeSetIsRunning : setLocalIsRunning;
  const setMode = shouldSync ? storeSetMode : setLocalMode;

  // Initialize from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    const savedMode = localStorage.getItem("promodo_timer_mode") as "focus" | "break";
    const modeToUse = savedMode || "focus";
    setLocalMode(modeToUse);

    const focusLen = parseInt(localStorage.getItem("promodo_focus_length") || "25", 10);
    const breakLen = parseInt(localStorage.getItem("promodo_break_length") || "5", 10);
    const configTime = (modeToUse === "focus" ? focusLen : breakLen) * 60;

    const savedTarget = localStorage.getItem("promodo_timer_target");
    const savedPaused = localStorage.getItem("promodo_timer_paused");
    
    let timeToSet = configTime;
    
    if (savedTarget) {
      const targetTime = parseInt(savedTarget, 10);
      const remaining = Math.max(0, Math.floor((targetTime - Date.now()) / 1000));
      if (remaining > 0) {
        timeToSet = remaining;
        setIsRunning(true);
      } else {
        timeToSet = 0;
        setIsRunning(false);
        localStorage.removeItem("promodo_timer_target");
      }
    } else if (savedPaused) {
      timeToSet = parseInt(savedPaused, 10);
    }
    
    setTimeLeft(timeToSet);

    const savedInitial = localStorage.getItem("promodo_timer_initial");
    if (savedInitial && (savedTarget || savedPaused)) {
      setInitialTime(parseInt(savedInitial, 10));
    } else {
      setInitialTime(configTime);
    }

    const savedSessions = localStorage.getItem("promodo_total_sessions");
    if (savedSessions) setTotalSessions(parseInt(savedSessions, 10));

    const savedStyle = localStorage.getItem("promodo_timer_style");
    if (savedStyle) setTimerStyle(savedStyle);

    const savedSync = localStorage.getItem("promodo_room_sync");
    if (savedSync !== null) setIsSynced(savedSync === "true");

    loadCurrentTask();
  }, []); // Run only once on mount

  // Event Listeners for Tasks and Settings
  useEffect(() => {
    const handleTaskUpdate = () => loadCurrentTask();
    const handleSettingsUpdate = () => {
      if (!isRunning) loadSettingsTime(mode);
      const newSessions = localStorage.getItem("promodo_total_sessions");
      if (newSessions) setTotalSessions(parseInt(newSessions, 10));
    };
    const handleStyleUpdate = () => {
      const newStyle = localStorage.getItem("promodo_timer_style");
      if (newStyle) setTimerStyle(newStyle);
    };
    const handleSyncChanged = (e: CustomEvent) => {
      setIsSynced(e.detail.isSynced);
    };
    
    window.addEventListener('promodo_tasks_updated', handleTaskUpdate);
    window.addEventListener('promodo_settings_updated', handleSettingsUpdate);
    window.addEventListener('promodo_timer_style_updated', handleStyleUpdate);
    window.addEventListener('promodo_room_sync_changed', handleSyncChanged as EventListener);
    return () => {
      window.removeEventListener('promodo_tasks_updated', handleTaskUpdate);
      window.removeEventListener('promodo_settings_updated', handleSettingsUpdate);
      window.removeEventListener('promodo_timer_style_updated', handleStyleUpdate);
      window.removeEventListener('promodo_room_sync_changed', handleSyncChanged as EventListener);
    }
  }, [mode, isRunning]);

  const loadSettingsTime = (currentMode: "focus" | "break") => {
    const focusLen = parseInt(localStorage.getItem("promodo_focus_length") || "25", 10);
    const breakLen = parseInt(localStorage.getItem("promodo_break_length") || "5", 10);
    const newTime = (currentMode === "focus" ? focusLen : breakLen) * 60;
    setInitialTime(newTime);
    setTimeLeft(newTime);
    
    // Broadcast to room if host
    if (shouldSync && isHost) {
      const payload = { timerStatus: "idle", timerStart: null, timerDuration: newTime, startedBy: session?.user?.name };
      window.dispatchEvent(new CustomEvent("room-timer-action", { 
        detail: { action: "stop", duration: newTime, payload } 
      }));
    }
  };

  const loadCurrentTask = () => {
    const saved = localStorage.getItem("promodo_tasks");
    if (saved) {
      try {
        const tasks = JSON.parse(saved);
        const activeTask = tasks.find((t: any) => !t.done);
        setCurrentTask(activeTask ? activeTask.text : null);
      } catch (e) {}
    } else {
      setCurrentTask(null);
    }
  };

  // Timer interval and localStorage sync
  useEffect(() => {
    if (!isMounted) return;

    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      // Set target time if not exists
      if (!localStorage.getItem("promodo_timer_target")) {
        localStorage.setItem("promodo_timer_target", (Date.now() + timeLeft * 1000).toString());
      }
      localStorage.removeItem("promodo_timer_paused");
      
      interval = setInterval(() => {
        const target = parseInt(localStorage.getItem("promodo_timer_target") || "0", 10);
        if (target) {
          const remaining = Math.max(0, Math.floor((target - Date.now()) / 1000));
          setTimeLeft(remaining);
          if (remaining === 0) {
            handleTimerComplete();
          }
        }
      }, 1000);
    } else {
      // Paused or finished
      localStorage.removeItem("promodo_timer_target");
      localStorage.setItem("promodo_timer_paused", timeLeft.toString());
      localStorage.setItem("promodo_timer_initial", initialTime.toString());
      localStorage.setItem("promodo_timer_mode", mode);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, initialTime, isMounted]);

  useEffect(() => {
    let state = "online";
    if (isRunning) state = mode;
    window.dispatchEvent(new CustomEvent("promodo_timer_state", { detail: state }));
  }, [isRunning, mode]);

  const toggleTimer = async () => {
    console.log("toggleTimer clicked", { shouldSync, isHost, isRunning, mode, initialTime });
    if (shouldSync) {
      if (!isHost) {
        toast.error(t("hostOnlyStartStop"));
        return;
      }
      const action = isRunning ? "pause" : (mode === "focus" ? "start_focus" : "start_break");
      console.log("sending action", action);
      
      // Optimistic UI Update cho cảm giác mượt mà không bị delay
      storeSetIsRunning(!isRunning);

      const timerStatus = action === "pause" ? "paused" : action === "start_focus" ? "focusing" : "break";
      const payload = {
        timerStatus,
        timerStart: action === "pause" ? null : new Date().toISOString(),
        timerDuration: action === "pause" ? timeLeft : initialTime,
        startedBy: session?.user?.name,
        mode
      };

      // Notify VirtualRoomWidget to handle broadcast and API
      window.dispatchEvent(new CustomEvent("room-timer-action", { 
        detail: { action, duration: action === "pause" ? timeLeft : initialTime, payload } 
      }));
    } else {
      if (timeLeft > 0) setIsRunning(!isRunning);
    }
  };
  
  const handleTimerComplete = async () => {
    setIsRunning(false);
    localStorage.removeItem("promodo_timer_target");
    
    // Play sound if enabled
    const soundAlarms = localStorage.getItem("promodo_sound_alarms") !== "false";
    if (soundAlarms) {
      try {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
        audio.volume = 0.5;
        audio.play().catch(() => {});
      } catch (e) {}
    }
    
    if (mode === "focus") {
      setSessionCount(prev => prev >= totalSessions ? 1 : prev + 1);

      // Dispatch event for Pet, Daily Missions, Achievements
      window.dispatchEvent(new CustomEvent("promodo_pomodoro_complete"));

      // Call rewards API
      try {
        const res = await fetch("/api/rewards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "pomodoro", roomId: shouldSync ? roomId : undefined, durationMinutes: Math.floor(initialTime / 60) }),
        });
        if (res.ok) {
          const data = await res.json();
          // Dispatch reward event so UI can update coins, stats, and broadcast to room
          window.dispatchEvent(new CustomEvent("promodo_reward_earned", {
            detail: { 
              coins: data.earned?.coins, 
              xp: data.earned?.xp, 
              leveledUp: data.leveledUp,
              totalPomodoros: data.user?.totalPomodoros,
              roomStats: data.roomStats
            }
          }));
        }
      } catch {}

      const autoBreak = localStorage.getItem("promodo_auto_start_breaks") !== "false";
      handleModeChange("break", autoBreak);
    } else {
      const autoFocus = localStorage.getItem("promodo_auto_start_pomodoros") === "true";
      handleModeChange("focus", autoFocus);
    }
  };


  const stopTimer = async () => {
    const focusLen = parseInt(localStorage.getItem("promodo_focus_length") || "25", 10);
    const breakLen = parseInt(localStorage.getItem("promodo_break_length") || "5", 10);
    const resetTime = (mode === "focus" ? focusLen : breakLen) * 60;

    if (shouldSync) {
      if (!isHost) {
        toast.error(t("hostOnlyReset"));
        return;
      }
      // Optimistic Update
      storeSetIsRunning(false);
      storeSetInitialTime(resetTime);
      storeSetTimeLeft(resetTime);

      const payload = { timerStatus: "idle", timerStart: null, timerDuration: null, startedBy: session?.user?.name };
      
      window.dispatchEvent(new CustomEvent("room-timer-action", { 
        detail: { action: "stop", duration: null, payload } 
      }));
    } else {
      setIsRunning(false);
      setInitialTime(resetTime);
      setTimeLeft(resetTime);
      localStorage.removeItem("promodo_timer_target");
      localStorage.setItem("promodo_timer_paused", resetTime.toString());
    }
  };

  const skipSession = async () => {
    if (shouldSync && !isHost) {
      toast.error(t("hostOnlySkip"));
      return;
    }
    handleTimerComplete();
  };

  const handleModeChange = async (newMode: "focus" | "break", autoStart: boolean = false) => {
    // Load time for new mode optimistically
    const focusLen = parseInt(localStorage.getItem("promodo_focus_length") || "25", 10);
    const breakLen = parseInt(localStorage.getItem("promodo_break_length") || "5", 10);
    const newTime = (newMode === "focus" ? focusLen : breakLen) * 60;

    if (shouldSync) {
      if (!isHost) {
        toast.error(t("hostOnlyChangeMode"));
        return;
      }
      
      storeSetMode(newMode);
      storeSetInitialTime(newTime);
      storeSetTimeLeft(newTime);
      
      if (autoStart) {
        storeSetIsRunning(true);
        const payload = { 
          timerStatus: "focusing", 
          timerStart: new Date().toISOString(), 
          timerDuration: newTime, 
          startedBy: session?.user?.name, 
          mode: newMode 
        };
        window.dispatchEvent(new CustomEvent("room-timer-action", { 
          detail: { action: "start", duration: newTime, payload } 
        }));
      } else {
        storeSetIsRunning(false);
        const payload = { timerStatus: "idle", timerStart: null, timerDuration: null, startedBy: session?.user?.name, mode: newMode };
        window.dispatchEvent(new CustomEvent("room-timer-action", { 
          detail: { action: "stop", duration: null, payload } 
        }));
      }
      
      setMode(newMode);
    } else {
      setMode(newMode);
      setInitialTime(newTime);
      setTimeLeft(newTime);
      
      if (autoStart) {
        setIsRunning(true);
        localStorage.setItem("promodo_timer_target", (Date.now() + newTime * 1000).toString());
        localStorage.removeItem("promodo_timer_paused");
      } else {
        setIsRunning(false);
        localStorage.removeItem("promodo_timer_target");
        localStorage.setItem("promodo_timer_paused", newTime.toString());
      }
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const radius = 156; // 320 / 2 - strokeWidth (4)
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timeLeft / initialTime) * circumference;

  let containerClass = "absolute top-32 left-32 w-[320px] h-[320px] rounded-full backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-40 flex flex-col items-center justify-center relative ";
  let primaryColor = mode === "focus" ? "#6366f1" : "#10b981";
  
  if (timerStyle === "cyberpunk") {
    containerClass += "bg-black/80 border-2 border-fuchsia-500/50 shadow-[0_0_50px_rgba(217,70,239,0.3)]";
    primaryColor = mode === "focus" ? "#d946ef" : "#06b6d4";
  } else if (timerStyle === "zen") {
    containerClass += "bg-[#fdf6e3]/10 border border-[#d4a373]/30";
    primaryColor = mode === "focus" ? "#d4a373" : "#8cb369";
  } else {
    containerClass += "bg-black/40 border border-white/5";
  }

  return (
    <motion.div
      id="tour-timer"
      className={containerClass}
    >
      {/* Circular Progress SVG matching the container border */}
      <svg width="320" height="320" className="absolute inset-0 pointer-events-none transform -rotate-90">
        <circle
          cx="160"
          cy="160"
          r={radius}
          stroke={timerStyle === "cyberpunk" ? "rgba(217,70,239,0.1)" : "rgba(255,255,255,0.05)"}
          strokeWidth="4"
          fill="none"
        />
        <circle
          cx="160"
          cy="160"
          r={radius}
          stroke={primaryColor}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: isNaN(strokeDashoffset) ? 0 : strokeDashoffset,
            transition: "stroke-dashoffset 1s linear",
            filter: timerStyle === "cyberpunk" ? `drop-shadow(0 0 10px ${primaryColor})` : "none"
          }}
        />
      </svg>

      {/* Top: Mode Toggle */}
      <div className="absolute top-12 flex bg-white/5 p-1.5 rounded-full border border-white/5 z-10">
        <button 
          onClick={() => handleModeChange("focus")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${mode === "focus" ? (timerStyle === "cyberpunk" ? "bg-fuchsia-500 text-white shadow-[0_0_15px_rgba(217,70,239,0.5)]" : timerStyle === "zen" ? "bg-[#d4a373] text-white" : "bg-primary text-white shadow-lg") : "text-white/50 hover:text-white"}`}
        >
          {t('focus')}
        </button>
        <button 
          onClick={() => handleModeChange("break")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${mode === "break" ? (timerStyle === "cyberpunk" ? "bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]" : timerStyle === "zen" ? "bg-[#8cb369] text-white" : "bg-emerald-500 text-white shadow-lg") : "text-white/50 hover:text-white"}`}
        >
          {t('break')}
        </button>
      </div>


      {/* Middle: Timer Text (Perfectly Centered) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center justify-center w-full pointer-events-none mt-2">
        <div className={`text-sm font-semibold uppercase tracking-widest mb-1 ${timerStyle === "zen" ? "text-[#d4a373]/70 font-serif" : timerStyle === "cyberpunk" ? "text-cyan-400 font-mono" : "text-white/40"}`}>
          {t('session')} {sessionCount}/{totalSessions}
        </div>
        <div 
          className={`text-[5.5rem] leading-none font-extrabold tracking-tighter tabular-nums ${timerStyle === "zen" ? "text-[#fdf6e3] font-serif font-light" : timerStyle === "cyberpunk" ? "text-fuchsia-400 font-mono drop-shadow-[0_0_15px_rgba(217,70,239,0.8)]" : "text-white font-heading drop-shadow-2xl"}`}
        >
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Bottom: Controls */}
      <div className="absolute bottom-10 flex items-center gap-6 z-10">
        <button 
          onClick={stopTimer}
          title="Stop & Reset"
          className="p-2.5 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-all hover:text-destructive"
        >
          <Square className="w-4 h-4" fill="currentColor" />
        </button>
        <button 
          onClick={toggleTimer}
          className={`p-4 rounded-full shadow-2xl transition-all ${
            mode === "focus" ? (timerStyle === "cyberpunk" ? "bg-fuchsia-500 hover:bg-fuchsia-600 shadow-[0_0_20px_rgba(217,70,239,0.5)]" : timerStyle === "zen" ? "bg-[#d4a373] hover:bg-[#c39363]" : "bg-primary hover:bg-primary/90") : (timerStyle === "cyberpunk" ? "bg-cyan-500 hover:bg-cyan-600 shadow-[0_0_20px_rgba(6,182,212,0.5)]" : timerStyle === "zen" ? "bg-[#8cb369] hover:bg-[#7ba258]" : "bg-emerald-500 hover:bg-emerald-600")
          } text-white hover:scale-105 active:scale-95`}
        >
          {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 translate-x-0.5" />}
        </button>
        <button 
          onClick={skipSession}
          title="Skip Session"
          className="p-2.5 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-all"
        >
          <StepForward className="w-4 h-4" fill="currentColor" />
        </button>
      </div>

      {/* Detached Current Task Pill */}
      {currentTask && (
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 whitespace-nowrap z-0">
          <div className="flex items-center gap-3 bg-black/60 backdrop-blur-xl rounded-full px-5 py-3 border border-white/10 shadow-xl group cursor-pointer hover:bg-white/10 transition-all hover:border-white/20">
            <div className="w-5 h-5 rounded-full border-2 border-white/20 flex items-center justify-center group-hover:border-primary transition-colors bg-black/20">
              <CheckCircle className="w-3 h-3 text-transparent group-hover:text-primary transition-colors" />
            </div>
            <span className="text-white/90 text-sm font-medium truncate max-w-[200px]">{currentTask}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
