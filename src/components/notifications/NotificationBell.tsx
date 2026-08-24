"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  id: string;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        
        // Cần kết hợp với LocalStorage để lưu trạng thái "isRead" cho các thông báo SYSTEM cục bộ
        const localReads = JSON.parse(localStorage.getItem("promodo_read_notifications") || "[]");
        
        const mergedData = data.map((n: Notification) => {
          if (n.type === "SYSTEM" && localReads.includes(n.id)) {
            return { ...n, isRead: true };
          }
          return n;
        });

        setNotifications(mergedData);
      }
    } catch (error) {
      console.error("Lỗi khi tải thông báo", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (id: string, type: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));

    if (type === "SYSTEM") {
      const localReads = JSON.parse(localStorage.getItem("promodo_read_notifications") || "[]");
      if (!localReads.includes(id)) {
        localReads.push(id);
        localStorage.setItem("promodo_read_notifications", JSON.stringify(localReads));
      }
    } else {
      try {
        await fetch(`/api/notifications/${id}/read`, { method: "PUT" });
      } catch (err) {
        console.error("Lỗi khi đánh dấu đã đọc", err);
      }
    }
  };

  const markAllAsRead = async () => {
    const unreads = notifications.filter(n => !n.isRead);
    unreads.forEach(n => markAsRead(n.id, n.type));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-colors relative"
      >
        <Bell className="w-5 h-5 text-white" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-black">
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-80 max-h-[400px] bg-[#1a1a1a]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
              <h3 className="font-bold text-white">Thông báo</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1 font-semibold"
                >
                  <Check className="w-3 h-3" />
                  Đã đọc tất cả
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar flex flex-col gap-1">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-white/50 text-sm">
                  Không có thông báo nào.
                </div>
              ) : (
                notifications.map(n => (
                  <div 
                    key={n.id} 
                    onClick={() => markAsRead(n.id, n.type)}
                    className={`p-3 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-white/5 ${
                      !n.isRead ? 'bg-primary/10 hover:bg-primary/20' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {n.type === "SYSTEM" && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/20">
                              SYSTEM
                            </span>
                          )}
                          <h4 className={`text-sm font-semibold ${!n.isRead ? 'text-white' : 'text-white/70'}`}>
                            {n.title}
                          </h4>
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed whitespace-pre-wrap">{n.content}</p>
                        <p className="text-[10px] text-white/40 mt-2">
                          {new Date(n.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                      {!n.isRead && (
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
