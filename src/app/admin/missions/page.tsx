"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Loader2, Target, Coins, Diamond } from "lucide-react";
import { toast } from "sonner";

export default function AdminMissionsPage() {
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "focus",
    target: 0,
    coinReward: 0,
    gemReward: 0,
    xpReward: 50,
  });

  const fetchMissions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/missions");
      if (res.ok) setMissions(await res.json());
    } catch {
      toast.error("Failed to load mission templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  const handleOpenModal = (item: any = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ ...item });
    } else {
      setEditingItem(null);
      setFormData({
        name: "", description: "", type: "focus", target: 0,
        coinReward: 0, gemReward: 0, xpReward: 50
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = "/api/admin/missions";
      const method = editingItem ? "PATCH" : "POST";
      const body = editingItem ? { id: editingItem.id, ...formData } : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        toast.success(`Mission ${editingItem ? "updated" : "created"}!`);
        setIsModalOpen(false);
        fetchMissions();
      } else {
        toast.error("Action failed");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this mission template? It won't affect users who already received it today.")) return;
    try {
      const res = await fetch(`/api/admin/missions?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Mission deleted");
        fetchMissions();
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading">Daily Missions</h2>
          <p className="text-white/50 text-sm mt-1">Manage gamification templates for user daily missions.</p>
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Mission
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 border-b border-white/10 text-white/50">
              <tr>
                <th className="px-6 py-4 font-medium">Mission Details</th>
                <th className="px-6 py-4 font-medium">Type / Target</th>
                <th className="px-6 py-4 font-medium">Rewards</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-white/50">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : missions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-white/50">
                    No mission templates found.
                  </td>
                </tr>
              ) : (
                missions.map(mission => (
                  <tr key={mission.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium">{mission.name}</p>
                      <p className="text-xs text-white/40 max-w-[250px]">{mission.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="uppercase text-xs font-bold text-white/60 tracking-wider">{mission.type}</span>
                        <div className="flex items-center gap-1 text-primary text-xs">
                          <Target className="w-3 h-3" />
                          <span>Require: {mission.target}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs">
                        {mission.coinReward > 0 && <span className="text-yellow-400 font-medium">🪙 {mission.coinReward} Coins</span>}
                        {mission.gemReward > 0 && <span className="text-fuchsia-400 font-medium">💎 {mission.gemReward} Gems</span>}
                        {mission.xpReward > 0 && <span className="text-blue-400 font-medium">⭐ {mission.xpReward} XP</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(mission)}
                          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(mission.id)}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/20 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-xl font-bold font-heading">{editingItem ? "Edit Mission" : "Create New Mission"}</h3>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="missionForm" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs text-white/50 mb-1">Mission Name *</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Focus Master" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-white/50 mb-1">Description *</label>
                    <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="e.g. Focus for 60 minutes today." className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary h-20" />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Mission Type *</label>
                    <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-[#222] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary">
                      <option value="focus">Focus (Minutes)</option>
                      <option value="pomodoro">Pomodoro (Count)</option>
                      <option value="task">Task Completion</option>
                      <option value="room">Join Room</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Target Value *</label>
                    <input type="number" required value={formData.target} onChange={e => setFormData({...formData, target: parseInt(e.target.value) || 0})} placeholder="e.g. 60" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Coin Reward</label>
                    <input type="number" value={formData.coinReward} onChange={e => setFormData({...formData, coinReward: parseInt(e.target.value) || 0})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Gem Reward</label>
                    <input type="number" value={formData.gemReward} onChange={e => setFormData({...formData, gemReward: parseInt(e.target.value) || 0})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-white/50 mb-1">XP Reward</label>
                    <input type="number" value={formData.xpReward} onChange={e => setFormData({...formData, xpReward: parseInt(e.target.value) || 0})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary" />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-black/40">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl hover:bg-white/5 text-white/70 transition-colors">
                Cancel
              </button>
              <button form="missionForm" type="submit" className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium transition-colors">
                {editingItem ? "Save Changes" : "Create Mission"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
