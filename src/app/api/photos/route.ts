import { NextResponse } from "next/server";
import { getPhotos } from "@/lib/storage";

export async function GET() {
  try {
    const photos = await getPhotos();
    // Ensure we always return an array
    if (!Array.isArray(photos)) {
      console.error("getPhotos returned non-array:", photos);
      return NextResponse.json([]);
    }
    return NextResponse.json(photos);
  } catch (error) {
    console.error("Error fetching photos:", error);
    // Return empty array instead of error object so frontend doesn't break
    return NextResponse.json([]);
  }
}
