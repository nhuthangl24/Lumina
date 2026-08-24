import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MARKETPLACE_ITEMS = [
  // ============ ROOM THEMES ============
  { name: "Minimal White", description: "Clean, distraction-free minimal workspace", category: "room_theme", price: 0, rarity: "common", imageUrl: "https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?q=90&w=3840", isFeatured: true, isNew: false },
  { name: "Rainy Night City", description: "Moody city vibes with rain on the window", category: "room_theme", price: 500, rarity: "rare", imageUrl: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=90&w=3840", isNew: false },
  { name: "Dark Academia Library", description: "Classic wooden shelves, candlelight", category: "room_theme", price: 800, rarity: "rare", imageUrl: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=90&w=3840", isNew: false },
  { name: "Japanese Zen Garden", description: "Peaceful bamboo & tatami aesthetic", category: "room_theme", price: 1200, rarity: "epic", imageUrl: "https://images.unsplash.com/photo-1576669801945-8b69d5e6a04b?q=90&w=3840", isFeatured: true },
  { name: "Cyberpunk Neon Lab", description: "Glowing holographics and neon signs", category: "room_theme", price: 1500, rarity: "epic", imageUrl: "https://images.unsplash.com/photo-1614851099518-92f57e0e22db?q=90&w=3840" },
  { name: "Cozy Forest Cabin", description: "Warm fireplace, wooden walls, snow outside", category: "room_theme", price: 800, rarity: "rare", imageUrl: "https://images.unsplash.com/photo-1587131782738-de30ea91a543?q=90&w=3840" },
  { name: "Space Station", description: "Deep space view, floating stars", category: "room_theme", price: 2000, rarity: "legendary", imageUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=90&w=3840", isFeatured: true },
  { name: "Lo-fi Coffee Shop", description: "Warm cafe with vinyl music and rain", category: "room_theme", price: 600, rarity: "rare", imageUrl: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?q=90&w=3840" },
  { name: "Gaming Setup", description: "RGB lights, dual monitors, peak gaming den", category: "room_theme", price: 1000, rarity: "epic", imageUrl: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=90&w=3840" },
  { name: "Beach House Sunrise", description: "Ocean view, warm morning light", category: "room_theme", price: 900, rarity: "rare", imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=90&w=3840" },
  { name: "Nordic Minimalism", description: "White walls, pine wood, hygge vibes", category: "room_theme", price: 700, rarity: "rare", imageUrl: "https://images.unsplash.com/photo-1501045661006-fcebe0257c3f?q=90&w=3840" },
  { name: "Luxury Penthouse", description: "Floor-to-ceiling glass, city panorama", category: "room_theme", price: 3000, gemPrice: 20, rarity: "legendary", imageUrl: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=90&w=3840" },

  // ============ ANIMATED BACKGROUNDS (GIF) ============
  { name: "Lofi Girl Study", description: "Lofi beats to relax/study to", category: "room_theme", price: 800, rarity: "epic", imageUrl: "https://media.giphy.com/media/L0qTl8hl84xVn7r8l0/giphy.gif", isFeatured: true, isNew: true },
  { name: "Pixel Art Night City", description: "Retro animated pixel cyberpunk city", category: "room_theme", price: 1000, rarity: "legendary", imageUrl: "https://media.giphy.com/media/3o7TKrEzvLbgqjSYgw/giphy.gif", isFeatured: true, isNew: true },
  { name: "Cyberpunk Train", description: "Endless train ride through futuristic city", category: "room_theme", price: 1200, rarity: "epic", imageUrl: "https://media.giphy.com/media/J0WeVOLjuqW2I/giphy.gif", isNew: true },
  { name: "Cozy Rain Window", description: "Animated raining outside the window", category: "room_theme", price: 600, rarity: "rare", imageUrl: "https://media.giphy.com/media/u04bOWYPdInzmZJqLZ/giphy.gif", isNew: true },

  // ============ WEATHER PACKS ============
  { name: "Rainy Day", description: "Gentle rain on the window", category: "weather", price: 300, rarity: "common", imageUrl: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?q=90&w=3840" },
  { name: "Snowfall", description: "Soft winter snowflakes", category: "weather", price: 400, rarity: "common", imageUrl: "https://images.unsplash.com/photo-1491002052546-bf38f186af56?q=90&w=3840" },
  { name: "Thunderstorm", description: "Heavy rain with lightning", category: "weather", price: 600, rarity: "rare", imageUrl: "https://images.unsplash.com/photo-1461511669078-d46bf351cd6e?q=90&w=3840" },
  { name: "Cherry Blossom", description: "Pink petals drifting in spring wind", category: "weather", price: 800, rarity: "rare", imageUrl: "https://images.unsplash.com/photo-1522383225653-ed111181a951?q=90&w=3840", isFeatured: true },
  { name: "Autumn Leaves", description: "Orange and red leaves falling", category: "weather", price: 700, rarity: "rare", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=90&w=3840" },
  { name: "Northern Lights", description: "Aurora borealis shimmering overhead", category: "weather", price: 2500, gemPrice: 15, rarity: "legendary", imageUrl: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=90&w=3840", isFeatured: true },
  { name: "Fireflies", description: "Magic fireflies glowing at dusk", category: "weather", price: 1000, rarity: "epic", imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=90&w=3840" },

  // ============ LIGHTING PACKS ============
  { name: "Golden Hour", description: "Warm afternoon sunlight glow", category: "lighting", price: 200, rarity: "common", imageUrl: "https://images.unsplash.com/photo-1507272931001-fc06c17e4f43?q=90&w=3840" },
  { name: "Moonlight Blue", description: "Cool blue night ambiance", category: "lighting", price: 300, rarity: "common", imageUrl: "https://images.unsplash.com/photo-1532767153582-b1a0e5145009?q=90&w=3840" },
  { name: "Neon Purple", description: "Synthwave purple glow", category: "lighting", price: 600, rarity: "rare", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=90&w=3840" },
  { name: "Cozy Warm", description: "Fireplace warm amber light", category: "lighting", price: 400, rarity: "common", imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=90&w=3840" },
  { name: "RGB Cycle", description: "Dynamic color-shifting RGB ambiance", category: "lighting", price: 1200, rarity: "epic", imageUrl: "https://images.unsplash.com/photo-1511406361295-0a1ff814c0ce?q=90&w=3840", isFeatured: true },

  // ============ AMBIENT SOUNDS ============
  { name: "Raindrops", description: "Gentle rain on a window pane", category: "ambient_sound", price: 0, rarity: "common", imageUrl: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?q=90&w=3840", isNew: false },
  { name: "Coffee Shop Buzz", description: "Espresso machine, soft chatter", category: "ambient_sound", price: 200, rarity: "common", imageUrl: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?q=90&w=3840", isNew: false },
  { name: "Deep Forest", description: "Birds, rustling leaves, a stream", category: "ambient_sound", price: 300, rarity: "common", imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=90&w=3840" },
  { name: "Ocean Waves", description: "Calming coastal rhythms", category: "ambient_sound", price: 300, rarity: "common", imageUrl: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=90&w=3840" },
  { name: "Tokyo Night", description: "City ambiance, neon rain, distant trains", category: "ambient_sound", price: 500, rarity: "rare", imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=90&w=3840", isFeatured: true },
  { name: "Campfire Crackle", description: "Warm crackling fire, night insects", category: "ambient_sound", price: 400, rarity: "common", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=90&w=3840" },
  { name: "Mechanical Keyboard", description: "Satisfying clicky keyboard sounds", category: "ambient_sound", price: 400, rarity: "rare", imageUrl: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?q=90&w=3840" },
  { name: "Temple Bells", description: "Zen monastery bells and silence", category: "ambient_sound", price: 600, rarity: "rare", imageUrl: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?q=90&w=3840" },
  { name: "Thunderstorm Attic", description: "Heavy rain on a tin roof, thunder far away", category: "ambient_sound", price: 700, rarity: "epic", imageUrl: "https://images.unsplash.com/photo-1461511669078-d46bf351cd6e?q=90&w=3840" },

  // ============ PETS ============
  { name: "Pixel Cat", description: "A cozy cat that sits on your desk and reacts to focus sessions", category: "pet", price: 800, rarity: "rare", imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=90&w=3840", isFeatured: true },
  { name: "Study Fox", description: "A clever fox that helps you stay on track", category: "pet", price: 1000, rarity: "rare", imageUrl: "https://images.unsplash.com/photo-1474511320723-9a56873867b5?q=90&w=3840" },
  { name: "Night Owl", description: "A wise owl that watches over your night sessions", category: "pet", price: 1200, rarity: "epic", imageUrl: "https://images.unsplash.com/photo-1611689342806-0863700ce1e4?q=90&w=3840" },
  { name: "Capybara Chill", description: "Maximum chill vibes, does nothing, heals your soul", category: "pet", price: 1500, rarity: "epic", imageUrl: "https://images.unsplash.com/photo-1635337573071-a1e0c773eea3?q=90&w=3840", isFeatured: true },
  { name: "Cyber Dragon", description: "A small dragon that breathes digital fire on timer complete", category: "pet", price: 5000, gemPrice: 30, rarity: "legendary", imageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=90&w=3840" },
  { name: "Pixel Ghost", description: "Friendly ghost that floats around your room", category: "pet", price: 800, rarity: "rare", imageUrl: "https://images.unsplash.com/photo-1574158622682-e40e69881006?q=90&w=3840" },

  // ============ EFFECTS ============
  { name: "Confetti Burst", description: "Confetti explosion on Pomodoro complete", category: "effect", price: 300, rarity: "common", imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=90&w=3840" },
  { name: "Magic Sparkles", description: "Sparkling magic dust on session start", category: "effect", price: 500, rarity: "rare", imageUrl: "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?q=90&w=3840", isFeatured: true },
  { name: "Cyber Matrix", description: "Matrix-style falling code on level up", category: "effect", price: 800, rarity: "rare", imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=90&w=3840" },
  { name: "Fireworks", description: "Colorful fireworks on streak milestones", category: "effect", price: 600, rarity: "rare", imageUrl: "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?q=90&w=3840" },
  { name: "Golden Portal", description: "Epic portal swirl on session complete", category: "effect", price: 3000, gemPrice: 20, rarity: "legendary", imageUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=90&w=3840" },

  // ============ CURSOR PACKS ============
  { name: "Crystal Glass Cursor", description: "Sleek frosted glass pointer", category: "cursor", price: 400, rarity: "rare", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=90&w=3840" },
  { name: "Pixel Cursor", description: "Retro 8-bit pixel pointer", category: "cursor", price: 300, rarity: "common", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=90&w=3840" },
  { name: "Magic Wand", description: "Sparkling wand cursor", category: "cursor", price: 700, rarity: "rare", imageUrl: "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?q=90&w=3840", isFeatured: true },

  // ============ PROFILE / BADGE ============
  { name: "Focus Master Badge", description: "Awarded to dedicated focus warriors", category: "badge", price: 0, rarity: "rare", imageUrl: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?q=90&w=3840", isNew: false },
  { name: "Night Owl Badge", description: "For those who study past midnight", category: "badge", price: 500, rarity: "rare", imageUrl: "https://images.unsplash.com/photo-1611689342806-0863700ce1e4?q=90&w=3840" },
  { name: "Consistency King", description: "7-day streak achievement badge", category: "badge", price: 0, rarity: "epic", imageUrl: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?q=90&w=3840", unlockLevel: 5 },
];

async function main() {
  console.log("🌱 Seeding marketplace items...");

  for (const item of MARKETPLACE_ITEMS) {
    await prisma.marketplaceItem.upsert({
      where: { id: item.name.toLowerCase().replace(/\s+/g, "-") },
      update: {},
      create: {
        id: item.name.toLowerCase().replace(/\s+/g, "-"),
        ...item,
        isNew: item.isNew ?? true,
        isFeatured: item.isFeatured ?? false,
      },
    });
  }

  console.log(`✅ Seeded ${MARKETPLACE_ITEMS.length} marketplace items`);

  // Seed default daily missions
  console.log("🌱 Seeding daily mission templates...");
  const missions = [
    { id: "daily-pomodoro-2", name: "Tập trung nhỏ", description: "Hoàn thành 2 Pomodoro", type: "complete_pomodoro", target: 2, coinReward: 30, xpReward: 50 },
    { id: "daily-task-3", name: "Giải quyết công việc", description: "Hoàn thành 3 Task", type: "complete_task", target: 3, coinReward: 25, xpReward: 40 },
    { id: "daily-login", name: "Đăng nhập hàng ngày", description: "Đăng nhập vào Lumina hôm nay", type: "login", target: 1, coinReward: 20, xpReward: 20 },
    { id: "daily-focus-60", name: "Phiên tập trung sâu", description: "Tập trung tổng cộng 60 phút", type: "focus_minutes", target: 60, coinReward: 50, xpReward: 80 },
  ];

  for (const m of missions) {
    await prisma.dailyMissionTemplate.upsert({
      where: { id: m.id },
      update: {},
      create: { ...m, gemReward: 0 },
    });
  }

  console.log("✅ Seeded daily mission templates");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
