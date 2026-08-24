import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");

  const where: any = {};
  if (category && category !== "all") where.category = category;
  if (featured === "true") where.isFeatured = true;

  const items = await prisma.marketplaceItem.findMany({
    where,
    orderBy: [{ isFeatured: "desc" }, { rarity: "asc" }, { price: "asc" }],
  });

  return NextResponse.json(items);
}
