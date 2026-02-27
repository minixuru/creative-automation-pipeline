export interface Brand {
  name: string;
  colors: string[];
  logoPath?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  existingAsset?: string | null;
}

export type AspectRatio = "1:1" | "9:16" | "16:9";

export interface CampaignBrief {
  campaignName: string;
  brand: Brand;
  products: Product[];
  targetRegion: string;
  targetAudience: string;
  campaignMessage: string;
  aspectRatios: AspectRatio[];
}

export const ASPECT_RATIO_DIMENSIONS: Record<AspectRatio, { width: number; height: number }> = {
  "1:1": { width: 1080, height: 1080 },
  "9:16": { width: 1080, height: 1920 },
  "16:9": { width: 1920, height: 1080 },
};

export interface GeneratedAsset {
  productId: string;
  productName: string;
  aspectRatio: AspectRatio;
  filePath: string;
  wasGenerated: boolean;
}

export interface PipelineResult {
  campaignName: string;
  assets: GeneratedAsset[];
  warnings: string[];
  timestamp: string;
}

export interface BrandCheckResult {
  passed: boolean;
  details: string[];
}

export interface LegalCheckResult {
  passed: boolean;
  flaggedWords: string[];
}
