import { NextRequest, NextResponse } from "next/server";
import { runPipeline } from "@/lib/pipeline";
import { CampaignBrief } from "@/lib/types";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const brief: CampaignBrief = await request.json();

    // Basic validation
    if (!brief.campaignName || !brief.products || brief.products.length < 2) {
      return NextResponse.json(
        { error: "Campaign brief must include a name and at least 2 products" },
        { status: 400 }
      );
    }

    if (!brief.aspectRatios || brief.aspectRatios.length < 3) {
      return NextResponse.json(
        { error: "At least three aspect ratios are required" },
        { status: 400 }
      );
    }

    if (!brief.campaignMessage) {
      return NextResponse.json(
        { error: "Campaign message is required" },
        { status: 400 }
      );
    }

    if (!brief.targetRegion) {
      return NextResponse.json(
        { error: "Target region/market is required" },
        { status: 400 }
      );
    }

    if (!brief.targetAudience) {
      return NextResponse.json(
        { error: "Target audience is required" },
        { status: 400 }
      );
    }

    const result = await runPipeline(brief);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] Pipeline error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Pipeline failed" },
      { status: 500 }
    );
  }
}
