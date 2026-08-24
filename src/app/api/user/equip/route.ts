import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, item } = body;

    if (!action) {
      return NextResponse.json({ error: "Missing action" }, { status: 400 });
    }

    // Ensure UserEquipped exists
    let equipped = await prisma.userEquipped.findUnique({
      where: { userId: session.user.id }
    });

    if (!equipped) {
      equipped = await prisma.userEquipped.create({
        data: { userId: session.user.id }
      });
    }

    if (action === "unequip_all") {
      await prisma.userEquipped.update({
        where: { userId: session.user.id },
        data: {
          roomThemeId: null,
          weatherId: null,
          lightingId: null,
          ambientSoundId: null,
          petId: null,
          effectId: null,
          cursorId: null,
        }
      });
      return NextResponse.json({ success: true });
    }

    if (action === "add_upload" && item?.url) {
      console.log("ADD UPLOAD FIRED", item.url, equipped.customUploads);
      const currentUploads = JSON.parse(equipped.customUploads || "[]");
      if (!currentUploads.includes(item.url)) {
        currentUploads.push(item.url);
        await prisma.userEquipped.update({
          where: { userId: session.user.id },
          data: { customUploads: JSON.stringify(currentUploads) }
        });
      }
      return NextResponse.json({ success: true });
    }

    if (action === "equip" && item) {
      const { category, id, imageUrl } = item;
      const updateData: any = {};

      switch (category) {
        case "room_theme":
        case "uploads":
          updateData.roomThemeId = id;
          if (imageUrl) {
            updateData.backgroundUrl = imageUrl;
            if (id === "custom") {
              const currentUploads = JSON.parse(equipped.customUploads || "[]");
              if (!currentUploads.includes(imageUrl)) {
                currentUploads.push(imageUrl);
                updateData.customUploads = JSON.stringify(currentUploads);
              }
            }
          }
          break;
        case "weather":
          updateData.weatherId = id;
          break;
        case "lighting":
          updateData.lightingId = id;
          break;
        case "ambient_sound":
          updateData.ambientSoundId = id;
          break;
        case "pet":
          updateData.petId = id;
          break;
        case "effect":
          updateData.effectId = id;
          break;
        case "cursor":
          updateData.cursorId = id;
          break;
        default:
          return NextResponse.json({ error: "Invalid category" }, { status: 400 });
      }

      await prisma.userEquipped.update({
        where: { userId: session.user.id },
        data: updateData
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error in /api/user/equip:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
