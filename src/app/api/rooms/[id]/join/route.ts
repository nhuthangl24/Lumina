import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";



export async function POST(req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const room = await prisma.room.findUnique({
      where: { id: params.id },
      include: { _count: { select: { members: true } } }
    });

    if (!room) return new NextResponse("Room not found", { status: 404 });
    if (room._count.members >= room.maxMembers) return new NextResponse("Room is full", { status: 400 });

    // Check if already a member or kicked
    const existing = await prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId: params.id, userId: session.user.id } }
    });

    if (existing) {
      if (existing.isKicked) {
        return new NextResponse("Bạn đã bị cấm khỏi phòng này", { status: 403 });
      }
      return NextResponse.json({ message: "Already in room" });
    }

    await prisma.roomMember.create({
      data: { roomId: params.id, userId: session.user.id }
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { status: "online", roomCode: room.code }
    });



    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("JOIN room:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
