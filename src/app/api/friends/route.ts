export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          { friendId: session.user.id }
        ]
      },
      include: {
        user: { select: { id: true, name: true, image: true, level: true, status: true } },
        friend: { select: { id: true, name: true, image: true, level: true, status: true } }
      }
    });

    const friends = friendships.map(f => {
      const isSender = f.userId === session.user.id;
      const otherUser = isSender ? f.friend : f.user;
      return {
        id: f.id,
        user: otherUser,
        status: f.status,
        isSender
      };
    });

    return NextResponse.json(friends);
  } catch (error) {
    console.error("Error fetching friends:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, friendId, friendshipId } = body;

    if (action === "add") {
      // Check if exists
      const existing = await prisma.friendship.findFirst({
        where: {
          OR: [
            { userId: session.user.id, friendId },
            { userId: friendId, friendId: session.user.id }
          ]
        }
      });
      if (existing) {
        return NextResponse.json({ error: "Already exists" }, { status: 400 });
      }
      await prisma.friendship.create({
        data: { userId: session.user.id, friendId, status: "pending" }
      });
      return NextResponse.json({ success: true });
    }

    if (action === "accept" && friendshipId) {
      await prisma.friendship.update({
        where: { id: friendshipId, friendId: session.user.id },
        data: { status: "accepted" }
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error managing friends:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await prisma.friendship.deleteMany({
      where: {
        id,
        OR: [
          { userId: session.user.id },
          { friendId: session.user.id }
        ]
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting friend:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

