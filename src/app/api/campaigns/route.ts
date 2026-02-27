import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const outputDir = path.join(process.cwd(), "output");

    try {
      await fs.access(outputDir);
    } catch {
      return NextResponse.json([]);
    }

    const campaigns = await fs.readdir(outputDir);
    const results = [];

    for (const campaign of campaigns) {
      const reportPath = path.join(outputDir, campaign, "report.json");
      try {
        const report = JSON.parse(await fs.readFile(reportPath, "utf-8"));
        results.push(report);
      } catch {
        // Skip campaigns without reports
      }
    }

    return NextResponse.json(results);
  } catch {
    return NextResponse.json(
      { error: "Failed to list campaigns" },
      { status: 500 }
    );
  }
}
