"use client";

import { useState } from "react";
import CampaignForm from "@/components/CampaignForm";
import CampaignGallery from "@/components/CampaignGallery";
import { PipelineResult } from "@/lib/types";

export default function Home() {
  const [result, setResult] = useState<PipelineResult | null>(null);

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Creative Automation Pipeline
          </h1>
          <p className="text-sm text-gray-500">
            Generate social ad campaign creatives at scale using GenAI
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <CampaignForm onResult={setResult} />
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            {result ? (
              <CampaignGallery result={result} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 min-h-[400px]">
                <div className="text-center">
                  <p className="text-lg">No campaign generated yet</p>
                  <p className="text-sm mt-1">
                    Submit a campaign brief to see results here
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
