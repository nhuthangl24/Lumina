
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { name, image, password } = body;

    const dataToUpdate: any = {};
    if (name) dataToUpdate.name = name;
    if (image) dataToUpdate.image = image;
    
    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, user: { name: updatedUser.name, image: updatedUser.image } });
  } catch (error) {
    console.error("Update profile error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
