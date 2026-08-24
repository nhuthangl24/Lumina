import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";



export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const room = await prisma.room.findUnique({ where: { id } });
    if (!room) return new NextResponse("Room not found", { status: 404 });

    const { action, spotifyId } = await req.json();

    if (action === "set") {
      // Only host can set directly
      if (room.hostId !== session.user.id) return new NextResponse("Forbidden", { status: 403 });

      await prisma.room.update({
        where: { id },
        data: { currentPlaylist: spotifyId }
      });


      return NextResponse.json({ success: true, playlistId: spotifyId });
    }

    if (action === "vote") {
      // musicVotes is a JSON string: Record<string, string[]> (spotifyId -> array of userIds)
      let votes: Record<string, string[]> = {};
      if (room.musicVotes) {
        try { votes = JSON.parse(room.musicVotes); } catch (e) {}
      }

      // If user is voting for a new one, remove their vote from others
      for (const key in votes) {
        votes[key] = votes[key].filter(u => u !== session.user.id);
      }

      if (!votes[spotifyId]) votes[spotifyId] = [];
      votes[spotifyId].push(session.user.id);

      // Check if this playlist has the majority (e.g. > 50% of members)
      const memberCount = await prisma.roomMember.count({ where: { roomId: id } });
      const votesCount = votes[spotifyId].length;
      
      let newPlaylist = room.currentPlaylist;
      if (votesCount > memberCount / 2 && newPlaylist !== spotifyId) {
        newPlaylist = spotifyId;

      }

      await prisma.room.update({
        where: { id },
        data: { 
          musicVotes: JSON.stringify(votes),
          currentPlaylist: newPlaylist
        }
      });


      return NextResponse.json({ success: true, votes, newPlaylist });
    }

    return new NextResponse("Invalid action", { status: 400 });
  } catch (error) {
    console.error("MUSIC API:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
