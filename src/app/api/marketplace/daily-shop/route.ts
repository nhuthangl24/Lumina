import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // 1. Check if DailyShop exists for today
    let dailyShop = await prisma.dailyShop.findUnique({
      where: { date: today },
      include: { items: { include: { item: true } } }
    });

    // 2. If it doesn't exist, generate one
    if (!dailyShop) {
      // Fetch all items that cost something
      const allPaidItems = await prisma.marketplaceItem.findMany({
        where: { OR: [{ price: { gt: 0 } }, { gemPrice: { gt: 0 } }] }
      });

      if (allPaidItems.length === 0) {
        return NextResponse.json([]); // No items available to put in shop
      }

      // Shuffle and pick up to 4 items
      const shuffled = allPaidItems.sort(() => 0.5 - Math.random());
      const selectedItems = shuffled.slice(0, Math.min(4, shuffled.length));

      // Create new DailyShop
      const newShop = await prisma.dailyShop.create({
        data: {
          date: today,
          items: {
            create: selectedItems.map(item => {
              // Random discount between 20% and 50%
              const discount = Math.floor(Math.random() * (50 - 20 + 1) + 20);
              return {
                itemId: item.id,
                discount: discount,
              };
            })
          }
        }
      });

      // Refetch to get the nested items
      dailyShop = await prisma.dailyShop.findUnique({
        where: { id: newShop.id },
        include: { items: { include: { item: true } } }
      });
    }

    if (!dailyShop) return NextResponse.json([]);

    // 3. Format the response
    const formattedItems = dailyShop.items.map(dsItem => {
      const originalItem = dsItem.item;
      return {
        ...originalItem,
        originalPrice: originalItem.price,
        originalGemPrice: originalItem.gemPrice,
        price: Math.floor(originalItem.price * (1 - dsItem.discount / 100)),
        gemPrice: Math.floor(originalItem.gemPrice * (1 - dsItem.discount / 100)),
        discount: dsItem.discount,
        isDailyShop: true
      };
    });

    return NextResponse.json(formattedItems);
  } catch (error) {
    console.error("GET daily shop error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
