"use client";
import { useRouter } from "next/navigation";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Plus, X, Play, Pause, Timer, Trophy, Target,
  MessageSquare, Copy, Check, Crown, Clock, Zap, Award,
  BarChart3, Loader2, Volume2, ThumbsUp, ListTodo, ArrowLeft, Music, Gamepad2, Download, Share2, Settings, Film
} from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabase";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { useAmbientStore } from "@/store/useAmbientStore";
import { useTimerStore } from "@/store/useTimerStore";
import { useLanguage } from "@/lib/LanguageContext";

interface RoomData {
  id: string;
  name: string;
  code: string;
  hostId: string;
  host: { id: string; name: string; image: string | null };
  timerStatus: string;
  timerStart: string | null;
  timerDuration: number | null;
  currentPlaylist: string | null;
  members: Array<{
    user: { id: string; name: string; image: string | null; status: string; level: number; totalPomodoros: number };
  }>;
  tasks: Array<{
    id: string;
    content: string;
    isCompleted: boolean;
    user: { id: string; name: string; image: string | null };
  }>;
  challenges: Array<{
    id: string;
    title: string;
    description: string;
    targetCount: number;
    currentCount: number;
    rewardCoins: number;
    rewardXp: number;
    isCompleted: boolean;
  }>;
  stats: Array<{
    date: string;
    totalFocusMinutes: number;
    totalPomodoros: number;
    mvpUserId: string | null;
    mvpMinutes: number;
  }>;
  achievements: Array<{ type: string; unlockedAt: string }>;
  _count: { members: number };
  musicVotes: string | null;
}

const roomCache: Record<string, RoomData> = {};

