export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Middleware doesn't protect API routes from direct access in all setups, so we double-check here.
async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role?.toString().toUpperCase() === "ADMIN";
}

// GET all users
export async function GET(req: Request) {
  if (!(await isAdmin())) return new NextResponse("Unauthorized", { status: 403 });

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } }
        ]
      },
      orderBy: { level: "desc" },
      take: 50,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        coins: true,
        gems: true,
        xp: true,
        level: true,
        role: true,
        status: true,
        totalPomodoros: true
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("GET admin users:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// UPDATE user (Admin edit)
export async function PATCH(req: Request) {
  if (!(await isAdmin())) return new NextResponse("Unauthorized", { status: 403 });

  try {
    const body = await req.json();
    const { userId, action, payload } = body;

    if (!userId) return new NextResponse("User ID required", { status: 400 });

    if (action === "edit_balances") {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          coins: payload.coins !== undefined ? payload.coins : undefined,
          gems: payload.gems !== undefined ? payload.gems : undefined,
          xp: payload.xp !== undefined ? payload.xp : undefined,
          level: payload.level !== undefined ? payload.level : undefined,
        }
      });
      return NextResponse.json(updated);
    }
    
    if (action === "change_role") {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { role: payload.role } // "ADMIN" or "USER"
      });
      return NextResponse.json(updated);
    }

    return new NextResponse("Invalid action", { status: 400 });
  } catch (error) {
    console.error("PATCH admin users:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

