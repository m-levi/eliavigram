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

/**
 * Story theme type for AI-generated stories
 */
export interface StoryTheme {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  photoIds: string[];
  gradient: string;
}

/**
 * Generate themed stories from a collection of photos using AI
 * Analyzes photos and groups them into 2-3 themed stories
 */
export async function generateStoryThemes(
  photos: Array<{ id: string; caption?: string; imageUrl: string; mediaType?: string }>
): Promise<StoryTheme[]> {
  try {
    const geminiModel = await getGeminiModel();

    // Filter to images only and limit to recent 12 photos for performance
    const imagePhotos = photos
      .filter((p) => p.mediaType !== "video")
      .slice(0, 12);

    if (imagePhotos.length < 2) {
      // Not enough photos for meaningful stories
      return [
        {
          id: "all",
          title: "All Moments",
          subtitle: "Your photo collection",
          emoji: "📷",
          photoIds: photos.map((p) => p.id),
          gradient: "from-pink-400 to-purple-500",
        },
      ];
    }

    // Build context from captions
    const captionContext = imagePhotos
      .map((p, i) => `Photo ${i + 1} (id: ${p.id}): "${p.caption || "no caption"}"`)
      .join("\n");

    const prompt = `You are organizing baby photos into Instagram-style "stories" (themed collections).

Given these photo captions, create 2-3 themed story groups. Each story should have a cohesive theme.

Photos:
${captionContext}

Create 2-3 story themes. Return ONLY a valid JSON array with this exact structure:
[
  {
    "title": "Short catchy title (2-4 words)",
    "subtitle": "Brief description (3-6 words)",
    "emoji": "single relevant emoji",
    "photoIds": ["id1", "id2", ...],
    "gradient": "from-COLOR-SHADE to-COLOR-SHADE"
  }
]

Rules:
- Each photo should appear in exactly ONE story
- Stories should have 3-6 photos each ideally
- Use fun, baby/family-appropriate themes
- Gradient colors: use Tailwind CSS gradient format with colors like pink, purple, blue, orange, amber, rose, cyan, emerald, violet
- Example gradients: "from-pink-400 to-rose-500", "from-blue-400 to-cyan-500", "from-amber-400 to-orange-500"

Return ONLY the JSON array, no explanation.`;

    const result = await geminiModel.generateContent(prompt);
    const response = result.response;
    const text = response.text().trim();

    // Parse JSON, handling potential markdown code blocks
    let jsonText = text;
    if (text.includes("```")) {
      const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      jsonText = match ? match[1].trim() : text;
    }

    const themes = JSON.parse(jsonText) as Array<{
      title: string;
      subtitle: string;
      emoji: string;
      photoIds: string[];
      gradient: string;
    }>;

    // Validate and add IDs
    const validThemes: StoryTheme[] = themes
      .filter((t) => t.title && t.photoIds && t.photoIds.length > 0)
      .map((t, i) => ({
        id: `story-${i}`,
        title: t.title,
        subtitle: t.subtitle || "",
        emoji: t.emoji || "📷",
        photoIds: t.photoIds,
        gradient: t.gradient || "from-pink-400 to-purple-500",
      }));

    // If any photos weren't assigned, add them to "More Moments"
    const assignedIds = new Set(validThemes.flatMap((t) => t.photoIds));
    const unassignedPhotos = photos.filter((p) => !assignedIds.has(p.id));
    if (unassignedPhotos.length > 0) {
      validThemes.push({
        id: "more",
        title: "More Moments",
        subtitle: "Additional memories",
        emoji: "✨",
        photoIds: unassignedPhotos.map((p) => p.id),
        gradient: "from-gray-400 to-slate-500",
      });
    }

    return validThemes.length > 0
      ? validThemes
      : [
          {
            id: "all",
            title: "All Moments",
            subtitle: "Your photo collection",
            emoji: "📷",
            photoIds: photos.map((p) => p.id),
            gradient: "from-pink-400 to-purple-500",
          },
        ];
  } catch (error) {
    console.error("Failed to generate story themes:", error);
    // Fallback: return all photos as one story
    return [
      {
        id: "all",
        title: "All Moments",
        subtitle: "Your photo collection",
        emoji: "📷",
        photoIds: photos.map((p) => p.id),
        gradient: "from-pink-400 to-purple-500",
      },
    ];
  }
}
