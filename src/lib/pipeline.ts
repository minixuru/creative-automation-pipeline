import fs from "fs/promises";
import path from "path";
import { CampaignBrief, GeneratedAsset, PipelineResult } from "./types";
import { generateProductImage, loadExistingAsset } from "./image-generator";
import { resizeToAspectRatio } from "./image-resizer";
import { compositeText, compositeLogo } from "./text-compositor";
import { checkBrandCompliance } from "./brand-checker";
import { checkLegalCompliance } from "./legal-checker";

export async function runPipeline(brief: CampaignBrief): Promise<PipelineResult> {
  const startTime = Date.now();
  const warnings: string[] = [];
  const assets: GeneratedAsset[] = [];

  console.log(`\n${"=".repeat(60)}`);
  console.log(`[Pipeline] Starting campaign: ${brief.campaignName}`);
  console.log(`${"=".repeat(60)}\n`);

  // Step 1: Legal check on campaign message
  const legalResult = checkLegalCompliance(brief.campaignMessage);
  if (!legalResult.passed) {
    warnings.push(
      `Legal check flagged words in campaign message: ${legalResult.flaggedWords.join(", ")}`
    );
  }

  // Step 2: Load logo if available
  let logoBuffer: Buffer | null = null;
  if (brief.brand.logoPath) {
    try {
      logoBuffer = await loadExistingAsset(brief.brand.logoPath);
      console.log(`[Pipeline] Logo loaded successfully`);
    } catch {
      console.log(`[Pipeline] Logo not found at ${brief.brand.logoPath}, skipping`);
      warnings.push(`Logo not found at ${brief.brand.logoPath}`);
    }
  }

  // Step 3: Process each product
  for (const product of brief.products) {
    console.log(`\n[Pipeline] Processing product: ${product.name}`);

    // Get or generate hero image
    let heroImage: Buffer;
    let wasGenerated = false;

    if (product.existingAsset) {
      try {
        heroImage = await loadExistingAsset(product.existingAsset);
        console.log(`[Pipeline] Using existing asset for ${product.name}`);
      } catch {
        console.log(`[Pipeline] Existing asset not found, generating new one`);
        heroImage = await generateProductImage(
          product.description,
          brief.campaignMessage,
          brief.targetAudience,
          brief.targetRegion
        );
        wasGenerated = true;
      }
    } else {
      heroImage = await generateProductImage(
        product.description,
        brief.campaignMessage,
        brief.targetAudience,
        brief.targetRegion
      );
      wasGenerated = true;
    }

    // Process each aspect ratio
    for (const ratio of brief.aspectRatios) {
      console.log(`[Pipeline] Creating ${ratio} variant for ${product.name}`);

      // Resize
      let processed = await resizeToAspectRatio(heroImage, ratio);

      // Add logo
      if (logoBuffer) {
        processed = await compositeLogo(processed, logoBuffer, ratio);
      }

      // Add text overlay
      processed = await compositeText(
        processed,
        brief.campaignMessage,
        brief.brand,
        ratio
      );

      // Save
      const outputDir = path.join(
        process.cwd(),
        "output",
        sanitizeFilename(brief.campaignName),
        product.id
      );
      await fs.mkdir(outputDir, { recursive: true });

      const filename = `${ratio.replace(":", "x")}.png`;
      const filePath = path.join(outputDir, filename);
      await fs.writeFile(filePath, processed);

      console.log(`[Pipeline] Saved: ${filePath}`);

      // Brand check
      const brandResult = await checkBrandCompliance(
        processed,
        brief.brand,
        !!logoBuffer
      );
      if (!brandResult.passed) {
        warnings.push(
          `Brand check for ${product.name} (${ratio}): ${brandResult.details.join("; ")}`
        );
      }

      assets.push({
        productId: product.id,
        productName: product.name,
        aspectRatio: ratio,
        filePath: `/output/${sanitizeFilename(brief.campaignName)}/${product.id}/${filename}`,
        wasGenerated,
      });
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n${"=".repeat(60)}`);
  console.log(`[Pipeline] Complete! Generated ${assets.length} assets in ${elapsed}s`);
  console.log(`${"=".repeat(60)}\n`);

  const result: PipelineResult = {
    campaignName: brief.campaignName,
    assets,
    warnings,
    timestamp: new Date().toISOString(),
  };

  // Save report
  const reportPath = path.join(
    process.cwd(),
    "output",
    sanitizeFilename(brief.campaignName),
    "report.json"
  );
  await fs.writeFile(reportPath, JSON.stringify(result, null, 2));

  return result;
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase();
}
