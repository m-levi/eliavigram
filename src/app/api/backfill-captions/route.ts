import { NextResponse } from "next/server";
import { getPhotos, updatePhotoCaption } from "@/lib/storage";
import { generatePhotoCaption } from "@/lib/ai";

export async function POST() {
  try {
    const photos = await getPhotos();

    // Filter photos without captions (only images, not videos)
    const photosNeedingCaptions = photos.filter(
      (p) => !p.caption && p.mediaType !== "video"
    );

    if (photosNeedingCaptions.length === 0) {
      return NextResponse.json({
        message: "All photos already have captions",
        processed: 0,
      });
    }

    let processed = 0;
    let failed = 0;
    const results: { id: string; caption: string }[] = [];

    for (const photo of photosNeedingCaptions) {
      try {
        // Fetch the image
        const response = await fetch(photo.imageUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString("base64");

        // Determine mime type from URL or default to jpeg
        const mimeType = photo.imageUrl.includes(".png")
          ? "image/png"
          : photo.imageUrl.includes(".gif")
          ? "image/gif"
          : photo.imageUrl.includes(".webp")
          ? "image/webp"
          : "image/jpeg";

        // Generate caption
        const caption = await generatePhotoCaption(base64, mimeType);

        if (caption) {
          await updatePhotoCaption(photo.id, caption);
          results.push({ id: photo.id, caption });
          processed++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`Failed to process photo ${photo.id}:`, error);
        failed++;
      }
    }

    return NextResponse.json({
      message: `Processed ${processed} photos, ${failed} failed`,
      processed,
      failed,
      total: photosNeedingCaptions.length,
      results,
    });
  } catch (error) {
    console.error("Backfill error:", error);
    return NextResponse.json(
      { error: "Failed to backfill captions" },
      { status: 500 }
    );
  }
}
