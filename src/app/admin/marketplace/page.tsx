"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Edit2, Trash2, Loader2, Image as ImageIcon, Upload } from "lucide-react";
import { toast } from "sonner";

export default function AdminMarketplacePage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "theme",
    subCategory: "",
    price: 0,
    gemPrice: 0,
    rarity: "common",
    imageUrl: "",
    isFeatured: false,
    isLimited: false,
    unlockLevel: 0,
  });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/marketplace");
      if (res.ok) setItems(await res.json());
    } catch {
      toast.error("Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpenModal = (item: any = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ ...item });
    } else {
      setEditingItem(null);
      setFormData({
        name: "", description: "", category: "theme", subCategory: "", 
        price: 0, gemPrice: 0, rarity: "common", imageUrl: "", 
        isFeatured: false, isLimited: false, unlockLevel: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, imageUrl: data.url }));
        toast.success("Image uploaded!");
      } else {
        toast.error("Upload failed");
      }
    } catch {
      toast.error("Upload error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = "/api/admin/marketplace";
      const method = editingItem ? "PATCH" : "POST";
      const body = editingItem ? { id: editingItem.id, ...formData } : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        toast.success(`Item ${editingItem ? "updated" : "created"}!`);
        setIsModalOpen(false);
        fetchItems();
      } else {
        toast.error("Action failed");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    try {
      const res = await fetch(`/api/admin/marketplace?id=${itemToDelete}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Item deleted");
        fetchItems();
      } else {
        toast.error("Failed to delete item");
      }
    } catch {
      toast.error("Delete failed");
    } finally {
      setItemToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading">Marketplace Management</h2>
          <p className="text-white/50 text-sm mt-1">Manage store items, themes, and cosmetics.</p>
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Item
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 border-b border-white/10 text-white/50">
              <tr>
                <th className="px-6 py-4 font-medium">Item</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Rarity</th>
                <th className="px-6 py-4 font-medium">Status</th>
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
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/50">
                    No items found
                  </td>
                </tr>
              ) : (
                items.map(item => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden">
                          {item.imageUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-white/30" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-white/40 truncate max-w-[200px]">{item.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize text-white/70">{item.category}</span>
                      {item.subCategory && <span className="text-xs text-white/30 ml-2">({item.subCategory})</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {item.price > 0 && <span className="text-yellow-400 font-medium text-xs">🪙 {item.price}</span>}
                        {item.gemPrice > 0 && <span className="text-fuchsia-400 font-medium text-xs">💎 {item.gemPrice}</span>}
                        {item.price === 0 && item.gemPrice === 0 && <span className="text-green-400 font-medium text-xs">Free</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`capitalize text-xs font-medium ${
                        item.rarity === 'legendary' ? 'text-orange-400' :
                        item.rarity === 'epic' ? 'text-fuchsia-400' :
                        item.rarity === 'rare' ? 'text-blue-400' : 'text-gray-400'
                      }`}>
                        {item.rarity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {item.isFeatured && <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] rounded font-bold">Featured</span>}
                        {item.isLimited && <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] rounded font-bold">Limited</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(item)}
                          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setItemToDelete(item.id)}
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
              <h3 className="text-xl font-bold font-heading">{editingItem ? "Edit Item" : "Create New Item"}</h3>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="itemForm" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs text-white/50 mb-1">Name *</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-white/50 mb-1">Description</label>
                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary h-20" />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Category *</label>
                    <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-[#222] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary">
                      <option value="theme">Theme</option>
                      <option value="pet">Pet</option>
                      <option value="effect">Effect</option>
                      <option value="weather">Weather</option>
                      <option value="sound">Sound</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Rarity</label>
                    <select value={formData.rarity} onChange={e => setFormData({...formData, rarity: e.target.value})} className="w-full bg-[#222] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary">
                      <option value="common">Common</option>
                      <option value="rare">Rare</option>
                      <option value="epic">Epic</option>
                      <option value="legendary">Legendary</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Price (Coins)</label>
                    <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: parseInt(e.target.value) || 0})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Price (Gems)</label>
                    <input type="number" value={formData.gemPrice} onChange={e => setFormData({...formData, gemPrice: parseInt(e.target.value) || 0})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-white/50 mb-1">Image URL</label>
                    <div className="flex gap-2">
                      <input type="url" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} placeholder="https://..." className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary" />
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-white text-xs font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                      >
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        Upload
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        accept="image/*" 
                        className="hidden" 
                      />
                    </div>
                    {formData.imageUrl && (
                      <div className="mt-2 w-full h-32 rounded-lg border border-white/10 overflow-hidden bg-white/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  
                  <div className="col-span-2 flex gap-6 mt-2 border-t border-white/10 pt-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData({...formData, isFeatured: e.target.checked})} className="rounded bg-white/10 border-white/20 text-primary focus:ring-primary" />
                      <span className="text-sm text-white/80">Featured Item</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.isLimited} onChange={e => setFormData({...formData, isLimited: e.target.checked})} className="rounded bg-white/10 border-white/20 text-primary focus:ring-primary" />
                      <span className="text-sm text-white/80">Limited Time</span>
                    </label>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-black/40">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl hover:bg-white/5 text-white/70 transition-colors">
                Cancel
              </button>
              <button form="itemForm" type="submit" className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium transition-colors">
                {editingItem ? "Save Changes" : "Create Item"}
              </button>
            </div>
          </div>
        </div>
      )}

      {itemToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-red-500/20 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold font-heading text-white mb-2">Delete Item</h3>
              <p className="text-white/60 text-sm">
                Are you sure you want to delete this item? This action cannot be undone.
              </p>
            </div>
            <div className="p-4 border-t border-white/10 flex gap-3 bg-black/40">
              <button 
                onClick={() => setItemToDelete(null)} 
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={executeDelete} 
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
