import sharp from "sharp";
import path from "path";

async function createLogo() {
  const size = 200;
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 5}" fill="#00A86B" stroke="#FFFFFF" stroke-width="5"/>
      <text x="${size / 2}" y="${size / 2 + 18}" font-family="Arial, sans-serif" font-size="60" font-weight="bold" fill="white" text-anchor="middle">FC</text>
    </svg>
  `;

  const outputPath = path.join(process.cwd(), "public", "input-assets", "freshco-logo.png");

  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(outputPath);

  console.log(`Logo created at ${outputPath}`);
}

createLogo().catch(console.error);
