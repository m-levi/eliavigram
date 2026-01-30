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
}

export interface UserProfile {
  name: string;
  profilePicUrl?: string;
  createdAt: string;
}

export interface PhotoStore {
  photos: Photo[];
}
