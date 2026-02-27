"use client";

import { useState } from "react";
import { PipelineResult } from "@/lib/types";
import SAMPLE_BRIEF from "@/../sample-briefs/summer-refresh.json";

interface CampaignFormProps {
  onResult: (result: PipelineResult) => void;
}

export default function CampaignForm({ onResult }: CampaignFormProps) {
  const [briefJson, setBriefJson] = useState(
    JSON.stringify(SAMPLE_BRIEF, null, 2)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");

  const handleLoadSample = () => {
    setBriefJson(JSON.stringify(SAMPLE_BRIEF, null, 2));
    setError(null);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setStatus("Parsing campaign brief...");

    try {
      const brief = JSON.parse(briefJson);
      setStatus(
        `Generating creatives for ${brief.products?.length || 0} products...`
      );

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brief),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Generation failed");
      }

      const result: PipelineResult = await response.json();
      setStatus(`Done! Generated ${result.assets.length} assets.`);
      onResult(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      setStatus("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Campaign Brief</h2>
        <button
          onClick={handleLoadSample}
          className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors"
        >
          Load Sample Brief
        </button>
      </div>

      <textarea
        value={briefJson}
        onChange={(e) => setBriefJson(e.target.value)}
        className="w-full h-96 font-mono text-sm p-4 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
        placeholder="Paste your campaign brief JSON here..."
      />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {status && !error && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
          {status}
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
      >
        {loading ? "Generating..." : "Generate Campaign Creatives"}
      </button>
    </div>
  );
}
