import { NextRequest, NextResponse } from "next/server";
import { deletePhoto, updatePhotoComment, addCommentToPhoto, toggleLikeOnPhoto } from "@/lib/storage";
import { Comment } from "@/lib/types";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deletePhoto(id);

    if (!success) {
      return NextResponse.json(
        { error: "Photo not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting photo:", error);
    return NextResponse.json(
      { error: "Failed to delete photo" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Handle legacy comment update (replace)
    if (body.comment && !body.action) {
      const { comment } = body as { comment: Comment };
      const success = await updatePhotoComment(id, comment);

      if (!success) {
        return NextResponse.json(
          { error: "Photo not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true });
    }

    // Handle new actions
    if (body.action === "add_comment") {
      const { comment } = body as { comment: Comment };
      const result = await addCommentToPhoto(id, comment);

      if (!result) {
        return NextResponse.json(
          { error: "Photo not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, photo: result });
    }

    if (body.action === "toggle_like") {
      const { userName, userProfilePic } = body as { userName: string; userProfilePic?: string };
      const result = await toggleLikeOnPhoto(id, userName, userProfilePic);

      if (!result) {
        return NextResponse.json(
          { error: "Photo not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, liked: result.liked, photo: result.photo });
    }

    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating photo:", error);
    return NextResponse.json(
      { error: "Failed to update photo" },
      { status: 500 }
    );
  }
}
