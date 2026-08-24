export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET room details
export async function GET(req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const room = await prisma.room.findUnique({
      where: { id: params.id },
      include: {
        host: { select: { id: true, name: true, image: true } },
        members: {
          where: { isKicked: false },
          include: {
            user: { select: { id: true, name: true, image: true, status: true, level: true, totalPomodoros: true } }
          }
        },
        tasks: {
          include: { user: { select: { id: true, name: true, image: true } } },
          orderBy: { createdAt: "desc" }
        },
        challenges: { orderBy: { createdAt: "desc" }, take: 5 },
        achievements: { orderBy: { unlockedAt: "desc" } },
        stats: { orderBy: { date: "desc" }, take: 7 },
        _count: { select: { members: true } }
      }
    });

    if (!room) return new NextResponse("Room not found", { status: 404 });
    return NextResponse.json(room);
  } catch (error) {
    console.error("GET room:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
