import sharp from "sharp";
import { Brand, BrandCheckResult } from "./types";

export async function checkBrandCompliance(
  imageBuffer: Buffer,
  brand: Brand,
  hasLogo: boolean
): Promise<BrandCheckResult> {
  const details: string[] = [];
  let passed = true;

  if (brand.logoPath && !hasLogo) {
    details.push("WARNING: Brand logo was not applied to the creative");
    passed = false;
  } else if (brand.logoPath && hasLogo) {
    details.push("PASS: Brand logo is present");
  }

  const { dominant } = await sharp(imageBuffer).stats();
  const dominantHex = rgbToHex(dominant.r, dominant.g, dominant.b);
  details.push(`Dominant color detected: ${dominantHex}`);

  const hasBrandColor = brand.colors.some((color) => {
    const distance = colorDistance(color, dominantHex);
    return distance < 100;
  });

  if (hasBrandColor) {
    details.push("PASS: Brand colors detected in creative");
  } else {
    details.push("INFO: Brand colors not dominant in creative (may be acceptable for product-focused shots)");
  }

  return { passed, details };
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

function colorDistance(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  return Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) +
    Math.pow(rgb1.b - rgb2.b, 2)
  );
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}
