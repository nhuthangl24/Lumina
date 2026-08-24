import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";



export async function POST(req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json().catch(() => ({}));
    const targetUserId = body.targetUserId;

    const room = await prisma.room.findUnique({
      where: { id: params.id },
      include: { members: true }
    });

    if (!room) return new NextResponse("Not Found", { status: 404 });

    if (targetUserId) {
      // KICK logic
      if (room.hostId !== session.user.id) return new NextResponse("Forbidden", { status: 403 });
      
      await prisma.roomMember.update({
        where: { roomId_userId: { roomId: params.id, userId: targetUserId } },
        data: { isKicked: true }
      });

      await prisma.user.update({
        where: { id: targetUserId },
        data: { status: "online", roomCode: null }
      });
      
      return NextResponse.json({ success: true, kicked: true });
    }

    // LEAVE logic
    await prisma.roomMember.deleteMany({
      where: { roomId: params.id, userId: session.user.id }
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { status: "online", roomCode: null }
    });

    // If host left, transfer or delete room
    const updatedRoom = await prisma.room.findUnique({
      where: { id: params.id },
      include: { members: { where: { isKicked: false } } }
    });

    if (updatedRoom) {
      if (updatedRoom.members.length === 0) {
        // Delete empty room
        await prisma.room.delete({ where: { id: params.id } });
      } else if (updatedRoom.hostId === session.user.id) {
        // Transfer host
        await prisma.room.update({
          where: { id: params.id },
          data: { hostId: updatedRoom.members[0].userId }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("LEAVE room:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
