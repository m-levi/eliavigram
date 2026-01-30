export interface Photo {
  id: string;
  filename: string;
  originalName: string;
  caption?: string;
  uploadedAt: string;
  rotation: number; // Random slight rotation for that authentic polaroid feel
  imageUrl: string; // Firebase Storage URL
}

export interface PhotoStore {
  photos: Photo[];
}
