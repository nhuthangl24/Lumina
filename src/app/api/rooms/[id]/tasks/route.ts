import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";



export async function POST(req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { content } = await req.json();
    if (!content) return new NextResponse("Content required", { status: 400 });

    const task = await prisma.roomTask.create({
      data: {
        roomId: params.id,
        userId: session.user.id,
        content,
      },
      include: { user: { select: { id: true, name: true, image: true } } }
    });


    return NextResponse.json(task);
  } catch (error) {
    console.error("POST task:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
