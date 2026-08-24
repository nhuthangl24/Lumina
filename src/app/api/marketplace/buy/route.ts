import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { itemId, useGems = false } = body;

    if (!itemId) return NextResponse.json({ error: "Item ID required" }, { status: 400 });

    const item = await prisma.marketplaceItem.findUnique({ where: { id: itemId } });
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    // Check if already owned
    const alreadyOwned = await prisma.userItem.findUnique({
      where: { userId_itemId: { userId: session.user.id, itemId } },
    });
    if (alreadyOwned) return NextResponse.json({ error: "Already owned" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Check if the item is in today's DailyShop to apply discount
    const today = new Date().toISOString().split("T")[0];
    const dailyShop = await prisma.dailyShop.findUnique({
      where: { date: today },
      include: { items: true }
    });

    let finalPrice = item.price;
    let finalGemPrice = item.gemPrice;

    if (dailyShop) {
      const shopItem = dailyShop.items.find(di => di.itemId === itemId);
      if (shopItem) {
        finalPrice = Math.floor(item.price * (1 - shopItem.discount / 100));
        finalGemPrice = Math.floor(item.gemPrice * (1 - shopItem.discount / 100));
      }
    }

    if (useGems) {
      if (item.gemPrice <= 0) return NextResponse.json({ error: "Item not purchasable with gems" }, { status: 400 });
      if (user.gems < finalGemPrice) return NextResponse.json({ error: "Not enough gems!" }, { status: 400 });

      await prisma.user.update({ where: { id: session.user.id }, data: { gems: { decrement: finalGemPrice } } });
    } else {
      if (item.price <= 0 && item.gemPrice > 0) return NextResponse.json({ error: "Use gems to buy this item" }, { status: 400 });
      if (user.coins < finalPrice) return NextResponse.json({ error: "Không đủ Xu!" }, { status: 400 });

      await prisma.user.update({ where: { id: session.user.id }, data: { coins: { decrement: finalPrice } } });
    }

    // Add to inventory
    await prisma.userItem.create({ data: { userId: session.user.id, itemId } });

    const updatedUser = await prisma.user.findUnique({ where: { id: session.user.id } });

    return NextResponse.json({
      success: true,
      coins: updatedUser!.coins,
      gems: updatedUser!.gems,
    });
  } catch (error) {
    console.error("Marketplace Buy Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
