import sharp from "sharp";
import { AspectRatio, ASPECT_RATIO_DIMENSIONS, Brand } from "./types";

export async function compositeText(
  imageBuffer: Buffer,
  campaignMessage: string,
  brand: Brand,
  aspectRatio: AspectRatio
): Promise<Buffer> {
  const { width, height } = ASPECT_RATIO_DIMENSIONS[aspectRatio];
  const textColor = brand.colors[1] || "#FFFFFF";
  const bgColor = brand.colors[2] || "#000000";

  console.log(`[TextCompositor] Adding text overlay: "${campaignMessage}"`);

  const fontSize = Math.round(width * 0.05);
  const padding = Math.round(width * 0.04);
  const bannerHeight = fontSize * 2 + padding * 2;

  const svgText = `
    <svg width="${width}" height="${height}">
      <rect
        x="0"
        y="${height - bannerHeight}"
        width="${width}"
        height="${bannerHeight}"
        fill="${bgColor}"
        opacity="0.75"
      />
      <text
        x="${width / 2}"
        y="${height - bannerHeight / 2 + fontSize * 0.35}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${fontSize}"
        font-weight="bold"
        fill="${textColor}"
        text-anchor="middle"
      >${escapeXml(campaignMessage)}</text>
    </svg>
  `;

  return sharp(imageBuffer)
    .composite([
      {
        input: Buffer.from(svgText),
        top: 0,
        left: 0,
      },
    ])
    .png()
    .toBuffer();
}

export async function compositeLogo(
  imageBuffer: Buffer,
  logoBuffer: Buffer,
  aspectRatio: AspectRatio
): Promise<Buffer> {
  const { width } = ASPECT_RATIO_DIMENSIONS[aspectRatio];
  const logoSize = Math.round(width * 0.1);
  const margin = Math.round(width * 0.03);

  console.log(`[TextCompositor] Adding logo overlay`);

  const resizedLogo = await sharp(logoBuffer)
    .resize(logoSize, logoSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  return sharp(imageBuffer)
    .composite([
      {
        input: resizedLogo,
        top: margin,
        left: margin,
      },
    ])
    .png()
    .toBuffer();
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
