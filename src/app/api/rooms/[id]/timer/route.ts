import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";



// POST: Host controls the timer
export async function POST(req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const room = await prisma.room.findUnique({ where: { id: params.id } });
    if (!room) return new NextResponse("Room not found", { status: 404 });

    // Only host or moderator can control timer
    if (room.hostId !== session.user.id) {
      return new NextResponse("Only the host can control the timer", { status: 403 });
    }

    const body = await req.json();
    const { action, duration } = body; // action: "start_focus", "start_break", "stop"

    let timerStatus = "idle";
    let timerStart: Date | null = null;
    let timerDuration: number | null = null;

    if (action === "start_focus") {
      timerStatus = "focusing";
      timerStart = new Date();
      timerDuration = duration || 25 * 60; // Default 25 min
    } else if (action === "start_break") {
      timerStatus = "break";
      timerStart = new Date();
      timerDuration = duration || 5 * 60; // Default 5 min
    } else if (action === "pause") {
      timerStatus = "paused";
      timerStart = null;
      timerDuration = duration; // Save remaining time
    } else if (action === "stop") {
      timerStatus = "idle";
    }

    await prisma.room.update({
      where: { id: params.id },
      data: { timerStatus, timerStart, timerDuration }
    });

    // Update all members status
    if (timerStatus === "focusing") {
      await prisma.user.updateMany({
        where: {
          roomMemberships: { some: { roomId: params.id } }
        },
        data: { status: "focusing" }
      });
    } else if (timerStatus === "break") {
      await prisma.user.updateMany({
        where: {
          roomMemberships: { some: { roomId: params.id } }
        },
        data: { status: "break" }
      });
    } else {
      await prisma.user.updateMany({
        where: {
          roomMemberships: { some: { roomId: params.id } }
        },
        data: { status: "online" }
      });
    }

    // If focus just ended, update stats
    if (action === "stop" && room.timerStatus === "focusing" && room.timerStart && room.timerDuration) {
      const elapsed = Math.floor((Date.now() - room.timerStart.getTime()) / 1000);
      const focusMinutes = Math.min(Math.floor(elapsed / 60), room.timerDuration / 60);
      const today = new Date().toISOString().split("T")[0];

      await prisma.roomStats.upsert({
        where: { roomId_date: { roomId: params.id, date: today } },
        update: {
          totalFocusMinutes: { increment: focusMinutes },
          totalPomodoros: { increment: 1 }
        },
        create: {
          roomId: params.id,
          date: today,
          totalFocusMinutes: focusMinutes,
          totalPomodoros: 1
        }
      });

      // Party buff: give XP bonus based on member count
      const memberCount = await prisma.roomMember.count({ where: { roomId: params.id } });
      let buffMultiplier = 1.0;
      if (memberCount >= 4) buffMultiplier = 1.25;
      else if (memberCount >= 2) buffMultiplier = 1.10;

      const baseXp = Math.floor(focusMinutes * 2);
      const baseCoins = Math.floor(focusMinutes * 1.5);
      const bonusXp = Math.floor(baseXp * buffMultiplier);
      const bonusCoins = Math.floor(baseCoins * buffMultiplier);

      // Award XP/coins to all members
      const members = await prisma.roomMember.findMany({ where: { roomId: params.id } });
      for (const member of members) {
        await prisma.user.update({
          where: { id: member.userId },
          data: {
            xp: { increment: bonusXp },
            coins: { increment: bonusCoins },
            totalPomodoros: { increment: 1 }
          }
        });
      }

      // Update room challenge progress
      await prisma.roomChallenge.updateMany({
        where: { roomId: params.id, isCompleted: false },
        data: { currentCount: { increment: 1 } }
      });
    }

    return NextResponse.json({ success: true, timerStatus, timerStart, timerDuration });
  } catch (error) {
    console.error("TIMER:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
