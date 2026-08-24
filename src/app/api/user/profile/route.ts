export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      ownedItems: { include: { item: true } },
      equippedItems: true,
    },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    coins: user.coins,
    gems: user.gems,
    xp: user.xp,
    level: user.level,
    streak: user.streak,
    totalPomodoros: user.totalPomodoros,
    ownedItemIds: user.ownedItems.map((ui) => ui.itemId),
    equippedItems: user.equippedItems,
  });
}

