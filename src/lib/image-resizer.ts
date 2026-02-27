import sharp from "sharp";
import { AspectRatio, ASPECT_RATIO_DIMENSIONS } from "./types";

export async function resizeToAspectRatio(
  imageBuffer: Buffer,
  aspectRatio: AspectRatio
): Promise<Buffer> {
  const { width, height } = ASPECT_RATIO_DIMENSIONS[aspectRatio];

  console.log(`[ImageResizer] Resizing to ${aspectRatio} (${width}x${height})`);

  return sharp(imageBuffer)
    .resize(width, height, {
      fit: "cover",
      position: "center",
    })
    .png()
    .toBuffer();
}
