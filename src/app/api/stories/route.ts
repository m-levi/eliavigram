import { NextResponse } from "next/server";
import { getPhotos } from "@/lib/storage";
import { generateStoryThemes } from "@/lib/ai";

export async function GET() {
  try {
    const photos = await getPhotos();

    if (photos.length === 0) {
      return NextResponse.json({ stories: [] });
    }

    // Generate AI story themes
    const stories = await generateStoryThemes(photos);

    return NextResponse.json({ stories });
  } catch (error) {
    console.error("Error generating stories:", error);
    return NextResponse.json(
      { error: "Failed to generate stories" },
      { status: 500 }
    );
  }
}
