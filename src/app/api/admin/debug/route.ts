export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getToken } from "next-auth/jwt";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const token = await getToken({ req: req as any });
  
  return NextResponse.json({
    session,
    token
  });
}

