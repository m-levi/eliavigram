import { NextRequest, NextResponse } from "next/server";
import { getPhotos } from "@/lib/storage";
import { analyzePhotoForSimilarity, calculateSimilarityScore } from "@/lib/ai";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const photos = await getPhotos();

    // Find the target photo
    const targetPhoto = photos.find((p) => p.id === id);
    if (!targetPhoto) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // Skip videos
    if (targetPhoto.mediaType === "video") {
      return NextResponse.json({ similar: [], message: "Videos not supported" });
    }

    // Fetch and analyze the target photo
    const targetResponse = await fetch(targetPhoto.imageUrl);
    const targetBuffer = Buffer.from(await targetResponse.arrayBuffer());
    const targetBase64 = targetBuffer.toString("base64");
    const targetMimeType = targetPhoto.imageUrl.includes(".png")
      ? "image/png"
      : "image/jpeg";

    const targetKeywords = await analyzePhotoForSimilarity(
      targetBase64,
      targetMimeType
    );

    if (!targetKeywords.length) {
      return NextResponse.json({ similar: [], keywords: [] });
    }

    // Analyze other photos and find similar ones
    const otherPhotos = photos.filter(
      (p) => p.id !== id && p.mediaType !== "video"
    );

    const similarities: { photo: typeof targetPhoto; score: number }[] = [];

    // Limit to analyzing 10 photos max to avoid timeout
    const photosToAnalyze = otherPhotos.slice(0, 10);

    for (const photo of photosToAnalyze) {
      try {
        const response = await fetch(photo.imageUrl);
        const buffer = Buffer.from(await response.arrayBuffer());
        const base64 = buffer.toString("base64");
        const mimeType = photo.imageUrl.includes(".png")
          ? "image/png"
          : "image/jpeg";

        const keywords = await analyzePhotoForSimilarity(base64, mimeType);
        const score = calculateSimilarityScore(targetKeywords, keywords);

        if (score > 0.1) {
          // At least 10% similarity
          similarities.push({ photo, score });
        }
      } catch (error) {
        console.error(`Failed to analyze photo ${photo.id}:`, error);
      }
    }

    // Sort by similarity score and return top 4
    similarities.sort((a, b) => b.score - a.score);
    const topSimilar = similarities.slice(0, 4).map((s) => ({
      ...s.photo,
      similarityScore: Math.round(s.score * 100),
    }));

    return NextResponse.json({
      similar: topSimilar,
      keywords: targetKeywords,
    });
  } catch (error) {
    console.error("Error finding similar photos:", error);
    return NextResponse.json(
      { error: "Failed to find similar photos" },
      { status: 500 }
    );
  }
}
