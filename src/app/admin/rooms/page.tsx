"use client";

import { useState, useEffect } from "react";
import { Loader2, Trash2, Users2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/rooms");
      if (res.ok) setRooms(await res.json());
    } catch {
      toast.error("Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to FORCE CLOSE this room? All members will be disconnected.")) return;
    try {
      const res = await fetch(`/api/admin/rooms?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Room closed successfully");
        fetchRooms();
      }
    } catch {
      toast.error("Failed to close room");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading">Room Management</h2>
          <p className="text-white/50 text-sm mt-1">Monitor active Pomodoro rooms and forcefully close if necessary.</p>
        </div>
        <button onClick={fetchRooms} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-colors text-sm">
          Refresh List
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 border-b border-white/10 text-white/50">
              <tr>
                <th className="px-6 py-4 font-medium">Room Code</th>
                <th className="px-6 py-4 font-medium">Room Name</th>
                <th className="px-6 py-4 font-medium">Host</th>
                <th className="px-6 py-4 font-medium">Members</th>
                <th className="px-6 py-4 font-medium">Privacy</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/50">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : rooms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/50">
                    No active rooms right now.
                  </td>
                </tr>
              ) : (
                rooms.map(room => (
                  <tr key={room.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-primary font-bold bg-primary/10 px-2 py-1 rounded">
                        {room.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{room.name}</p>
                      <p className="text-[10px] text-white/30">{room.id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white/70">{room.host?.name}</p>
                      <p className="text-[10px] text-white/30">{room.host?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users2 className="w-4 h-4 text-white/50" />
                        <span>{room._count?.members || 0} / {room.maxMembers}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {room.isPrivate ? (
                        <span className="text-red-400 text-xs font-bold">Private</span>
                      ) : (
                        <span className="text-emerald-400 text-xs font-bold">Public</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(room.id)}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors inline-flex items-center gap-2"
                        title="Force Close Room"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        <span className="text-xs font-bold hidden sm:inline">Close</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
