export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

const MISSION_TEMPLATES = [
  {
    id: "daily-login",
    name: "Đăng nhập hàng ngày",
    description: "Đăng nhập vào Lumina hôm nay",
    type: "login",
    target: 1,
    coinReward: 20,
    xpReward: 20,
    gemReward: 0,
  },
  {
    id: "daily-pomodoro-2",
    name: "Tập trung nhỏ",
    description: "Hoàn thành 2 Pomodoro",
    type: "complete_pomodoro",
    target: 2,
    coinReward: 30,
    xpReward: 50,
    gemReward: 0,
  },
  {
    id: "daily-task-3",
    name: "Giải quyết công việc",
    description: "Hoàn thành 3 Task",
    type: "complete_task",
    target: 3,
    coinReward: 25,
    xpReward: 40,
    gemReward: 0,
  },
  {
    id: "daily-focus-60",
    name: "Phiên tập trung sâu",
    description: "Tập trung tổng cộng 60 phút",
    type: "focus_minutes",
    target: 60,
    coinReward: 50,
    xpReward: 80,
    gemReward: 0,
  },
];

// GET - fetch today's missions (auto-create if not exist)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = todayStr();

  // Check if missions exist for today
  let missions = await prisma.userDailyMission.findMany({
    where: { userId: session.user.id, date: today },
    orderBy: { missionId: "asc" },
  });

  // Create today's missions if not exist
  if (missions.length === 0) {
    let templates = await prisma.dailyMissionTemplate.findMany();

    if (templates.length === 0) {
      // Seed initial templates if DB is empty
      await prisma.dailyMissionTemplate.createMany({
        data: MISSION_TEMPLATES.map(m => ({
          name: m.name,
          description: m.description,
          type: m.type,
          target: m.target,
          coinReward: m.coinReward,
          xpReward: m.xpReward,
          gemReward: m.gemReward,
        }))
      });
      templates = await prisma.dailyMissionTemplate.findMany();
    }

    await prisma.userDailyMission.createMany({
      data: templates.map(m => ({
        userId: session.user.id!,
        date: today,
        missionId: m.id,
        missionName: m.name,
        description: m.description,
        type: m.type,
        target: m.target,
        coinReward: m.coinReward,
        xpReward: m.xpReward,
        gemReward: m.gemReward,
        progress: m.type === "login" ? 1 : 0, // Auto-complete login on first fetch
        completed: m.type === "login",
      })),
    });

    missions = await prisma.userDailyMission.findMany({
      where: { userId: session.user.id, date: today },
    });
  }

  return NextResponse.json(missions);
}

// POST - update mission progress
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { type, amount = 1 } = body; // type: "complete_pomodoro" | "complete_task" | "focus_minutes"

  const today = todayStr();

  const missions = await prisma.userDailyMission.findMany({
    where: { userId: session.user.id, date: today, type, completed: false },
  });

  const rewards = { coins: 0, xp: 0, gems: 0, completed: [] as string[] };

  for (const mission of missions) {
    const newProgress = Math.min(mission.progress + amount, mission.target);
    const isNowComplete = newProgress >= mission.target;

    await prisma.userDailyMission.update({
      where: { id: mission.id },
      data: {
        progress: newProgress,
        completed: isNowComplete,
        claimedAt: isNowComplete ? new Date() : undefined,
      },
    });

    if (isNowComplete) {
      rewards.coins += mission.coinReward;
      rewards.xp += mission.xpReward;
      rewards.gems += mission.gemReward;
      rewards.completed.push(mission.missionName);
    }
  }

  // Apply rewards
  if (rewards.coins > 0 || rewards.xp > 0) {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    const newXp = (user?.xp ?? 0) + rewards.xp;
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        coins: { increment: rewards.coins },
        xp: { increment: rewards.xp },
        gems: rewards.gems > 0 ? { increment: rewards.gems } : undefined,
        level: Math.floor(newXp / 500) + 1,
      },
    });
  }

  return NextResponse.json({ success: true, rewards });
}

