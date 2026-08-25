"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  X, Search, Star, Zap, ShoppingBag, Sparkles, Music,
  Wind, Sun, Image as ImageIcon, Cat, Pointer, Award,
  Clock, TrendingUp, Gift, Tag, Filter, Check, Gem,
  Coins, ChevronRight, Lock, Play, Eye, Loader2, Trash2, Upload
} from "lucide-react";

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────
interface MarketplaceItem {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  gemPrice: number;
  rarity: string;
  imageUrl: string | null;
  isLimited: boolean;
  isNew: boolean;
  isFeatured: boolean;
  unlockLevel: number;
}

interface UserProfile {
  coins: number;
  gems: number;
  xp: number;
  level: number;
  streak: number;
  ownedItemIds: string[];
  equippedItems?: any;
}

interface DailyShopItem extends MarketplaceItem {
  originalPrice: number;
  originalGemPrice: number;
  discount: number;
  isDailyShop: boolean;
}

const CATEGORIES = [
  { id: "all", label: "Tất cả", icon: ShoppingBag },
  { id: "room_theme", label: "Room Theme", icon: ImageIcon },
  { id: "uploads", label: "Ảnh của tôi", icon: ImageIcon },
  { id: "weather", label: "Thời tiết", icon: Sun },
  { id: "lighting", label: "Ánh sáng", icon: Sparkles },
  { id: "ambient_sound", label: "Âm thanh", icon: Music },
  { id: "pet", label: "Pet", icon: Cat },
  { id: "effect", label: "Hiệu ứng", icon: Zap },
  { id: "cursor", label: "Con trỏ", icon: Pointer },
  { id: "badge", label: "Huy hiệu", icon: Award },
];

const RARITY_CONFIG: Record<string, { label: string; color: string; glow: string; border: string }> = {
  common:    { label: "Common",    color: "text-gray-400",   glow: "",                              border: "border-gray-600/40" },
  rare:      { label: "Rare",      color: "text-blue-400",   glow: "shadow-blue-500/20",            border: "border-blue-500/40" },
  epic:      { label: "Epic",      color: "text-purple-400", glow: "shadow-purple-500/30",          border: "border-purple-500/40" },
  legendary: { label: "Legendary", color: "text-yellow-400", glow: "shadow-yellow-500/30",          border: "border-yellow-500/50" },
  mythic:    { label: "Mythic",    color: "text-rose-400",   glow: "shadow-rose-500/40 shadow-lg",  border: "border-rose-500/60" },
};

