export interface Comment {
  id: string;
  text: string;
  author: string;
  authorProfilePic?: string;
  createdAt: string;
}

export interface Like {
  userName: string;
  userProfilePic?: string;
  createdAt: string;
}

export type MediaType = "image" | "video";

export interface Photo {
  id: string;
  filename: string;
  originalName: string;
  caption?: string;
  comment?: Comment; // Legacy single comment for backward compatibility
  comments?: Comment[]; // Multiple comments support
  likes?: Like[];
  uploadedAt: string;
  rotation: number;
  imageUrl: string;
  mediaType?: MediaType; // Optional for backward compatibility (defaults to "image")
}

export interface UserProfile {
  name: string;
  profilePicUrl?: string;
  createdAt: string;
}

export interface PhotoStore {
  photos: Photo[];
}
