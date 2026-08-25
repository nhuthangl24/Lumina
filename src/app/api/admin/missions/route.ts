export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role?.toString().toUpperCase() === "ADMIN";
}

// GET all templates
export async function GET() {
  if (!(await isAdmin())) return new NextResponse("Unauthorized", { status: 403 });

  try {
    const templates = await prisma.dailyMissionTemplate.findMany();
    return NextResponse.json(templates);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// CREATE new template
export async function POST(req: Request) {
  if (!(await isAdmin())) return new NextResponse("Unauthorized", { status: 403 });

  try {
    const data = await req.json();
    const newTemplate = await prisma.dailyMissionTemplate.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        target: data.target,
        coinReward: data.coinReward,
        gemReward: data.gemReward,
        xpReward: data.xpReward,
      }
    });
    return NextResponse.json(newTemplate);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// UPDATE template
export async function PATCH(req: Request) {
  if (!(await isAdmin())) return new NextResponse("Unauthorized", { status: 403 });

  try {
    const data = await req.json();
    const updated = await prisma.dailyMissionTemplate.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        target: data.target,
        coinReward: data.coinReward,
        gemReward: data.gemReward,
        xpReward: data.xpReward,
      }
    });
    return NextResponse.json(updated);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE template
export async function DELETE(req: Request) {
  if (!(await isAdmin())) return new NextResponse("Unauthorized", { status: 403 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) return new NextResponse("ID required", { status: 400 });

    // Delete users' daily missions of this type as well
    await prisma.userDailyMission.deleteMany({
      where: { missionId: id }
    });

    await prisma.dailyMissionTemplate.delete({
      where: { id }
    });

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

