"use client";

import { motion } from "framer-motion";
import {
  CheckSquare,
  StickyNote,
  Music,
  Users,
  MessageSquare,
  LayoutDashboard,
  Settings,
  Store,
  Building2,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/lib/LanguageContext";

const DOCK_ITEMS: Array<{ id: string, icon: any, label: string, action?: boolean, href?: string }> = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", action: true },
  { id: "tasks", icon: CheckSquare, label: "Tasks", action: true },
  { id: "notes", icon: StickyNote, label: "Notes", action: true },
  { id: "music", icon: Music, label: "Music", action: true },
  { id: "friends", icon: Users, label: "Friends", action: true },
  { id: "chat", icon: MessageSquare, label: "Chat", action: true },
  { id: "room", icon: Building2, label: "Phòng Học", action: true },
  { id: "marketplace", icon: Store, label: "Marketplace", action: true },
  { id: "leaderboard", icon: Trophy, label: "Bảng xếp hạng", action: true },
  { id: "settings", icon: Settings, label: "Settings", action: true },
];

export function BottomDock({ onOpenPanel }: { onOpenPanel: (id: string) => void }) {
  const { t } = useLanguage();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [unreadState, setUnreadState] = useState<Record<string, boolean>>({
    chat: false,
    friends: false,
    tasks: false
  });

  // Listen for fake notifications or real events
  useEffect(() => {
    const handleNotify = (e: CustomEvent) => {
      setUnreadState(prev => ({ ...prev, [e.detail.id]: true }));
    };
    window.addEventListener("promodo_notify", handleNotify as EventListener);
    
    return () => {
      window.removeEventListener("promodo_notify", handleNotify as EventListener);
    };
  }, []);

  return (
    <div id="tour-dock" className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-end gap-3 p-3 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl z-50">
      {DOCK_ITEMS.map((item, index) => {
        const Icon = item.icon;
        const isHovered = hoveredIndex === index;
        const isNeighbor =
          hoveredIndex !== null && Math.abs(hoveredIndex - index) === 1;

        const scale = isHovered ? 1.4 : isNeighbor ? 1.15 : 1;
        const y = isHovered ? -15 : isNeighbor ? -8 : 0;

        const buttonContent = (
          <motion.div
            className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 border border-white/20 text-white shadow-lg cursor-pointer hover:bg-white/20 transition-colors"
            animate={{ scale, y }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <Icon className="w-5 h-5" />
            
            {/* Notification Badge */}
            {unreadState[item.id] && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#111] animate-pulse" />
            )}

            {/* Tooltip */}
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -top-10 px-3 py-1.5 bg-black/80 backdrop-blur-md rounded-lg text-xs font-medium whitespace-nowrap border border-white/10 shadow-xl pointer-events-none"
              >
                {t(item.id as any) || item.label}
              </motion.div>
            )}
          </motion.div>
        );

        if (item.href) {
          return (
            <Link key={item.id} href={item.href}>
              {buttonContent}
            </Link>
          );
        }

        return (
          <button key={item.id} onClick={() => {
            if (item.id === "leaderboard") {
              toast(t("comingSoon"), { description: t("featureInDev") });
              return;
            }
            if (unreadState[item.id]) setUnreadState(prev => ({ ...prev, [item.id]: false }));
            onOpenPanel(item.id);
          }}>
            {buttonContent}
          </button>
        );
      })}
    </div>
  );
}
