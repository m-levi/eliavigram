import { getGeminiModel } from "./firebase";

/**
 * Generate a cute, short caption for a photo using Gemini AI
 * @param imageBase64 - Base64 encoded image data
 * @param mimeType - Image MIME type (e.g., "image/jpeg", "image/png")
 * @returns A short, cute caption for the photo
 */
export async function generatePhotoCaption(
  imageBase64: string,
  mimeType: string
): Promise<string> {
  try {
    const geminiModel = await getGeminiModel();

    const prompt = `You are captioning photos for a baby/toddler photo album app called "Eliavigram".

Look at this photo and generate a SHORT, cute caption (2-5 words max).
The caption should be:
- Sweet and endearing
- Written as if describing a precious moment
- Could be playful, funny, or heartwarming
- NO hashtags, NO emojis, NO punctuation at the end

Examples of good captions:
- "Little explorer at work"
- "Snack time champion"
- "Best nap ever"
- "Future artist"
- "Sandy toes adventure"
- "Kitchen helper"
- "Reading buddy"

Just respond with the caption, nothing else.`;

    const result = await geminiModel.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: imageBase64,
        },
      },
    ]);

    const response = result.response;
    const text = response.text().trim();

    // Clean up the response - remove quotes if present
    return text.replace(/^["']|["']$/g, "");
  } catch (error) {
    console.error("Failed to generate caption:", error);
    return "";
  }
}

/**
 * Convert a File to base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}
