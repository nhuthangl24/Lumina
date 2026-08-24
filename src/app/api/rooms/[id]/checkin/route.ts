import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";


// POST: User confirms they're still focusing
export async function POST(req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });



    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("CHECKIN:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
