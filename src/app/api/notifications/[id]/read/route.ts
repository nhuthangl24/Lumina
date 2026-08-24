import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    // Ideally, for system notifications, you'd need a separate table to track read state per user.
    // For simplicity, we assume notifications are marked globally read (if single user).
    // Let's check if the notification belongs to this user.
    const notif = await prisma.notification.findUnique({ where: { id } });
    if (!notif) {
      return new NextResponse("Not found", { status: 404 });
    }

    if (notif.type === "USER" && notif.targetUserId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[NOTIFICATIONS_READ_PUT]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
