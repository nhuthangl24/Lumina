"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Timer,
  CheckSquare,
  Calendar,
  BarChart,
  Users,
  MessageSquare,
  Store,
  Settings,
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Focus", href: "/focus", icon: Timer },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Analytics", href: "/analytics", icon: BarChart },
  { name: "Study Rooms", href: "/rooms", icon: Users },
  { name: "Community", href: "/community", icon: MessageSquare },
  { name: "Marketplace", href: "/marketplace", icon: Store },
];

export function Sidebar() {
  const pathname = usePathname();

  if (pathname === "/focus") return null;

  return (
    <aside className="w-64 h-full bg-card border-r border-border backdrop-blur-xl flex flex-col p-4 shadow-2xl relative z-50">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)]">
          <Timer className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
          Lumina
        </span>
      </div>

      <nav className="flex-1 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.href} className="block relative">
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  isActive
                    ? "text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-border pt-4">
        <Link href="/settings" className="block relative">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-muted-foreground hover:text-foreground hover:bg-white/5">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
