export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role?.toString().toUpperCase() === "ADMIN";
}

// GET all active rooms
export async function GET(req: Request) {
  if (!(await isAdmin())) return new NextResponse("Unauthorized", { status: 403 });

  try {
    const rooms = await prisma.room.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        host: { select: { id: true, name: true, email: true } },
        _count: { select: { members: true } }
      }
    });

    return NextResponse.json(rooms);
  } catch (error) {
    console.error("GET admin rooms:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE a room
export async function DELETE(req: Request) {
  if (!(await isAdmin())) return new NextResponse("Unauthorized", { status: 403 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) return new NextResponse("Room ID required", { status: 400 });

    await prisma.room.delete({
      where: { id }
    });

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("DELETE admin room:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

