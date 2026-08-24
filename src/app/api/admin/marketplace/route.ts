import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role?.toString().toUpperCase() === "ADMIN";
}

// GET all items
export async function GET(req: Request) {
  if (!(await isAdmin())) return new NextResponse("Unauthorized", { status: 403 });

  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const items = await prisma.marketplaceItem.findMany({
      where: category ? { category } : undefined,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("GET admin marketplace:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// CREATE new item
export async function POST(req: Request) {
  if (!(await isAdmin())) return new NextResponse("Unauthorized", { status: 403 });

  try {
    const body = await req.json();
    
    const newItem = await prisma.marketplaceItem.create({
      data: {
        name: body.name,
        description: body.description,
        category: body.category,
        subCategory: body.subCategory || null,
        price: parseInt(body.price) || 0,
        gemPrice: parseInt(body.gemPrice) || 0,
        rarity: body.rarity || "common",
        imageUrl: body.imageUrl || null,
        isLimited: body.isLimited || false,
        isFeatured: body.isFeatured || false,
        unlockLevel: parseInt(body.unlockLevel) || 0,
      }
    });

    return NextResponse.json(newItem);
  } catch (error) {
    console.error("POST admin marketplace:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// UPDATE item
export async function PATCH(req: Request) {
  if (!(await isAdmin())) return new NextResponse("Unauthorized", { status: 403 });

  try {
    const body = await req.json();
    const { id, ...data } = body;
    
    if (!id) return new NextResponse("ID required", { status: 400 });

    const updatedItem = await prisma.marketplaceItem.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        subCategory: data.subCategory || null,
        price: parseInt(data.price) || 0,
        gemPrice: parseInt(data.gemPrice) || 0,
        rarity: data.rarity || "common",
        imageUrl: data.imageUrl || null,
        isLimited: data.isLimited || false,
        isFeatured: data.isFeatured || false,
        unlockLevel: parseInt(data.unlockLevel) || 0,
      }
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("PATCH admin marketplace:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE item
export async function DELETE(req: Request) {
  if (!(await isAdmin())) return new NextResponse("Unauthorized", { status: 403 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) return new NextResponse("ID required", { status: 400 });

    // Delete related records first to avoid foreign key constraint errors
    await prisma.$transaction([
      prisma.userItem.deleteMany({ where: { itemId: id } }),
      prisma.dailyShopItem.deleteMany({ where: { itemId: id } }),
      prisma.marketplaceItem.delete({ where: { id } })
    ]);

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("DELETE admin marketplace:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
