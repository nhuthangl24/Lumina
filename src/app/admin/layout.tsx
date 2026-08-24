import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { LayoutDashboard, Users, Store, Users2, LogOut, Target, Bell } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role?.toString().toUpperCase() !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white/5 border-r border-white/10 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-all">
              <div className="w-3 h-3 bg-white rounded-sm" />
            </div>
            <span className="font-heading font-bold text-xl tracking-wider text-white">
              Promodo<span className="text-primary">Z</span> Admin
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-white/70 hover:text-white">
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-white/70 hover:text-white">
            <Users className="w-5 h-5" />
            Users
          </Link>
          <Link href="/admin/marketplace" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-white/70 hover:text-white">
            <Store className="w-5 h-5" />
            Marketplace
          </Link>
          <Link href="/admin/rooms" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-white/70 hover:text-white">
            <Users2 className="w-5 h-5" />
            Active Rooms
          </Link>
          <Link href="/admin/missions" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-white/70 hover:text-white">
            <Target className="w-5 h-5" />
            Missions
          </Link>
          <Link href="/admin/notifications" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-white/70 hover:text-white">
            <Bell className="w-5 h-5" />
            Notifications
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/20 text-red-400 transition-colors">
            <LogOut className="w-5 h-5" />
            Exit Admin
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#050505] to-[#050505]">
        <header className="h-16 shrink-0 border-b border-white/10 bg-black/40 backdrop-blur-xl flex items-center justify-between px-8">
          <h1 className="font-heading font-semibold text-lg">Admin Control Panel</h1>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium">{session.user.name}</p>
              <p className="text-xs text-primary">Super Admin</p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={session.user.image || "/default-avatar.png"} alt="Admin" className="w-10 h-10 rounded-full border border-white/20" />
          </div>
        </header>
        
        <div className="flex-1 min-h-0 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}
