import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

/**
 * Lazily initializes and returns the GoogleGenAI client instance.
 * This prevents the app from crashing on load if the API key is not configured.
 * @returns {GoogleGenAI} The initialized GoogleGenAI client.
 */
const getAiClient = (): GoogleGenAI => {
  if (ai) {
    return ai;
  }

  // Assume process.env.API_KEY is available in the environment
  const API_KEY = process.env.API_KEY;

  if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }

  ai = new GoogleGenAI({ apiKey: API_KEY });
  return ai;
};


export const generateImages = async (prompt: string, numberOfImages: number): Promise<string[]> => {
  try {
    const client = getAiClient();
    const response = await client.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: numberOfImages,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1',
      },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
      throw new Error("The API did not return any images.");
    }
    
    return response.generatedImages.map(img => img.image.imageBytes);

  } catch (error) {
    console.error("Error generating images:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate images: ${error.message}`);
    }
    throw new Error("An unknown error occurred during image generation.");
  }
};
