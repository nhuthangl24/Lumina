export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    // Check if the request is coming from Vercel Cron (Optional security check)
    const authHeader = req.headers.get('authorization');
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Perform a lightweight query to keep the database awake
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({ success: true, message: 'Supabase is awake!' });
  } catch (error) {
    console.error('Failed to wake up Supabase:', error);
    return NextResponse.json({ success: false, error: 'Database ping failed' }, { status: 500 });
  }
}

