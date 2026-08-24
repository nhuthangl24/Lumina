import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { status, roomCode, action } = body;

    if (roomCode && action === "join") {
      const existingUser = await prisma.user.findFirst({
        where: { roomCode, status: { not: "offline" } }
      });
      if (!existingUser) {
        return NextResponse.json({ error: "Phòng không tồn tại hoặc đã đóng." }, { status: 404 });
      }
    }

    // Update user's presence
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        status: status || "online",
        roomCode: roomCode || null,
        lastSeenAt: new Date()
      }
    });

    if (!roomCode) {
      return NextResponse.json({ success: true, room: [] });
    }

    // Mark users offline if they haven't sent a heartbeat in 30 seconds
    const offlineThreshold = new Date(Date.now() - 30 * 1000);
    await prisma.user.updateMany({
      where: { 
        roomCode, 
        lastSeenAt: { lt: offlineThreshold },
        status: { not: "offline" }
      },
      data: { status: "offline", roomCode: null }
    });

    // Fetch everyone in the room
    const roomUsers = await prisma.user.findMany({
      where: { roomCode, status: { not: "offline" } },
      select: {
        id: true,
        name: true,
        image: true,
        status: true,
        level: true
      }
    });

    return NextResponse.json({ success: true, room: roomUsers });
  } catch (error) {
    console.error("Error in room heartbeat:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
