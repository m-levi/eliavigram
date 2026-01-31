import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { savePhoto, uploadImageToStorage, checkDuplicatePhoto } from "@/lib/storage";
import { Photo, MediaType } from "@/lib/types";
import { generatePhotoCaption } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate it's an image or video
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: "File must be an image or video" },
        { status: 400 }
      );
    }

    const mediaType: MediaType = isVideo ? "video" : "image";

    // Check for duplicate photo
    const isDuplicate = await checkDuplicatePhoto(file.name);
    if (isDuplicate) {
      return NextResponse.json(
        { skipped: true, message: "Photo already exists", filename: file.name },
        { status: 200 }
      );
    }

    // Generate unique filename
    const fileExtension = file.name.split(".").pop() || "jpg";
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;

    // Upload to Firebase Storage
    const buffer = Buffer.from(await file.arrayBuffer());
    const imageUrl = await uploadImageToStorage(buffer, uniqueFilename, file.type);

    // Generate AI caption for images (not videos)
    let caption = "";
    if (isImage) {
      try {
        const base64 = buffer.toString("base64");
        caption = await generatePhotoCaption(base64, file.type);
      } catch (captionError) {
        console.error("Failed to generate AI caption:", captionError);
        // Continue without caption
      }
    }

    // Create photo record with random rotation for that authentic polaroid feel
    const rotation = (Math.random() - 0.5) * 8; // Between -4 and 4 degrees

    const photo: Photo = {
      id: uuidv4(),
      filename: uniqueFilename,
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
      rotation,
      imageUrl,
      mediaType,
      caption: caption || undefined,
    };

    await savePhoto(photo);

    return NextResponse.json(photo);
  } catch (error) {
    console.error("Error uploading file:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to upload file", details: errorMessage },
      { status: 500 }
    );
  }
}
