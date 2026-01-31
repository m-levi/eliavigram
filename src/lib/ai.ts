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

/**
 * Analyze a photo and return keywords/tags for similarity matching
 */
export async function analyzePhotoForSimilarity(
  imageBase64: string,
  mimeType: string
): Promise<string[]> {
  try {
    const geminiModel = await getGeminiModel();

    const prompt = `Analyze this photo and return a JSON array of 5-8 keywords that describe:
- The main subject (person, object, animal)
- The activity or action happening
- The setting or location
- The mood or emotion
- Colors or visual elements

Return ONLY a valid JSON array of lowercase strings, nothing else.
Example: ["baby", "playing", "outdoors", "happy", "green", "grass", "sunny"]`;

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

    // Parse the JSON array
    const keywords = JSON.parse(text);
    return Array.isArray(keywords) ? keywords : [];
  } catch (error) {
    console.error("Failed to analyze photo:", error);
    return [];
  }
}

/**
 * Find similar photos by comparing keywords
 */
export function calculateSimilarityScore(
  keywords1: string[],
  keywords2: string[]
): number {
  if (!keywords1.length || !keywords2.length) return 0;

  const set1 = new Set(keywords1.map((k) => k.toLowerCase()));
  const set2 = new Set(keywords2.map((k) => k.toLowerCase()));

  let matches = 0;
  set1.forEach((keyword) => {
    if (set2.has(keyword)) matches++;
  });

  // Jaccard similarity
  const union = new Set([...set1, ...set2]);
  return matches / union.size;
}
