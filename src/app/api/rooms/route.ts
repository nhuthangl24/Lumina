export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// GET: List public rooms
export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      where: { isPrivate: false },
      include: {
        host: { select: { name: true, image: true } },
        members: { include: { user: { select: { id: true, name: true, image: true, status: true } } } },
        _count: { select: { members: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return NextResponse.json(rooms);
  } catch (error) {
    console.error("GET rooms:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST: Create a room
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { name, isPrivate, maxMembers } = body;

    if (!name) return new NextResponse("Name required", { status: 400 });

    let code = generateCode();
    // Ensure unique
    while (await prisma.room.findUnique({ where: { code } })) {
      code = generateCode();
    }

    const room = await prisma.room.create({
      data: {
        name,
        code,
        hostId: session.user.id,
        isPrivate: isPrivate || false,
        maxMembers: maxMembers || 10,
        members: {
          create: { userId: session.user.id }
        }
      },
      include: {
        host: { select: { name: true, image: true } },
        members: { include: { user: { select: { id: true, name: true, image: true, status: true } } } },
      }
    });

    // Update user status
    await prisma.user.update({
      where: { id: session.user.id },
      data: { status: "online", roomCode: code }
    });

    return NextResponse.json(room);
  } catch (error) {
    console.error("POST rooms:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

