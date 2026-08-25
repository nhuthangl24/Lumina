"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Smile, Loader2, ArrowLeft, MessageSquare } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    image: string | null;
    level: number;
  };
}

export function ChatPanel({ roomId = null, initialTarget = null }: { roomId?: string | null, initialTarget?: any }) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Private chat states
  const [friends, setFriends] = useState<any[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<any | null>(initialTarget);

  useEffect(() => {
    if (!roomId && !selectedFriend) {
      fetchFriends();
    } else {
      fetchMessages();
    }
  }, [roomId, selectedFriend]);

  useEffect(() => {
    if (!roomId && !selectedFriend) return;
    if (!session?.user?.id) return;

    let channelName = "";
    if (roomId) {
      channelName = `presence-room-${roomId}`;
    } else if (selectedFriend) {
      const minId = session.user.id < selectedFriend.id ? session.user.id : selectedFriend.id;
      const maxId = session.user.id > selectedFriend.id ? session.user.id : selectedFriend.id;
      channelName = `private-chat-${minId}-${maxId}`;
    }

    if (!channelName) return;

    const channel = supabase.channel(channelName);

    channel.on('broadcast', { event: 'new-message' }, ({ payload: msg }) => {
      setMessages(prev => [...prev, msg as Message]);
      setTimeout(scrollToBottom, 100);
    }).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, selectedFriend, session?.user?.id]);

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/friends");
      if (res.ok) {
        const data = await res.json();
        setFriends(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      let url = `/api/chat/messages`;
      if (roomId) url += `?roomId=${roomId}`;
      else if (selectedFriend) url += `?friendId=${selectedFriend.id}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        setTimeout(scrollToBottom, 100);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !session?.user) return;

    const content = inputValue;
    setInputValue("");

    try {
      const body: any = { content, roomId };
      let channelName = "";

      if (roomId) {
        channelName = `presence-room-${roomId}`;
      } else if (selectedFriend) {
        body.receiverId = selectedFriend.id;
        const minId = session.user.id < selectedFriend.id ? session.user.id : selectedFriend.id;
        const maxId = session.user.id > selectedFriend.id ? session.user.id : selectedFriend.id;
        channelName = `private-chat-${minId}-${maxId}`;
      }

      // Optimistic update & Client-side broadcast (0ms delay)
      if (channelName) {
        const msg: Message = {
          id: Date.now().toString(),
          content,
          createdAt: new Date().toISOString(),
          sender: {
            id: session.user.id,
            name: session.user.name || "",
            image: session.user.image || null,
            level: (session.user as any).level || 1
          }
        };

        // Broadcast to others immediately
        supabase.channel(channelName).send({
          type: "broadcast",
          event: "new-message",
          payload: msg
        });

        // Optimistically update our own UI
        setMessages(prev => [...prev, msg]);
        setTimeout(scrollToBottom, 100);
      }

      // Save to database in the background
      fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }).catch(e => console.error(e));
      
    } catch (e) {
      console.error(e);
    }
  };

  if (loading && !friends.length && !messages.length) {
    return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  }

  // View: Friends List
  if (!roomId && !selectedFriend) {
    return (
      <div className="flex flex-col h-full overflow-y-auto custom-scrollbar p-4 space-y-2">
        {friends.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/40">
            <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
            <p>Chưa có bạn bè nào để trò chuyện.</p>
          </div>
        ) : (
          friends.map(f => {
            const user = f.user;
            return (
              <div 
                key={f.id} 
                onClick={() => setSelectedFriend(user)}
                className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl cursor-pointer transition-colors"
              >
                <Image src={user.image || "/default-avatar.png"} alt={user.name} width={40} height={40} className="rounded-full" />
                <div className="flex-1 overflow-hidden">
                  <h4 className="text-white text-sm font-semibold truncate">{user.name}</h4>
                  <p className="text-white/40 text-xs">Level {user.level}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  }

  // View: Chat Messages
  return (
    <div className="flex flex-col h-full relative">
      {!roomId && selectedFriend && (
        <div className="flex items-center gap-3 p-3 border-b border-white/10 bg-white/5 shrink-0">
          <button 
            onClick={() => setSelectedFriend(null)}
            className="p-1.5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Image src={selectedFriend.image || "/default-avatar.png"} alt={selectedFriend.name} width={32} height={32} className="rounded-full" />
          <h3 className="text-white font-medium text-sm">{selectedFriend.name}</h3>
        </div>
      )}

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-white/40 text-sm">
            Chưa có tin nhắn nào.
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = session?.user?.id === msg.sender.id;
            return (
              <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                <Image 
                  src={msg.sender.image || "/default-avatar.png"} 
                  alt={msg.sender.name} 
                  width={36} 
                  height={36} 
                  className="rounded-full self-end border border-white/10" 
                />
                <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-white/40 mb-1">{msg.sender.name} • Lv.{msg.sender.level}</span>
                  <div className={`px-4 py-2 rounded-2xl ${isMe ? 'bg-primary text-white rounded-br-sm' : 'bg-white/10 text-white/90 rounded-bl-sm'}`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 border-t border-white/10 bg-black/20 shrink-0">
        <form onSubmit={sendMessage} className="relative">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="w-full bg-white/5 border border-white/10 rounded-full pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
          />
          <button 
            type="submit"
            disabled={!inputValue.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-primary rounded-full text-white disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
          >
            <Send className="w-4 h-4 -ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
