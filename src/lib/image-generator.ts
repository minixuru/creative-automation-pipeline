import OpenAI from "openai";
import fs from "fs/promises";
import path from "path";

function getOpenAIClient(): OpenAI {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function generateProductImage(
  productDescription: string,
  campaignMessage: string,
  targetAudience: string,
  targetRegion: string
): Promise<Buffer> {
  const prompt = buildPrompt(productDescription, campaignMessage, targetAudience, targetRegion);

  console.log(`[ImageGenerator] Generating image with DALL-E 3...`);
  console.log(`[ImageGenerator] Prompt: ${prompt.substring(0, 100)}...`);

  const response = await getOpenAIClient().images.generate({
    model: "dall-e-3",
    prompt,
    n: 1,
    size: "1024x1024",
    quality: "standard",
    response_format: "b64_json",
  });

  const base64 = response.data?.[0]?.b64_json;
  if (!base64) {
    throw new Error("No image data returned from DALL-E 3");
  }

  console.log(`[ImageGenerator] Image generated successfully`);
  return Buffer.from(base64, "base64");
}

function buildPrompt(
  productDescription: string,
  campaignMessage: string,
  targetAudience: string,
  targetRegion: string
): string {
  return `Professional product photography for a social media advertisement. ${productDescription}. The image should appeal to ${targetAudience} in ${targetRegion}. Style: clean, modern, high-quality commercial photography. Do NOT include any text or words in the image.`;
}

export async function loadExistingAsset(assetPath: string): Promise<Buffer> {
  const fullPath = path.join(process.cwd(), "public", assetPath);
  console.log(`[ImageGenerator] Loading existing asset: ${fullPath}`);
  return fs.readFile(fullPath);
}
