"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, Edit2, ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<any>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}`);
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => fetchUsers(), 500);
    return () => clearTimeout(delay);
  }, [search]);

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editingUser.id,
          action: "edit_balances",
          payload: {
            coins: parseInt(editingUser.coins),
            gems: parseInt(editingUser.gems),
            xp: parseInt(editingUser.xp),
            level: parseInt(editingUser.level),
          }
        })
      });
      if (res.ok) {
        toast.success("User updated!");
        setEditingUser(null);
        fetchUsers();
      } else {
        toast.error("Update failed");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const handleRoleToggle = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          action: "change_role",
          payload: { role: newRole }
        })
      });
      if (res.ok) {
        toast.success(`User role changed to ${newRole}`);
        fetchUsers();
      }
    } catch {
      toast.error("Action failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading">User Management</h2>
          <p className="text-white/50 text-sm mt-1">Manage accounts, balances, and permissions.</p>
        </div>
        
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 border-b border-white/10 text-white/50">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Level / XP</th>
                <th className="px-6 py-4 font-medium">Wealth</th>
                <th className="px-6 py-4 font-medium">Pomodoros</th>
                <th className="px-6 py-4 font-medium">Role</th>
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/50">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={user.image || "/default-avatar.png"} alt={user.name || "User"} className="w-10 h-10 rounded-full border border-white/10" />
                        <div>
                          <p className="font-medium">{user.name || "Unknown"}</p>
                          <p className="text-xs text-white/40">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-primary font-bold">Lv. {user.level}</p>
                      <p className="text-xs text-white/40">{user.xp} XP</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400 font-medium">🪙 {user.coins}</span>
                        <span className="text-fuchsia-400 font-medium">💎 {user.gems}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-white/70">{user.totalPomodoros}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                        user.role === "ADMIN" ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white/50"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleRoleToggle(user.id, user.role)}
                          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
                          title={user.role === "ADMIN" ? "Demote to User" : "Promote to Admin"}
                        >
                          {user.role === "ADMIN" ? <ShieldAlert className="w-4 h-4 text-red-400" /> : <ShieldCheck className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => setEditingUser(user)}
                          className="p-2 bg-primary/10 hover:bg-primary/20 rounded-lg text-primary transition-colors"
                          title="Edit User Balances"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/20 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold font-heading mb-4">Edit User: {editingUser.name}</h3>
            <form onSubmit={handleEditSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/50 mb-1">Level</label>
                  <input 
                    type="number" 
                    value={editingUser.level} 
                    onChange={e => setEditingUser({...editingUser, level: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1">XP</label>
                  <input 
                    type="number" 
                    value={editingUser.xp} 
                    onChange={e => setEditingUser({...editingUser, xp: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1">Coins</label>
                  <input 
                    type="number" 
                    value={editingUser.coins} 
                    onChange={e => setEditingUser({...editingUser, coins: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-yellow-400 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1">Gems</label>
                  <input 
                    type="number" 
                    value={editingUser.gems} 
                    onChange={e => setEditingUser({...editingUser, gems: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-fuchsia-400 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-6">
                <button 
                  type="button" 
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl hover:bg-white/5 text-white/70 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
