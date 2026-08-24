import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    
    // Fetch system notifications and user-specific notifications
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { type: "SYSTEM" },
          { type: "USER", targetUserId: userId }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20 // Limit to latest 20
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("[NOTIFICATIONS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