// ─────────────────────────────────────────
// Sub-component: Item Card
// ─────────────────────────────────────────
function ItemCard({
  item,
  isOwned,
  isEquipped,
  userLevel,
  onBuy,
  onEquip,
  onPreview,
}: {
  item: MarketplaceItem;
  isOwned: boolean;
  isEquipped: boolean;
  userLevel: number;
  onBuy: (item: MarketplaceItem) => void;
  onEquip: (item: MarketplaceItem) => void;
  onPreview: (item: MarketplaceItem) => void;
}) {
  const rarity = RARITY_CONFIG[item.rarity] ?? RARITY_CONFIG.common;
  const isLocked = item.unlockLevel > 0 && userLevel < item.unlockLevel;

  return (
    <div
      className={`relative rounded-2xl border overflow-hidden group cursor-pointer flex flex-col
        bg-white/[0.04] hover:bg-white/[0.07] transition-all duration-200
        ${rarity.border} ${rarity.glow} shadow-lg hover:shadow-xl`}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-white/5">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            unoptimized={item.imageUrl.endsWith('.gif')}
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : item.id === "custom-upload" ? (
          <div className="w-full h-full flex items-center justify-center bg-white/5 group-hover:bg-white/10 transition-colors">
            <Upload className="w-12 h-12 text-white/30 group-hover:text-white/60 transition-colors" />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-white/20" />
          </div>
        )}
        {/* Overlay on hover */}
        {item.id !== "custom-upload" && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              onClick={(e) => { e.stopPropagation(); onPreview(item); }}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <Eye className="w-5 h-5 text-white" />
            </button>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {item.isNew && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white">NEW</span>
          )}
          {item.isLimited && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white">LIMITED</span>
          )}
          {item.isFeatured && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500 text-black">⭐ FEATURED</span>
          )}
        </div>

        {/* Right Badges (Rarity & Discount) */}
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/50 backdrop-blur ${rarity.color}`}>
            {rarity.label}
          </span>
          {(item as any).isDailyShop && (item as any).discount > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white animate-pulse">
              -{ (item as any).discount }%
            </span>
          )}
        </div>

        {/* Lock overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
            <Lock className="w-8 h-8 text-white/50" />
            <span className="text-xs text-white/50 font-medium">Mở tại Level {item.unlockLevel}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div>
          <h4 className="text-white font-semibold text-sm leading-tight">{item.name}</h4>
          {item.description && (
            <p className="text-white/50 text-xs mt-0.5 line-clamp-2">{item.description}</p>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2">
          {/* Price */}
          <div className="flex flex-col">
            {item.price === 0 ? (
              <span className="text-emerald-400 text-xs font-bold">Miễn phí</span>
            ) : (
              <div className="flex flex-col">
                {/* Original Price Strikethrough if Daily Shop */}
                {(item as any).isDailyShop && (
                  <div className="flex items-center gap-2 text-[10px] text-white/40 line-through">
                    {(item as any).originalPrice > 0 && <span>🪙 {(item as any).originalPrice.toLocaleString()}</span>}
                  </div>
                )}
                {/* Current Price */}
                <div className="flex items-center gap-1.5">
                  {item.price > 0 && (
                    <span className="flex items-center gap-1 text-yellow-400 text-xs font-bold">
                      🪙 {item.price.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          {isLocked ? (
            <button disabled className="px-3 py-1.5 rounded-lg bg-white/5 text-white/30 text-xs font-bold cursor-not-allowed">
              Khóa
            </button>
          ) : isOwned ? (
            <button
              onClick={() => !isEquipped && onEquip(item)}
              disabled={isEquipped}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                isEquipped ? "bg-white/20 text-emerald-400 cursor-default" : "bg-white/10 hover:bg-white/20 text-white"
              }`}
            >
              {isEquipped ? (
                <><Check className="w-3 h-3" /> Đang sử dụng</>
              ) : item.id === "custom-upload" ? (
                <><Upload className="w-3 h-3 text-white" /> Tải ảnh lên</>
              ) : (
                <><Check className="w-3 h-3 text-emerald-400" /> Sử dụng</>
              )}
            </button>
          ) : (
            <button
              onClick={() => onBuy(item)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-yellow-400 hover:bg-yellow-300 text-black"
            >
              Mua
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Sub-component: Hero Banner
// ─────────────────────────────────────────
function HeroBanner({ items, onBuy, onPreview, ownedItemIds, userLevel }: {
  items: MarketplaceItem[];
  onBuy: (item: MarketplaceItem) => void;
  onPreview: (item: MarketplaceItem) => void;
  ownedItemIds: string[];
  userLevel: number;
}) {
  const [idx, setIdx] = useState(0);
  const featured = items.filter(i => i.isFeatured).slice(0, 4);

  useEffect(() => {
    if (featured.length === 0) return;
    const t = setInterval(() => setIdx(i => (i + 1) % featured.length), 4000);
    return () => clearInterval(t);
  }, [featured.length]);

  if (featured.length === 0) return null;

  const item = featured[idx];
  const rarity = RARITY_CONFIG[item.rarity] ?? RARITY_CONFIG.common;
  const isOwned = ownedItemIds.includes(item.id);

  return (
    <div className="relative h-48 rounded-2xl overflow-hidden mb-5">
      <div key={item.id} className="absolute inset-0">
          {item.imageUrl && (
            <Image sizes="(max-width: 768px) 100vw, 33vw" src={item.imageUrl} alt={item.name} fill className="object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        </div>

      <div className="absolute inset-0 flex flex-col justify-end p-5">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-black/40 ${rarity.color}`}>{rarity.label}</span>
              {item.isFeatured && <span className="text-xs text-yellow-400 font-bold">⭐ Nổi bật</span>}
            </div>
            <h3 className="text-white font-bold text-xl">{item.name}</h3>
            <p className="text-white/60 text-xs mt-0.5 max-w-[280px] line-clamp-1">{item.description}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onPreview(item)} className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium backdrop-blur transition-colors flex items-center gap-1.5">
              <Eye className="w-4 h-4" /> Thử
            </button>
            {!isOwned && (
              <button
                onClick={() => onBuy(item)}
                className="px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-bold transition-colors flex items-center gap-1.5"
              >
                🪙 {item.price.toLocaleString()}
              </button>
            )}
          </div>
        </div>
        {/* Dot indicators */}
        <div className="flex gap-1.5 mt-3">
          {featured.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? "bg-white w-4" : "bg-white/30"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Main: MarketplaceModal
// ─────────────────────────────────────────
export function MarketplaceModal({
  onClose,
  onEquipBackground,
}: {
  onClose: () => void;
  onEquipBackground: (url: string) => void;
}) {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "price_asc" | "price_desc" | "rarity">("featured");
  const [previewItem, setPreviewItem] = useState<MarketplaceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);
  const [equippedState, setEquippedState] = useState<Record<string, string | null>>({});
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [dailyShopItems, setDailyShopItems] = useState<DailyShopItem[]>([]);

  useEffect(() => {
    if (profile?.equippedItems) {
      setEquippedState({
        room_theme: profile.equippedItems.backgroundUrl || null,
        weather: profile.equippedItems.weatherId || null,
        lighting: profile.equippedItems.lightingId || null,
        effect: profile.equippedItems.effectId || null,
        cursor: profile.equippedItems.cursorId || null,
        pet: profile.equippedItems.petId || null,
        badge: profile.equippedItems.badgeId || null,
        ambient_sound: profile.equippedItems.ambientSoundId || null,
      });
      if (profile.equippedItems.customUploads) {
        try {
          setUploadedImages(JSON.parse(profile.equippedItems.customUploads));
        } catch(e) {}
      }
    }
  }, [profile?.equippedItems]);

  // Fetch items & profile
  useEffect(() => {
    if (status === "loading") return;

    async function fetchData() {
      setLoading(true);
      try {
        const [itemsRes, dailyRes, profileRes] = await Promise.all([
          fetch("/api/marketplace/items"),
          fetch("/api/marketplace/daily-shop"),
          session ? fetch("/api/user/profile") : Promise.resolve(null),
        ]);
        const itemsData = await itemsRes.json();
        const dailyData = await dailyRes.json();
        
        setItems(itemsData);
        setDailyShopItems(dailyData);
        
        if (profileRes) {
          const profileData = await profileRes.json();
          setProfile(profileData);
        }
      } catch (e) {
        toast.error("Không thể tải Marketplace");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [session?.user?.email, status]);

  const ownedItemIds = profile?.ownedItemIds ?? [];
  const userLevel = profile?.level ?? 1;

  const customItems: MarketplaceItem[] = uploadedImages.map((url, i) => ({
    id: `custom-uploaded-${i}`,
    name: `Ảnh của tôi ${i + 1}`,
    description: "Ảnh đã tải lên",
    category: "uploads",
    price: 0,
    gemPrice: 0,
    rarity: "common",
    imageUrl: url,
    isLimited: false,
    isNew: false,
    isFeatured: false,
    unlockLevel: 1,
  }));

  const allItems = activeCategory === "daily_shop" 
    ? dailyShopItems 
    : [...items, ...customItems];

  // Filter + sort
  const filteredItems = allItems
    .filter(item => {
      if (activeCategory === "daily_shop") return true;
      if (activeCategory === "all") return true;
      return item.category === activeCategory;
    })
    .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (a.id === "custom-upload") return -1;
      if (b.id === "custom-upload") return 1;

      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "rarity") {
        const order = { mythic: 0, legendary: 1, epic: 2, rare: 3, common: 4 };
        return (order[a.rarity as keyof typeof order] ?? 5) - (order[b.rarity as keyof typeof order] ?? 5);
      }
      // featured first
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });

  const handleBuy = useCallback(async (item: MarketplaceItem) => {
    if (!session) { toast.error("Vui lòng đăng nhập!"); return; }
    if (buying) return;
    setBuying(item.id);

    try {
      const res = await fetch("/api/marketplace/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Mua thất bại");
        return;
      }

      setProfile(prev => prev ? {
        ...prev,
        coins: data.coins,
        gems: data.gems,
        ownedItemIds: [...prev.ownedItemIds, item.id],
      } : prev);
      // Dispatch event to update coin display in header without triggering full session refresh
      window.dispatchEvent(new CustomEvent("promodo_coins_updated", { detail: { coins: data.coins } }));
      toast.success(`🎉 Mua thành công "${item.name}"!`);
    } catch {
      toast.error("Lỗi kết nối, thử lại nhé!");
    } finally {
      setBuying(null);
    }
  }, [session, buying]);

  const handleEquip = useCallback((item: MarketplaceItem) => {
    const dispatch = (event: string, detail: object | null) =>
      window.dispatchEvent(new CustomEvent(event, { detail }));

    switch (item.category) {
      case "room_theme":
      case "uploads":
        if (item.id === "custom-upload") {
          fileInputRef.current?.click();
          return;
        } else if (item.imageUrl) {
          onEquipBackground(item.imageUrl);
          setEquippedState(prev => ({ ...prev, room_theme: item.imageUrl }));
          toast.success(`🖼️ Đã trang bị "${item.name}"`);
        }
        break;
      case "pet":
        dispatch("promodo_pet_equipped", { petId: item.id });
        setEquippedState(prev => ({ ...prev, pet: item.id }));
        toast.success(`🐱 Pet "${item.name}" đã xuất hiện!`);
        break;
      case "weather":
        dispatch("promodo_weather_equipped", { id: item.id });
        setEquippedState(prev => ({ ...prev, weather: item.id }));
        toast.success(`🌤️ Thời tiết "${item.name}" đã bật`);
        break;
      case "lighting":
        dispatch("promodo_lighting_equipped", { id: item.id });
        setEquippedState(prev => ({ ...prev, lighting: item.id }));
        toast.success(`💡 Ánh sáng "${item.name}" đã bật`);
        break;
      case "effect":
        dispatch("promodo_effect_equipped", { id: item.id });
        setEquippedState(prev => ({ ...prev, effect: item.id }));
        toast.success(`✨ Hiệu ứng "${item.name}" đã bật`);
        break;
      case "cursor":
        dispatch("promodo_cursor_equipped", { id: item.id });
        setEquippedState(prev => ({ ...prev, cursor: item.id }));
        toast.success(`🖱️ Con trỏ "${item.name}" đã đổi`);
        break;
      case "ambient_sound":
        dispatch("promodo_sound_equipped", { id: item.id, name: item.name });
        setEquippedState(prev => ({ ...prev, ambient_sound: item.id }));
        toast.success(`🎵 Âm thanh "${item.name}" đang phát`);
        break;
      case "badge":
        dispatch("promodo_badge_equipped", { id: item.id, name: item.name });
        toast.success(`🏅 Huy hiệu "${item.name}" đã trang bị`);
        break;
      default:
        toast.success(`✅ Đã trang bị "${item.name}"`);
    }

    // Sync to backend
    fetch("/api/user/equip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "equip", item })
    }).catch(console.error);

  }, [onEquipBackground]);

  const handleUnequipAll = useCallback(() => {
    const keys = ["promodo_weather", "promodo_lighting", "promodo_effect", "promodo_cursor", "promodo_badge", "promodo_sound", "promodo_equipped_pet"];
    keys.forEach(k => localStorage.removeItem(k));
    window.dispatchEvent(new CustomEvent("promodo_weather_equipped", { detail: { id: null } }));
    window.dispatchEvent(new CustomEvent("promodo_lighting_equipped", { detail: { id: null } }));
    window.dispatchEvent(new CustomEvent("promodo_effect_equipped", { detail: { id: null } }));
    window.dispatchEvent(new CustomEvent("promodo_cursor_equipped", { detail: { id: null } }));
    window.dispatchEvent(new CustomEvent("promodo_badge_equipped", { detail: null }));
    window.dispatchEvent(new CustomEvent("promodo_sound_equipped", { detail: null }));
    window.dispatchEvent(new CustomEvent("promodo_pet_equipped", { detail: { petId: null } }));
    setEquippedState({});
    toast.success("🧹 Đã gỡ toàn bộ trang bị & hiệu ứng!");

    fetch("/api/user/equip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "unequip_all" })
    }).catch(console.error);
  }, []);

  const handleCloseModal = useCallback(() => {
    if (previewItem && previewItem.category === "room_theme") {
      const saved = equippedState.room_theme || "https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?q=80&w=3540&auto=format&fit=crop";
      onEquipBackground(saved);
    }
    setPreviewItem(null);
    onClose();
  }, [previewItem, onClose, onEquipBackground, equippedState.room_theme]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        const newUploads = [...uploadedImages, data.url];
        setUploadedImages(newUploads);
        localStorage.setItem("promodo_uploaded_backgrounds", JSON.stringify(newUploads));
        
        onEquipBackground(data.url);
        localStorage.setItem("promodo_background_url", data.url);
        setEquippedState(prev => ({ ...prev, room_theme: data.url }));
        toast.success("✅ Đã đổi hình nền thành công!");

        await fetch("/api/user/equip", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "add_upload", item: { url: data.url } })
        }).catch(console.error);
        
        await fetch("/api/user/equip", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "equip", item: { category: "room_theme", id: "custom", imageUrl: data.url } })
        }).catch(console.error);

      } else {
        toast.error("❌ Tải lên thất bại.");
      }
    } catch(err) {
      toast.error("❌ Lỗi tải ảnh lên.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };


  const handlePreview = useCallback((item: MarketplaceItem) => {
    setPreviewItem(item);
    if (item.category === "room_theme" && item.imageUrl) {
      onEquipBackground(item.imageUrl);
    }
  }, [onEquipBackground]);

  const xpForNext = 500;
  const xpProgress = profile ? ((profile.xp % xpForNext) / xpForNext) * 100 : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-yellow-400/20 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg leading-none">Marketplace</h2>
            <p className="text-white/40 text-xs mt-0.5">Cá nhân hóa không gian học tập của bạn</p>
          </div>
        </div>

        {/* Currency HUD & Unequip */}
        <div className="flex items-center gap-3">
          <button 
            onClick={handleUnequipAll}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors text-xs font-semibold mr-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Tắt tất cả hiệu ứng
          </button>
          
          {profile && (
            <>
              <div className="flex items-center gap-1.5 bg-yellow-400/10 border border-yellow-400/20 rounded-xl px-3 py-1.5">
                <span className="text-base">🪙</span>
                <span className="text-yellow-400 font-bold text-sm">{profile.coins.toLocaleString()}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-white/60 text-[10px]">Level {profile.level}</span>
                <div className="w-20 h-1.5 bg-white/10 rounded-full mt-0.5">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${xpProgress}%` }} />
                </div>
              </div>
            </>
          )}

          <button onClick={handleCloseModal} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors ml-2">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
      
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Categories */}
        <div className="w-48 flex-shrink-0 border-r border-white/10 p-3 flex flex-col gap-1 overflow-y-auto lumina-scrollbar">
          <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest px-2 mb-1">Danh mục</p>
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const count = cat.id === "all" ? allItems.length : allItems.filter(i => i.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all text-left
                  ${activeCategory === cat.id
                    ? "bg-primary text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 truncate">{cat.label}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeCategory === cat.id ? "bg-white/20" : "bg-white/10 text-white/40"}`}>
                  {count}
                </span>
              </button>
            );
          })}

          <div className="mt-auto pt-4 border-t border-white/10">
            <div className="bg-gradient-to-br from-yellow-400/10 to-orange-400/10 border border-yellow-400/20 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Gift className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 text-xs font-bold">Daily Shop</span>
              </div>
              <p className="text-white/50 text-[11px]">Vật phẩm giảm giá mỗi ngày</p>
              <button 
                onClick={() => setActiveCategory("daily_shop")}
                className="mt-2 w-full text-xs text-yellow-400 font-medium text-left hover:underline"
              >
                Xem ngay →
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search & Sort Bar */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-white/10 flex-shrink-0">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="Tìm kiếm vật phẩm..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50"
              />
            </div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-primary/50"
            >
              <option value="featured" className="bg-[#111]">Nổi bật</option>
              <option value="price_asc" className="bg-[#111]">Giá: Thấp → Cao</option>
              <option value="price_desc" className="bg-[#111]">Giá: Cao → Thấp</option>
              <option value="rarity" className="bg-[#111]">Độ hiếm</option>
            </select>
          </div>

          {/* Scrollable items area */}
          <div className="flex-1 overflow-y-auto p-5 lumina-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Hero banner - only show when on "all" tab */}
                {activeCategory === "all" && !searchQuery && (
                  <HeroBanner
                    items={items}
                    onBuy={handleBuy}
                    onPreview={handlePreview}
                    ownedItemIds={ownedItemIds}
                    userLevel={userLevel}
                  />
                )}

                {/* Section title */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">
                    {activeCategory === "daily_shop" ? "🔥 Daily Shop - Flash Sale" : (CATEGORIES.find(c => c.id === activeCategory)?.label ?? "Tất cả")}
                    <span className="text-white/40 font-normal text-sm ml-2">({filteredItems.length} vật phẩm)</span>
                  </h3>
                </div>

                {filteredItems.length === 0 ? (
                  <div className="text-center py-16 text-white/30">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Không tìm thấy vật phẩm nào</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-4">
                    {filteredItems.map(item => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        isOwned={ownedItemIds.includes(item.id) || item.price === 0 || item.category === "uploads"}
                        isEquipped={item.category === "room_theme" || item.category === "uploads" ? equippedState.room_theme === item.imageUrl : equippedState[item.category] === item.id}
                        userLevel={userLevel}
                        onBuy={handleBuy}
                        onEquip={handleEquip}
                        onPreview={handlePreview}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Preview Mode overlay */}
      <AnimatePresence>
        {previewItem && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl px-5 py-3 flex items-center gap-4 z-50 shadow-2xl"
          >
            <div className="text-sm text-white/70">
              👁️ Đang xem trước: <span className="text-white font-semibold">{previewItem.name}</span>
            </div>
            <div className="flex gap-2">
              {!ownedItemIds.includes(previewItem.id) && previewItem.price > 0 && (
                <button
                  onClick={() => { handleBuy(previewItem); setPreviewItem(null); }}
                  disabled={buying === previewItem.id}
                  className="px-4 py-1.5 rounded-lg bg-yellow-400 text-black text-sm font-bold hover:bg-yellow-300 transition-colors"
                >
                  🪙 Mua {previewItem.price.toLocaleString()}
                </button>
              )}
              <button
                onClick={() => {
                  setPreviewItem(null);
                  // Restore saved bg
                  const saved = equippedState.room_theme || "https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?q=80&w=3540&auto=format&fit=crop";
                  onEquipBackground(saved);
                }}
                className="px-4 py-1.5 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors"
              >
                Hủy xem trước
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
