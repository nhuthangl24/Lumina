import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const XP_PER_LEVEL = 500;

function calcLevel(xp: number) {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { type = "pomodoro", roomId, durationMinutes = 25 } = body; // "pomodoro" | "task" | "login"

  const REWARDS: Record<string, { coins: number; xp: number }> = {
    pomodoro: { coins: 10, xp: 30 },
    task:     { coins: 5,  xp: 15 },
    login:    { coins: 20, xp: 20 },
  };

  const reward = REWARDS[type] ?? REWARDS.pomodoro;

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Streak logic for login
  let newStreak = user.streak;
  if (type === "login") {
    const today = todayStr();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (user.lastLoginDate === today) {
      // Already logged in today, don't double-reward
      return NextResponse.json({ success: true, earned: { coins: 0, xp: 0 }, alreadyClaimed: true });
    } else if (user.lastLoginDate === yesterdayStr) {
      newStreak = user.streak + 1;
    } else if (user.lastLoginDate !== today) {
      newStreak = 1; // Streak reset
    }

    // Streak milestone bonus
    if (newStreak === 7)  { reward.coins += 100; reward.xp += 50; }
    if (newStreak === 30) { reward.coins += 500; reward.xp += 200; }
  }

  const newXp = user.xp + reward.xp;
  const newLevel = calcLevel(newXp);
  const leveledUp = newLevel > user.level;

  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      coins:           { increment: reward.coins },
      xp:              { increment: reward.xp },
      level:           newLevel,
      totalPomodoros:  type === "pomodoro" ? { increment: 1 } : undefined,
      streak:          newStreak,
      lastLoginDate:   type === "login" ? todayStr() : undefined,
      pomodorosToday:  type === "pomodoro" ? { increment: 1 } : undefined,
    },
  });

  let newRoomStats = undefined;
  if (type === "pomodoro" && roomId) {
    const todayString = todayStr();

    const existingStat = await prisma.roomStats.findFirst({
      where: { roomId, date: todayString }
    });

    if (existingStat) {
      newRoomStats = await prisma.roomStats.update({
        where: { id: existingStat.id },
        data: {
          totalPomodoros: { increment: 1 },
          totalFocusMinutes: { increment: durationMinutes }
        }
      });
    } else {
      newRoomStats = await prisma.roomStats.create({
        data: {
          roomId,
          date: todayString,
          totalPomodoros: 1,
          totalFocusMinutes: durationMinutes
        }
      });
    }
  }

  return NextResponse.json({
    success: true,
    earned: { coins: reward.coins, xp: reward.xp },
    user: {
      coins:          updatedUser.coins,
      xp:             updatedUser.xp,
      level:          updatedUser.level,
      streak:         updatedUser.streak,
      totalPomodoros: updatedUser.totalPomodoros,
    },
    leveledUp,
    newStreak,
    roomStats: newRoomStats
  });
}
