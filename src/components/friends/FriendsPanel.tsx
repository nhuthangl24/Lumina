"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, UserPlus, Check, UserMinus, User } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { useLanguage } from "@/lib/LanguageContext";
import { supabase } from "@/lib/supabase";
import { useSession } from "next-auth/react";

interface FriendsPanelProps {
  onClose: () => void;
}

export function FriendsPanel({ onClose }: FriendsPanelProps) {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const [friends, setFriends] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"list" | "requests" | "add">("list");
  const [onlineUsers, setOnlineUsers] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    fetchFriends();
    
    // Connect to Supabase Presence Channel
    if (!session?.user?.id) return;
    const channel = supabase.channel('presence-global');

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const map = new Map<string, string>();
        for (const id in newState) {
          const presence = newState[id][0] as any;
          map.set(presence.userId, presence.status);
        }
        setOnlineUsers(map);
      })
      .on('broadcast', { event: 'status-update' }, ({ payload }) => {
        setOnlineUsers(prev => {
          const newMap = new Map(prev);
          newMap.set(payload.userId, payload.status);
          return newMap;
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            userId: session.user.id,
            status: 'online',
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  const fetchFriends = async () => {
    try {
      const res = await fetch("/api/friends");
      const data = await res.json();
      setFriends(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.length < 3) return toast.error(t("min3Chars"));
    setLoading(true);
    try {
      const res = await fetch(`/api/friends/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleAddFriend = async (friendId: string) => {
    const res = await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add", friendId })
    });
    if (res.ok) {
      toast.success(t("friendRequestSent"));
      fetchFriends();
    } else {
      toast.error(t("sendFailed"));
    }
  };

  const handleAcceptFriend = async (friendshipId: string) => {
    const res = await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "accept", friendshipId })
    });
    if (res.ok) {
      toast.success(t("friendAccepted"));
      fetchFriends();
    }
  };

  const handleRemoveFriend = async (friendshipId: string) => {
    const res = await fetch(`/api/friends?id=${friendshipId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success(t("deleted"));
      fetchFriends();
    }
  };

  const pendingRequests = friends.filter(f => f.status === "pending" && !f.isSender);
  const acceptedFriends = friends.filter(f => f.status === "accepted");

  return (
    <div className="fixed inset-0 z-[200]" onClick={onClose}>
      <motion.div
        initial={{ x: 400 }}
        animate={{ x: 0 }}
        exit={{ x: 400 }}
        className="absolute top-20 bottom-20 right-4 w-[360px] bg-black/60 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Bạn bè
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-white/70">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2 p-3 bg-white/5 border-b border-white/10">
          <button
            onClick={() => setActiveTab("list")}
            className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors ${activeTab === "list" ? "bg-primary text-white" : "text-white/60 hover:text-white"}`}
          >
            Danh sách
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors relative ${activeTab === "requests" ? "bg-primary text-white" : "text-white/60 hover:text-white"}`}
          >
            Lời mời
            {pendingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                {pendingRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("add")}
            className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors ${activeTab === "add" ? "bg-primary text-white" : "text-white/60 hover:text-white"}`}
          >
            Thêm bạn
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 lumina-scrollbar">
          {activeTab === "list" && (
            <>
              {acceptedFriends.length === 0 ? (
                <p className="text-white/50 text-center mt-10 text-sm">Chưa có bạn bè nào.</p>
              ) : (
                acceptedFriends.map(f => (
                  <div key={f.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="relative">
                      <Image src={f.user.image || "/default-avatar.png"} alt={f.user.name} width={40} height={40} className="rounded-full" />
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#111] ${(onlineUsers.get(f.user.id) === 'online') ? 'bg-green-500' : (onlineUsers.get(f.user.id) === 'focusing') ? 'bg-red-500' : (onlineUsers.get(f.user.id) === 'break') ? 'bg-blue-500' : 'bg-gray-500'}`} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h4 className="text-white text-sm font-semibold truncate">{f.user.name}</h4>
                      <p className="text-white/50 text-[11px] capitalize">{onlineUsers.get(f.user.id) || 'offline'}</p>
                    </div>
                    <button onClick={() => handleRemoveFriend(f.id)} className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-red-400" title="Hủy kết bạn">
                      <UserMinus className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === "requests" && (
            <>
              {pendingRequests.length === 0 ? (
                <p className="text-white/50 text-center mt-10 text-sm">Không có lời mời nào.</p>
              ) : (
                pendingRequests.map(f => (
                  <div key={f.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                    <Image src={f.user.image || "/default-avatar.png"} alt={f.user.name} width={40} height={40} className="rounded-full" />
                    <div className="flex-1 overflow-hidden">
                      <h4 className="text-white text-sm font-semibold truncate">{f.user.name}</h4>
                      <p className="text-white/50 text-[11px]">Đã gửi lời mời</p>
                    </div>
                    <button onClick={() => handleAcceptFriend(f.id)} className="p-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleRemoveFriend(f.id)} className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === "add" && (
            <div className="space-y-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Nhập tên hoặc email..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-primary outline-none"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <button type="submit" className="hidden" />
              </form>

              {loading ? (
                <p className="text-white/50 text-center text-sm">Đang tìm...</p>
              ) : (
                searchResults.map(user => {
                  const isFriend = friends.some(f => f.user.id === user.id);
                  return (
                    <div key={user.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                      <Image src={user.image || "/default-avatar.png"} alt={user.name} width={40} height={40} className="rounded-full" />
                      <div className="flex-1 overflow-hidden">
                        <h4 className="text-white text-sm font-semibold truncate">{user.name}</h4>
                        <p className="text-white/50 text-[11px]">Level {user.level}</p>
                      </div>
                      {!isFriend && (
                        <button onClick={() => handleAddFriend(user.id)} className="p-2 bg-primary/20 text-primary hover:bg-primary/30 rounded-lg">
                          <UserPlus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
