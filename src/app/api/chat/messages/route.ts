export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";



export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");
    const friendId = searchParams.get("friendId");

    let whereClause: any = { roomId: roomId || null };

    // If friendId is provided, this is a private chat between session.user.id and friendId
    if (friendId) {
      whereClause = {
        OR: [
          { senderId: session.user.id, receiverId: friendId },
          { senderId: friendId, receiverId: session.user.id },
        ],
        roomId: null // Ensure it's not a room message
      };
    }

    const messages = await prisma.message.findMany({
      where: whereClause,
      include: {
        sender: {
          select: { name: true, image: true, id: true, level: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(messages.reverse());
  } catch (error) {
    console.error("GET messages error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { content, roomId, receiverId } = body;

    if (!content) {
      return new NextResponse("Content is required", { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId: session.user.id,
        roomId: roomId || null,
        receiverId: receiverId || null,
      },
      include: {
        sender: {
          select: { name: true, image: true, id: true, level: true }
        }
      }
    });

    // Broadcast via Pusher
    let channel = "presence-global";
    if (roomId) {
      channel = `presence-room-${roomId}`;
    } else if (receiverId) {
      // Private chat channel naming convention: private-chat-[minId]-[maxId]
      const minId = session.user.id < receiverId ? session.user.id : receiverId;
      const maxId = session.user.id > receiverId ? session.user.id : receiverId;
      channel = `private-chat-${minId}-${maxId}`;
    }



    return NextResponse.json(message);
  } catch (error) {
    console.error("POST message error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

