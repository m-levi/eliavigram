export interface Comment {
  text: string;
  author: string;
  createdAt: string;
}

export interface Photo {
  id: string;
  filename: string;
  originalName: string;
  caption?: string;
  comment?: Comment; // Comment with author name
  uploadedAt: string;
  rotation: number;
  imageUrl: string;
}

export interface PhotoStore {
  photos: Photo[];
}
