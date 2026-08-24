import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title, content, type, targetEmail } = await req.json();

    if (!title || !content || !type) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    let targetUserId: string | null = null;

    if (type === "USER") {
      if (!targetEmail) {
        return new NextResponse("Target email required for USER type notification", { status: 400 });
      }
      const targetUser = await prisma.user.findUnique({ where: { email: targetEmail } });
      if (!targetUser) {
        return new NextResponse("User not found with that email", { status: 404 });
      }
      targetUserId = targetUser.id;
    }

    const notification = await prisma.notification.create({
      data: {
        title,
        content,
        type,
        targetUserId: type === "USER" ? targetUserId : null,
      }
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error("[ADMIN_NOTIFICATIONS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
