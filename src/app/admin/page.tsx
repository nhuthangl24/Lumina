import { prisma } from "@/lib/prisma";
import { Users, Users2, Timer, Store, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const [totalUsers, totalRooms, totalItems, roomStats] = await Promise.all([
    prisma.user.count(),
    prisma.room.count(),
    prisma.marketplaceItem.count(),
    prisma.roomStats.aggregate({
      _sum: { totalPomodoros: true, totalFocusMinutes: true }
    })
  ]);

  const stats = [
    { name: "Total Users", value: totalUsers.toString(), icon: Users, color: "text-blue-400", bg: "bg-blue-400/10", link: "/admin/users" },
    { name: "Active Rooms", value: totalRooms.toString(), icon: Users2, color: "text-indigo-400", bg: "bg-indigo-400/10", link: "/admin/rooms" },
    { name: "Marketplace Items", value: totalItems.toString(), icon: Store, color: "text-emerald-400", bg: "bg-emerald-400/10", link: "/admin/marketplace" },
    { name: "Total Pomodoros", value: (roomStats._sum.totalPomodoros || 0).toString(), icon: Timer, color: "text-orange-400", bg: "bg-orange-400/10", link: "#" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold font-heading">Dashboard</h2>
        <p className="text-white/50 mt-1">Welcome to PromodoZ Admin Panel. Here is your platform overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-white/20 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/50 text-sm font-medium mb-1">{stat.name}</p>
                <h3 className="text-3xl font-bold">{stat.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            
            {stat.link !== "#" && (
              <Link href={stat.link} className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-white/50 hover:text-white">
                Manage <ArrowUpRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        ))}
      </div>
      
      {/* Chart Placeholders or other stuff can go here */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-96 flex items-center justify-center">
          <p className="text-white/30 text-sm">User Growth Chart (Coming Soon)</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-96 flex items-center justify-center">
          <p className="text-white/30 text-sm">Focus Activity Chart (Coming Soon)</p>
        </div>
      </div>
    </div>
  );
}
