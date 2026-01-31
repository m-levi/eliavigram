import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import type { GenerativeModel } from "firebase/ai";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export const storage = getStorage(app);

// Lazy-load Firebase AI to avoid build-time initialization errors
let _geminiModel: GenerativeModel | null = null;

export async function getGeminiModel(): Promise<GenerativeModel> {
  if (!_geminiModel) {
    const { getAI, getGenerativeModel, GoogleAIBackend } = await import("firebase/ai");
    const ai = getAI(app, { backend: new GoogleAIBackend() });
    _geminiModel = getGenerativeModel(ai, { model: "gemini-2.0-flash" });
  }
  return _geminiModel;
}

// Collection name for photos
export const PHOTOS_COLLECTION = "photos";
