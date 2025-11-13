
export const generateImages = async (prompt: string, numberOfImages: number): Promise<string[]> => {
  const API_KEY = process.env.API_KEY;

  if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set. Please set it to your OpenRouter key.");
  }

  const openRouterApiUrl = "https://openrouter.ai/api/v1/images/generations";

  try {
    const response = await fetch(openRouterApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        // Recommended headers for OpenRouter to identify your app
        'HTTP-Referer': `${window.location.protocol}//${window.location.host}`,
        'X-Title': 'AI Image Generator',
      },
      body: JSON.stringify({
        model: 'google/imagen-3.0', // Switched to a model available on OpenRouter
        prompt: prompt,
        n: numberOfImages,
        response_format: 'b64_json', // Request base64 encoded image data
        aspect_ratio: '1:1', // The app is designed for square images
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenRouter API error response:', errorData);
      throw new Error(`API Error (${response.status}): ${errorData.error?.message || 'Failed to fetch from OpenRouter.'}`);
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      throw new Error("The API did not return any images.");
    }
    
    // OpenRouter returns image data in the `b64_json` field
    return data.data.map((img: { b64_json: string }) => img.b64_json);

  } catch (error) {
    console.error("Error generating images via OpenRouter:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate images: ${error.message}`);
    }
    throw new Error("An unknown error occurred during image generation.");
  }
};
