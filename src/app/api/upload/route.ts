import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { savePhoto, uploadImageToStorage } from "@/lib/storage";
import { Photo } from "@/lib/types";

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

    // Validate it's an image
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExtension = file.name.split(".").pop() || "jpg";
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;

    // Upload to Firebase Storage
    const buffer = Buffer.from(await file.arrayBuffer());
    const imageUrl = await uploadImageToStorage(buffer, uniqueFilename, file.type);

    // Create photo record with random rotation for that authentic polaroid feel
    const rotation = (Math.random() - 0.5) * 8; // Between -4 and 4 degrees

    const photo: Photo = {
      id: uuidv4(),
      filename: uniqueFilename,
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
      rotation,
      imageUrl,
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
