const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/marketplace/MarketplaceModal.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace CATEGORIES
content = content.replace(
`const CATEGORIES = [
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
];`,
`const CATEGORIES = [
  { id: "all", labelKey: "all", icon: ShoppingBag },
  { id: "room_theme", labelKey: "roomTheme", icon: ImageIcon },
  { id: "uploads", labelKey: "myImages", icon: ImageIcon },
  { id: "weather", labelKey: "weather", icon: Sun },
  { id: "lighting", labelKey: "lighting", icon: Sparkles },
  { id: "ambient_sound", labelKey: "sound", icon: Music },
  { id: "pet", labelKey: "pet", icon: Cat },
  { id: "effect", labelKey: "effects", icon: Zap },
  { id: "cursor", labelKey: "cursor", icon: Pointer },
  { id: "badge", labelKey: "badge", icon: Award },
];`
);

// Map CATEGORIES.label in JSX
content = content.replace(/{cat\.label}/g, '{t(cat.labelKey as any)}');
content = content.replace(/{CATEGORIES.find\(c => c.id === activeCategory\)\?.label ?? "Tất cả"}/g, '{CATEGORIES.find(c => c.id === activeCategory)?.labelKey ? t(CATEGORIES.find(c => c.id === activeCategory)?.labelKey as any) : t("all")}');

// Replace the generated name: `Ảnh của tôi ${i + 1}`
content = content.replace(/name: \`Ảnh của tôi \${i \+ 1}\`/g, 'name: `${t("myImages")} ${i + 1}`');

// Ensure other static texts inside component are translated
content = content.replace('Vật phẩm giảm giá mỗi ngày', '{t("dailyShopDesc")}');
content = content.replace('Xem ngay →', '{t("viewNow")}');

fs.writeFileSync(filePath, content);
console.log("MarketplaceModal patched with categories.");
