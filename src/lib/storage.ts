import { db, storage, PHOTOS_COLLECTION } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  getDoc,
  where,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { Photo } from "./types";

export async function getPhotos(): Promise<Photo[]> {
  try {
    const photosRef = collection(db, PHOTOS_COLLECTION);
    const q = query(photosRef, orderBy("uploadedAt", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Photo[];
  } catch (error) {
    console.error("Error fetching photos from Firestore:", error);
    // If orderBy fails (missing index), try without ordering
    try {
      const photosRef = collection(db, PHOTOS_COLLECTION);
      const snapshot = await getDocs(photosRef);
      const photos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Photo[];
      // Sort in memory instead
      return photos.sort((a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );
    } catch (fallbackError) {
      console.error("Fallback fetch also failed:", fallbackError);
      throw fallbackError;
    }
  }
}

export async function savePhoto(photo: Photo): Promise<void> {
  const docRef = doc(db, PHOTOS_COLLECTION, photo.id);
  await setDoc(docRef, {
    filename: photo.filename,
    originalName: photo.originalName,
    caption: photo.caption || "",
    uploadedAt: photo.uploadedAt,
    rotation: photo.rotation,
    imageUrl: photo.imageUrl,
  });
}

export async function deletePhoto(id: string): Promise<boolean> {
  const docRef = doc(db, PHOTOS_COLLECTION, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return false;

  const photo = docSnap.data() as Photo;

  // Delete from Firebase Storage
  try {
    const storageRef = ref(storage, `photos/${photo.filename}`);
    await deleteObject(storageRef);
  } catch (error) {
    console.error("Error deleting file from storage:", error);
    // Continue even if file deletion fails
  }

  // Delete from Firestore
  await deleteDoc(docRef);

  return true;
}

export async function updatePhotoCaption(
  id: string,
  caption: string
): Promise<boolean> {
  const docRef = doc(db, PHOTOS_COLLECTION, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return false;

  await updateDoc(docRef, { caption });

  return true;
}

export async function checkDuplicatePhoto(originalName: string): Promise<boolean> {
  try {
    const photosRef = collection(db, PHOTOS_COLLECTION);
    const q = query(photosRef, where("originalName", "==", originalName));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error("Error checking for duplicate photo:", error);
    return false; // If check fails, allow upload
  }
}

export async function uploadImageToStorage(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<string> {
  const storageRef = ref(storage, `photos/${filename}`);

  // Convert Buffer to Uint8Array for Firebase client SDK
  const uint8Array = new Uint8Array(buffer);

  await uploadBytes(storageRef, uint8Array, {
    contentType: mimeType,
  });

  // Get the download URL
  const downloadUrl = await getDownloadURL(storageRef);
  return downloadUrl;
}