// ─── Lobby: Browse/Create/Join ───
function RoomLobby({ onJoinRoom }: { onJoinRoom: (room: RoomData) => void }) {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchRooms(); }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/rooms");
      if (res.ok) setRooms(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const createRoom = async () => {
    if (!newRoomName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newRoomName, isPrivate })
      });
      if (res.ok) {
        const room = await res.json();
        roomCache[room.id] = room;
        onJoinRoom(room);
        toast.success(t("roomCreated"));
        
        // Update Daily Mission for joining/creating a room
        fetch("/api/missions/daily", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "room", amount: 1 })
        }).then(() => window.dispatchEvent(new Event("promodo_mission_progress"))).catch(console.error);

      } else {
        toast.error(t("roomCreateError"));
      }
    } catch (e) {
      console.error(e);
      toast.error(t("systemError"));
    }
    setCreating(false);
  };

  const joinByCode = async () => {
    if (!joinCode.trim()) return;
    try {
      // Find room by code first
      const res = await fetch(`/api/rooms`);
      if (res.ok) {
        const allRooms = await res.json();
        const room = allRooms.find((r: any) => r.code === joinCode.toUpperCase());
        if (room) {
          const joinRes = await fetch(`/api/rooms/${room.id}/join`, { method: "POST" });
          if (joinRes.ok) {
            roomCache[room.id] = room;
            onJoinRoom(room);
            toast.success(t("roomJoined"));
            
            // Update Daily Mission for joining a room
            fetch("/api/missions/daily", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ type: "room", amount: 1 })
            }).then(() => window.dispatchEvent(new Event("promodo_mission_progress"))).catch(console.error);

          } else {
            toast.error(t("roomJoinError"));
          }
        } else {
          toast.error(t("roomNotFound"));
        }
      } else {
        toast.error(t("roomListError"));
      }
    } catch (e) {
      console.error(e);
      toast.error(t("systemError"));
    }
  };

  const handleJoinPublic = async (room: any) => {
    try {
      const res = await fetch(`/api/rooms/${room.id}/join`, { method: "POST" });
      if (!res.ok) {
        toast.error(t("roomJoinError"));
        return;
      }
      
      roomCache[room.id] = room;
      onJoinRoom(room);
      toast.success(t("roomJoined"));
      
      // Update Daily Mission for joining a room
      fetch("/api/missions/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "room", amount: 1 })
      }).then(() => window.dispatchEvent(new Event("promodo_mission_progress"))).catch(console.error);

    } catch (e) { console.error(e); }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-5 border-b border-white/10">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Phòng Học Ảo
        </h2>
        <p className="text-white/50 text-xs mt-1">Học cùng bạn bè, tăng động lực x2!</p>
      </div>

      {/* Join by code */}
      <div className="px-5 pt-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Nhập mã phòng..."
            maxLength={6}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white uppercase tracking-widest font-mono focus:outline-none focus:border-primary/50"
          />
          <button onClick={joinByCode} className="px-4 py-2.5 bg-primary hover:bg-primary/90 rounded-xl text-white text-sm font-semibold transition-colors">
            Vào
          </button>
        </div>
      </div>

      {/* Create Room */}
      <div className="px-5 pt-3">
        {!showCreate ? (
          <button onClick={() => setShowCreate(true)} className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-white/20 hover:border-primary/40 rounded-xl text-white/60 hover:text-primary transition-colors text-sm">
            <Plus className="w-4 h-4" /> Tạo phòng mới
          </button>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
            <input
              type="text" value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Tên phòng..." maxLength={30}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
            />
            <div className="flex items-center justify-between mt-2">
              <div 
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setIsPrivate(!isPrivate)}
              >
                <div className={`w-8 h-4 rounded-full relative transition-colors shadow-inner ${isPrivate ? "bg-primary" : "bg-white/10"}`}>
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all shadow-md ${isPrivate ? "right-0.5" : "left-0.5"}`} />
                </div>
                <span className="text-white/60 text-xs">Phòng riêng tư</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowCreate(false)} className="px-3 py-1.5 text-white/50 hover:text-white text-xs transition-colors">Hủy</button>
                <button onClick={createRoom} disabled={creating} className="px-4 py-1.5 bg-primary hover:bg-primary/90 rounded-lg text-white text-xs font-semibold transition-colors disabled:opacity-50">
                  {creating ? <Loader2 className="w-3 h-3 animate-spin" /> : "Tạo"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Room list */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
        <h3 className="text-white/40 text-xs font-semibold uppercase tracking-wider">Phòng công khai</h3>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-10 h-10 text-white/20 mx-auto mb-2" />
            <p className="text-white/40 text-sm">Chưa có phòng nào. Hãy tạo phòng đầu tiên!</p>
          </div>
        ) : (
          rooms.map(room => (
            <button key={room.id} onClick={() => handleJoinPublic(room)}
              className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition-colors group">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 overflow-hidden">
                <h4 className="text-white text-sm font-semibold truncate">{room.name}</h4>
                <p className="text-white/40 text-[11px]">
                  {room._count.members}/{room.maxMembers} người • Host: {room.host.name}
                </p>
              </div>
              <div className={`px-2 py-1 rounded-full text-[10px] font-semibold ${
                room.timerStatus === "focusing" ? "bg-red-500/20 text-red-400" :
                room.timerStatus === "break" ? "bg-blue-500/20 text-blue-400" :
                "bg-white/10 text-white/40"
              }`}>
                {room.timerStatus === "focusing" ? "🔥 Đang Focus" : room.timerStatus === "break" ? "☕ Nghỉ" : "💤 Chờ"}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Main Room View ───
function RoomView({ roomId, onLeave }: { roomId: string; onLeave: () => void }) {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const [room, setRoom] = useState<RoomData | null>(roomCache[roomId] || null);
  const [loading, setLoading] = useState(!roomCache[roomId]);
  const [showShareCard, setShowShareCard] = useState(false);
  const [activeTab, setActiveTab] = useState<"members" | "tasks" | "chat" | "stats" | "music" | "settings">("members");
  const [codeCopied, setCodeCopied] = useState(false);
  const { setRoomId, setIsRunning, setMode, resetTimer, setTimeLeft } = useTimerStore();
  const [showCheckin, setShowCheckin] = useState(false);
  const [checkinTimeout, setCheckinTimeout] = useState<NodeJS.Timeout | null>(null);
  const [newTask, setNewTask] = useState("");
  const [afkUsers, setAfkUsers] = useState<Set<string>>(new Set());
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const [isSynced, setIsSynced] = useState(true);
  const [kickConfirmId, setKickConfirmId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, userId: string, userName: string } | null>(null);

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const isHost = session?.user?.id === room?.hostId;
  const { setSpotifyId, spotifyId } = useAmbientStore();
  const [newMusicId, setNewMusicId] = useState("");
  const [musicVotes, setMusicVotes] = useState<Record<string, string[]>>({});
  const [friendIds, setFriendIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (session?.user?.id) {
      fetch("/api/friends")
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) {
            const ids = data.map(f => f.user.id);
            setFriendIds(new Set(ids));
          }
        })
        .catch(console.error);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    const syncStr = localStorage.getItem("promodo_room_sync");
    if (syncStr !== null) setIsSynced(syncStr === "true");

    fetchRoom();
    
    const channel = supabase.channel(`presence-room-${roomId}`);
    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'timer-update' }, ({ payload: data }) => {
        if (!isSynced) return;
        setRoom(prev => prev ? { 
          ...prev, 
          timerStatus: data.timerStatus, 
          timerStart: data.timerStart, 
          timerDuration: data.timerDuration 
        } : prev);
        
        if (data.mode) {
          setMode(data.mode);
        }
        
        if (data.timerStatus === "idle") {
          setIsRunning(false);
        } else {
          setIsRunning(true);
          if (data.timerStatus === "focusing") scheduleCheckin();
        }
      })
      .on('broadcast', { event: 'member-joined' }, ({ payload: data }) => {
        toast(`👋 ${data.userName} ${t("roomJoined")}`);
        fetchRoom();
      })
      .on('broadcast', { event: 'member-left' }, () => {
        fetchRoom();
      })
      .on('broadcast', { event: 'member-kicked' }, ({ payload }) => {
        if (payload.userId === session?.user?.id) {
          toast.error(t("userKicked"));
          setRoomId(null);
        } else {
          fetchRoom();
        }
      })
      .on('broadcast', { event: 'checkin-confirmed' }, ({ payload: data }) => {
        setAfkUsers(prev => { const s = new Set(prev); s.delete(data.userId); return s; });
      })
      .on('broadcast', { event: 'music-update' }, ({ payload: data }) => {
        setSpotifyId(data.playlistId);
        setRoom(prev => prev ? { ...prev, currentPlaylist: data.playlistId } : null);
        toast(t("musicChanged"));
      })
      .on('broadcast', { event: 'music-votes-update' }, ({ payload: data }) => {
        setMusicVotes(data.votes);
      })
      .on('broadcast', { event: 'stats-update' }, ({ payload: data }) => {
        setRoom(prev => {
          if (!prev) return prev;
          // Update the specific member's totalPomodoros in the leaderboard
          const updatedMembers = prev.members.map(m => {
            if (m.user.id === data.userId) {
              return { ...m, user: { ...m.user, totalPomodoros: data.totalPomodoros } };
            }
            return m;
          });
          
          return { ...prev, members: updatedMembers };
        });
        
        // Update today's stats if it was broadcasted
        if (data.roomStats) {
          setTodayStats(data.roomStats);
        }
      })
      .on('broadcast', { event: 'task-added' }, ({ payload: task }) => {
        setRoom(prev => prev ? { ...prev, tasks: [...prev.tasks, task] } : prev);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Tell others we joined
          channel.send({
            type: "broadcast",
            event: "member-joined",
            payload: { userId: session?.user?.id, userName: session?.user?.name }
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
      if (checkinTimeout) clearTimeout(checkinTimeout);
    };
  }, [roomId, isSynced]);

  useEffect(() => {
    const handleRoomAction = (e: CustomEvent) => {
      const { action, duration, payload: data } = e.detail;
      
      // Update local state instantly
      setRoom(prev => prev ? { 
        ...prev, 
        timerStatus: data.timerStatus, 
        timerStart: data.timerStart, 
        timerDuration: data.timerDuration 
      } : prev);
      
      if (data.mode) {
        setMode(data.mode);
      }
      
      if (data.timerStatus === "idle") {
        setIsRunning(false);
      } else {
        setIsRunning(true);
        if (data.timerStatus === "focusing") scheduleCheckin();
      }

      // Send Broadcast to others
      channelRef.current?.send({
        type: "broadcast",
        event: "timer-update",
        payload: data
      });

      // Background API sync
      fetch(`/api/rooms/${roomId}/timer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, duration })
      }).catch(err => console.error("API error", err));
    };

    const handleRoomMusic = (e: CustomEvent) => {
      const { playlistId } = e.detail;
      channelRef.current?.send({
        type: "broadcast",
        event: "music-update",
        payload: { playlistId }
      });
      fetch(`/api/rooms/${roomId}/music`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "change", spotifyId: playlistId })
      }).catch(err => console.error("API error", err));
    };

    const handleRewardEarned = (e: CustomEvent) => {
      if (e.detail.totalPomodoros) {
        channelRef.current?.send({
          type: "broadcast",
          event: "stats-update",
          payload: { 
            userId: session?.user?.id, 
            totalPomodoros: e.detail.totalPomodoros,
            roomStats: e.detail.roomStats
          }
        });
        
        if (e.detail.roomStats) {
          setTodayStats(e.detail.roomStats);
        }
      }
    };

    window.addEventListener('room-timer-action', handleRoomAction as EventListener);
    window.addEventListener('room-music-action', handleRoomMusic as EventListener);
    window.addEventListener('promodo_reward_earned', handleRewardEarned as EventListener);
    
    return () => {
      window.removeEventListener('room-timer-action', handleRoomAction as EventListener);
      window.removeEventListener('room-music-action', handleRoomMusic as EventListener);
      window.removeEventListener('promodo_reward_earned', handleRewardEarned as EventListener);
    };
  }, [roomId, session?.user?.id]);

  useEffect(() => {
    if (room) {
      setRoomId(room.id, isHost);
    }
  }, [room?.id, isHost]);


  // Timer Sync (Handled by FloatingTimer, we just set the initial target here)
  useEffect(() => {
    if (!room || !isSynced) return;
    
    if (room.timerStatus === "paused" && room.timerDuration) {
      setTimeLeft(room.timerDuration);
      setIsRunning(false);
      localStorage.setItem("promodo_timer_paused", room.timerDuration.toString());
      localStorage.removeItem("promodo_timer_target");
    } else if (room.timerStatus !== "idle" && room.timerStart && room.timerDuration) {
      const elapsed = Math.floor((Date.now() - new Date(room.timerStart).getTime()) / 1000);
      const remaining = Math.max(0, room.timerDuration - elapsed);
      setTimeLeft(remaining);
      localStorage.setItem("promodo_timer_target", (Date.now() + remaining * 1000).toString());
      setIsRunning(true);
    } else {
      setIsRunning(false);
      let configTime = 25 * 60;
      
      if (room.timerDuration) {
        configTime = room.timerDuration;
      } else {
        const savedMode = localStorage.getItem("promodo_timer_mode") || "focus";
        const focusLen = parseInt(localStorage.getItem("promodo_focus_length") || "25", 10);
        const breakLen = parseInt(localStorage.getItem("promodo_break_length") || "5", 10);
        configTime = (savedMode === "focus" ? focusLen : breakLen) * 60;
      }
      
      setTimeLeft(configTime);
      useTimerStore.getState().setInitialTime(configTime);
      localStorage.removeItem("promodo_timer_target");
    }
  }, [room?.timerStatus, room?.timerStart, room?.timerDuration, isSynced]);

  const scheduleCheckin = () => {
    // AFK disabled by user request
  };

  const handleCheckin = async () => {
    setShowCheckin(false);
    if (checkinTimeout) clearTimeout(checkinTimeout);
    // Client-side broadcast
    channelRef.current?.send({
      type: "broadcast",
      event: "checkin-confirmed",
      payload: { userId: session?.user?.id, userName: session?.user?.name }
    });
    
    fetch(`/api/rooms/${roomId}/checkin`, { method: "POST" }).catch(e => console.error(e));
    toast.success(t("confirmSuccess"));
    scheduleCheckin();
  };

  const fetchRoom = async () => {
    try {
      const res = await fetch(`/api/rooms/${roomId}`);
      if (res.ok) {
        const data = await res.json();
        roomCache[roomId] = data;
        setRoom(data);
        if (data.currentPlaylist) setSpotifyId(data.currentPlaylist);
        if (data.musicVotes) {
          try { setMusicVotes(JSON.parse(data.musicVotes)); } catch(e) {}
        }
      } else {
        toast.error(t("roomClosed"));
        resetTimer();
        onLeave();
        return;
      }
    } catch (e) { 
      console.error(e); 
      toast.error(t("roomConnectError"));
      onLeave();
    }
    setLoading(false);
  };

  const handleTimerAction = async (action: string, duration?: number) => {
    await fetch(`/api/rooms/${roomId}/timer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, duration })
    });
  };

  const handleLeave = async () => {
    // Client-side broadcast
    channelRef.current?.send({
      type: "broadcast",
      event: "member-left",
      payload: { userId: session?.user?.id }
    });

    fetch(`/api/rooms/${roomId}/leave`, { method: "POST" }).catch(e => console.error(e));
    resetTimer();
    onLeave();
  };

  const copyCode = () => {
    navigator.clipboard.writeText(room?.code || "");
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const addTask = async () => {
    if (!newTask.trim() || !room) return;
      const task = {
        id: Date.now().toString(),
        content: newTask,
        isCompleted: false,
        user: { id: session?.user?.id || "", name: session?.user?.name || "", image: session?.user?.image || null }
      };

      // Client-side broadcast
      channelRef.current?.send({
        type: "broadcast",
        event: "task-added",
        payload: task
      });

      // Optimistic UI
      setRoom(prev => prev ? { ...prev, tasks: [...prev.tasks, task] } : prev);
      setNewTask("");

      fetch(`/api/rooms/${room.id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newTask })
      }).catch(e => console.error(e));
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const [todayStats, setTodayStats] = useState<any>(null);

  useEffect(() => {
    if (room?.stats?.[0]) {
      setTodayStats(room.stats[0]);
    }
  }, [room?.stats]);

  const handleSyncToggle = () => {
    const next = !isSynced;
    setIsSynced(next);
    localStorage.setItem("promodo_room_sync", String(next));
    window.dispatchEvent(new CustomEvent("promodo_room_sync_changed", { detail: { isSynced: next } }));
    toast.success(next ? t("syncOn") : t("syncOff"));
  };

  const handleKickUser = async (userId: string) => {
    if (!isHost) return;
    
    setKickConfirmId(null);
    try {
      await fetch(`/api/rooms/${roomId}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: userId }) // API needs to handle kicking
      });
      
      // Broadcast kick via Supabase
      channelRef.current?.send({
        type: "broadcast",
        event: "member-kicked",
        payload: { userId }
      });
      
      toast.success(t("userKicked"));
      fetchRoom();
    } catch(e) {
      toast.error(t("userKickError"));
    }
  };

  if (loading || !room) {
    return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  }

  const memberCount = room.members.length;
  const buffPercent = memberCount >= 4 ? 25 : memberCount >= 2 ? 10 : 0;

  return (
    <div className="flex flex-col h-full relative allow-context-menu">
      {/* AFK Check-in Popup */}
      <AnimatePresence>
        {showCheckin && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
          >
            <div className="bg-[#1a1a2e] border border-primary/30 rounded-2xl p-8 text-center max-w-xs shadow-[0_0_40px_rgba(99,102,241,0.3)]">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Timer className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Bạn vẫn đang tập trung?</h3>
              <p className="text-white/50 text-sm mb-6">Bấm xác nhận trong 30 giây</p>
              <button onClick={handleCheckin} className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-colors text-lg">
                ✅ Tôi vẫn đang học!
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context Menu for Users */}
      {typeof window !== "undefined" && createPortal(
        <AnimatePresence>
          {contextMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed z-[9999] bg-[#1a1a2e] border border-white/20 rounded-xl shadow-xl overflow-hidden min-w-[160px]"
              style={{ top: contextMenu.y, left: contextMenu.x }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-3 py-2 border-b border-white/10 bg-white/5">
                <span className="text-white text-xs font-bold truncate block">{contextMenu.userName}</span>
              </div>
              <div className="py-1">
                {contextMenu.userId === session?.user?.id ? (
                  <button 
                    onClick={() => { 
                      setContextMenu(null);
                      window.dispatchEvent(new CustomEvent("promodo_open_dashboard"));
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    👤 {t("yourProfile")}
                  </button>
                ) : (
                  <>
                    {friendIds.has(contextMenu.userId) ? (
                      <div className="w-full text-left px-4 py-2 text-sm text-green-400 font-medium">
                        🤝 {t("friendsAlready")}
                      </div>
                    ) : (
                      <button 
                        onClick={async () => { 
                          try {
                            const res = await fetch("/api/friends", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ action: "add", friendId: contextMenu.userId })
                            });
                            if (res.ok) {
                              toast.success("Đã gửi lời mời kết bạn!"); 
                              setFriendIds(prev => new Set(prev).add(contextMenu.userId));
                            } else {
                              toast.error("Không thể gửi lời mời.");
                            }
                          } catch(e) {
                            toast.error("Lỗi gửi lời mời.");
                          }
                          setContextMenu(null); 
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        🤝 {t("addFriend")}
                      </button>
                    )}
                    <button 
                      onClick={() => { 
                        setContextMenu(null);
                        window.dispatchEvent(new CustomEvent("promodo_open_dm", { 
                          detail: { 
                            id: contextMenu.userId, 
                            name: contextMenu.userName
                          } 
                        }));
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      💬 {t("sendMessage")}
                    </button>
                  </>
                )}
                
                {isHost && contextMenu.userId !== session?.user?.id && (
                  <>
                    <div className="h-px bg-white/10 my-1" />
                    <button 
                      onClick={() => { setContextMenu(null); toast.error(t("muteDev")); }}
                      className="w-full text-left px-4 py-2 text-sm text-orange-400 hover:bg-orange-500/10 transition-colors"
                    >
                      🔇 {t("mute")}
                    </button>
                    <button 
                      onClick={() => { setContextMenu(null); handleKickUser(contextMenu.userId); }}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      🚪 {t("kick")}
                    </button>
                    <button 
                      onClick={() => { setContextMenu(null); toast.error(t("userBanned")); handleKickUser(contextMenu.userId); }}
                      className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 font-bold transition-colors"
                    >
                      🚫 {t("ban")}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Room Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-2">
          <button onClick={handleLeave} className="flex items-center gap-1 text-white/50 hover:text-white text-xs transition-colors">
            <ArrowLeft className="w-3 h-3" /> {t("leaveRoom")}
          </button>
          <button onClick={copyCode} className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1 rounded-full text-xs text-white/70 transition-colors">
            {codeCopied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            <span className="font-mono tracking-widest">{room.code}</span>
          </button>
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-white font-bold text-base truncate flex items-center gap-2">
            {room.name}
            {buffPercent > 0 && (
              <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full font-semibold">
                +{buffPercent}% XP 🔥
              </span>
            )}
          </h2>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-white/10">
        {[
          { id: "members", icon: Users, label: t("member") },
          { id: "tasks", icon: ListTodo, label: t("tasks") },
          { id: "chat", icon: MessageSquare, label: t("chat") },
          { id: "stats", icon: BarChart3, label: t("stats") },
          { id: "music", icon: Music, label: t("music") },
          { id: "settings", icon: Settings, label: t("settings") },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors border-b-2 ${
              activeTab === tab.id ? "text-primary border-primary" : "text-white/40 border-transparent hover:text-white/60"
            }`}>
            <div className="relative">
              <tab.icon className="w-4 h-4" />
              {tab.id === 'members' && (
                <span className="absolute -top-1.5 -right-2 bg-primary text-white text-[8px] font-bold px-1 rounded-full">
                  {memberCount}
                </span>
              )}
            </div>
            <span className="whitespace-nowrap truncate w-full text-center px-1">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Members Tab */}
        {activeTab === "members" && (
          <div className="p-4 space-y-2 relative">
            {room.members.map(m => (
              <div 
                key={m.user.id} 
                className={`flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer hover:border-primary/50 ${
                  afkUsers.has(m.user.id) ? "bg-gray-500/10 border-gray-500/20" : "bg-white/5 border-white/10"
                }`}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Calculate position to not go off screen
                  let x = e.clientX;
                  let y = e.clientY;
                  const menuWidth = 160;
                  const menuHeight = 220;
                  if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth - 10;
                  if (y + menuHeight > window.innerHeight) y = window.innerHeight - menuHeight - 10;
                  setContextMenu({ x, y, userId: m.user.id, userName: m.user.name });
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  let x = e.clientX;
                  let y = e.clientY;
                  const menuWidth = 160;
                  const menuHeight = 220;
                  if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth - 10;
                  if (y + menuHeight > window.innerHeight) y = window.innerHeight - menuHeight - 10;
                  setContextMenu({ x, y, userId: m.user.id, userName: m.user.name });
                }}
              >
                <div className="relative pointer-events-none">
                  <Image src={m.user.image || "/default-avatar.png"} alt={m.user.name} width={36} height={36} className={`rounded-full ${afkUsers.has(m.user.id) ? "grayscale opacity-50" : ""}`} />
                  {m.user.id === room.hostId && (
                    <Crown className="absolute -top-1 -right-1 w-3.5 h-3.5 text-yellow-400" />
                  )}
                  {afkUsers.has(m.user.id) && (
                    <span className="absolute -bottom-1 -right-1 text-[10px]">💤</span>
                  )}
                  <div className={`absolute bottom-0 left-0 w-2.5 h-2.5 rounded-full border-2 border-[#111] ${
                    afkUsers.has(m.user.id) ? "bg-gray-500" :
                    room.timerStatus === "focusing" ? "bg-red-500" :
                    room.timerStatus === "break" ? "bg-blue-500" :
                    "bg-green-500"
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-semibold flex items-center gap-1">
                    {m.user.name}
                    {afkUsers.has(m.user.id) && <span className="text-[10px] text-gray-400">(AFK)</span>}
                  </p>
                  <p className="text-white/40 text-[11px]">Lv.{m.user.level} • {m.user.totalPomodoros} 🍅</p>
                </div>
                {/* Replaced quick actions with Context Menu */}
              </div>
            ))}

            {/* Room Challenges */}
            {room.challenges && room.challenges.length > 0 && (
              <div className="mt-4">
                <h4 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">🎯 Thử thách phòng</h4>
                {room.challenges.map(c => (
                  <div key={c.id} className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3 mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-xs font-semibold">{c.title}</span>
                      <span className="text-yellow-400 text-[10px]">+{c.rewardCoins}🪙 +{c.rewardXp}XP</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500 rounded-full transition-all" style={{ width: `${Math.min((c.currentCount / c.targetCount) * 100, 100)}%` }} />
                    </div>
                    <p className="text-white/40 text-[10px] mt-1">{c.currentCount}/{c.targetCount}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === "tasks" && (
          <div className="p-4">
            <form onSubmit={(e) => { e.preventDefault(); addTask(); }} className="flex gap-2 mb-4">
              <input
                type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)}
                placeholder={t("todayWillDo")}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50"
              />
              <button type="submit" className="px-3 py-2 bg-primary/20 text-primary hover:bg-primary/30 rounded-xl text-xs font-semibold transition-colors">
                Thêm
              </button>
            </form>
            <div className="space-y-2">
              {room.tasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${
                    task.isCompleted ? "bg-green-500 border-green-500" : "border-white/30 hover:border-primary"
                  }`}>
                    {task.isCompleted && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${task.isCompleted ? "text-white/40 line-through" : "text-white"}`}>{task.content}</p>
                    <p className="text-white/30 text-[10px]">{task.user.name}</p>
                  </div>
                </div>
              ))}
              {room.tasks.length === 0 && (
                <p className="text-white/30 text-sm text-center py-4">{t("noTasksYet")}</p>
              )}
            </div>
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === "chat" && (
          <ChatPanel roomId={roomId} />
        )}

        {/* Stats Tab */}
        
        {/* Music Tab */}
        {activeTab === "music" && (
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-white/80 text-sm font-semibold">{t("personalReport")}</h4>
              <button onClick={() => setShowShareCard(true)} className="px-3 py-1.5 bg-primary/20 text-primary hover:bg-primary/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors">
                <Download className="w-3 h-3" /> {t("summaryCard")}
              </button>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h4 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">{t("nowPlaying")}</h4>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
                  <Music className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">YouTube ID: {room.currentPlaylist || spotifyId}</p>
                  <p className="text-white/40 text-xs">{t("syncPlayingForRoom")}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h4 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">{t("nominateMusic")}</h4>
              <div className="flex gap-2 mb-4">
                <input
                  type="text" value={newMusicId} onChange={(e) => setNewMusicId(e.target.value)}
                  placeholder={t("enterYoutubeId")}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50"
                />
                <button onClick={async () => {
                  if (!newMusicId.trim()) return;
                  
                  // Client-side broadcast
                  const action = isHost ? "set" : "vote";
                  if (isHost) {
                    channelRef.current?.send({
                      type: "broadcast",
                      event: "music-update",
                      payload: { playlistId: newMusicId }
                    });
                  }
                  
                  fetch(`/api/rooms/${roomId}/music`, {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action, spotifyId: newMusicId })
                  }).catch(e => console.error(e));
                  
                  if (isHost) {
                    setSpotifyId(newMusicId);
                    setRoom(prev => prev ? { ...prev, currentPlaylist: newMusicId } : null);
                  }
                  setNewMusicId("");
                }} className="px-4 py-2 bg-primary/20 text-primary hover:bg-primary/30 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap">
                  {isHost ? t("changeMusic") : t("nominate")}
                </button>
              </div>

              {!isHost && Object.keys(musicVotes).length > 0 && (
                <div className="space-y-2">
                  <p className="text-white/40 text-[10px] uppercase">{t("voteList")}</p>
                  {Object.entries(musicVotes).map(([id, voters]) => (
                    <div key={id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/5">
                      <span className="text-white text-xs font-mono truncate flex-1 mr-2" title={id}>{id}</span>
                      <button onClick={async () => {
                        // Optimistic UI for voting can be complex, but we'll just fire the request
                        // because we aren't broadcasting music-votes-update from client yet.
                        fetch(`/api/rooms/${roomId}/music`, {
                          method: "POST", headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ action: "vote", spotifyId: id })
                        }).catch(e => console.error(e));
                      }} className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] ${voters.includes(session?.user?.id || "") ? "bg-primary text-white" : "bg-white/10 text-white/60 hover:bg-white/20"}`}>
                        <ThumbsUp className="w-3 h-3" /> {voters.length}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "stats" && (
          <div className="p-4 space-y-4">
            {/* Today's stats */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h4 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3"> {t("today")}</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{todayStats?.totalPomodoros || 0}</p>
                  <p className="text-white/40 text-[10px]">Pomodoro</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{todayStats?.totalFocusMinutes || 0}m</p>
                  <p className="text-white/40 text-[10px]">{t("totalFocus")}</p>
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h4 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3"> {t("leaderboard")}</h4>
              <div className="space-y-2">
                {room.members
                  .sort((a, b) => b.user.totalPomodoros - a.user.totalPomodoros)
                  .map((m, i) => (
                    <div key={m.user.id} className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        i === 0 ? "bg-yellow-500/20 text-yellow-400" :
                        i === 1 ? "bg-gray-400/20 text-gray-300" :
                        i === 2 ? "bg-orange-500/20 text-orange-400" :
                        "bg-white/5 text-white/30"
                      }`}>
                        {i + 1}
                      </span>
                      <Image src={m.user.image || "/default-avatar.png"} alt="" width={24} height={24} className="rounded-full" />
                      <span className="text-white text-xs flex-1">{m.user.name}</span>
                      <span className="text-white/40 text-[10px]">{m.user.totalPomodoros} 🍅</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Achievements */}
            {room.achievements && room.achievements.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h4 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">🏅 Huy hiệu phòng</h4>
                <div className="flex flex-wrap gap-2">
                  {room.achievements.map((a, i) => (
                    <div key={i} className="px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-[10px] text-primary font-semibold">
                      {a.type === "100_HOURS" ? "⏰ 100 Giờ" :
                       a.type === "7_DAY_STREAK" ? "🔥 7 Ngày" :
                       a.type === "NO_AFK_WEEK" ? "💪 Không AFK" : a.type}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Weekly chart */}
            {room.stats && room.stats.length > 1 && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h4 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">📈 7 ngày qua</h4>
                <div className="flex items-end gap-1 h-20">
                  {room.stats.slice(0, 7).reverse().map((s, i) => {
                    const maxMin = Math.max(...room.stats.map(x => x.totalFocusMinutes), 1);
                    const pct = (s.totalFocusMinutes / maxMin) * 100;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full bg-primary/30 rounded-t" style={{ height: `${Math.max(pct, 5)}%` }} />
                        <span className="text-[8px] text-white/30">{s.date.slice(5)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === "settings" && (
          <div className="p-4 space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h4 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">{t("personalSettings")}</h4>
              {isHost ? (
                <div className="text-center py-4">
                  <div className="w-10 h-10 bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Crown className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-white text-sm font-semibold">{t("youAreHost")}</p>
                  <p className="text-white/40 text-xs mt-1">{t("hostClockDesc")}</p>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-white text-sm font-semibold">{t("syncPomodoro")}</span>
                    <p className="text-white/40 text-[10px] uppercase tracking-wider mt-0.5">{t("timeSyncsWithRoom")}</p>
                  </div>
                  <div 
                    onClick={handleSyncToggle}
                    className={`w-12 h-7 rounded-full relative cursor-pointer transition-colors shadow-inner ${isSynced ? "bg-primary" : "bg-white/10"}`}
                  >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${isSynced ? "right-1" : "left-1"}`} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Export: Main Widget ───

function BreakMiniGame() {
  const [score, setScore] = useState(0);
  const [bubbles, setBubbles] = useState<{ id: number, x: number, y: number }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBubbles(prev => {
        if (prev.length > 10) return prev;
        return [...prev, {
          id: Date.now(),
          x: Math.random() * 80 + 10,
          y: Math.random() * 80 + 10
        }];
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-48 bg-white/5 border border-white/10 rounded-xl overflow-hidden mt-4">
      <div className="absolute top-2 left-2 text-white/60 text-xs font-semibold">Điểm: {score}</div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 text-white/50 text-xs text-center p-4">
        Đập bóng nước giải tỏa căng thẳng trong lúc nghỉ giải lao~
      </div>
      <AnimatePresence>
        {bubbles.map(b => (
          <motion.div
            key={b.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, y: [0, -20, 0], transition: { repeat: Infinity, duration: 2 } }}
            exit={{ scale: 1.5, opacity: 0, transition: { duration: 0.2 } }}
            onClick={() => {
              setScore(s => s + 1);
              setBubbles(prev => prev.filter(bubble => bubble.id !== b.id));
            }}
            className="absolute w-8 h-8 rounded-full bg-blue-400/30 border border-blue-300/50 cursor-pointer hover:bg-blue-300/50 flex items-center justify-center shadow-[0_0_10px_rgba(96,165,250,0.5)]"
            style={{ left: `${b.x}%`, top: `${b.y}%` }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

export function VirtualRoomWidget() {
  const { roomId, setRoomId } = useTimerStore();
  const { data: session } = useSession();
  const router = useRouter();

  if (!session) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-black/40">
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-white font-semibold mb-2">Đăng nhập để vào phòng</h3>
        <p className="text-white/50 text-xs mb-6">Học cùng bạn bè và tăng động lực x2!</p>
        <button 
          onClick={() => router.push("/login")} 
          className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-xl font-bold transition-colors"
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  return roomId ? (
    <RoomView roomId={roomId} onLeave={() => setRoomId(null)} />
  ) : (
    <RoomLobby onJoinRoom={(room) => setRoomId(room.id)} />
  );
}
