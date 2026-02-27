"use client";

import { PipelineResult } from "@/lib/types";

interface CampaignGalleryProps {
  result: PipelineResult;
}

export default function CampaignGallery({ result }: CampaignGalleryProps) {
  // Group assets by product
  const productGroups = result.assets.reduce(
    (groups, asset) => {
      if (!groups[asset.productId]) {
        groups[asset.productId] = {
          productName: asset.productName,
          assets: [],
        };
      }
      groups[asset.productId].assets.push(asset);
      return groups;
    },
    {} as Record<string, { productName: string; assets: typeof result.assets }>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{result.campaignName}</h2>
        <span className="text-sm text-gray-500">
          {result.assets.length} assets generated
        </span>
      </div>

      {result.warnings.length > 0 && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-1">Warnings</h3>
          <ul className="text-sm text-yellow-700 list-disc list-inside">
            {result.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {Object.entries(productGroups).map(([productId, group]) => (
        <div key={productId} className="space-y-3">
          <h3 className="text-lg font-semibold border-b pb-1">
            {group.productName}
            {group.assets[0]?.wasGenerated && (
              <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                AI Generated
              </span>
            )}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {group.assets.map((asset) => (
              <div
                key={`${asset.productId}-${asset.aspectRatio}`}
                className="border rounded-lg overflow-hidden bg-white shadow-sm"
              >
                <div className="relative bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api${asset.filePath}`}
                    alt={`${asset.productName} - ${asset.aspectRatio}`}
                    className="w-full h-auto object-contain max-h-64"
                  />
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">
                      {asset.aspectRatio}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      {asset.aspectRatio === "1:1"
                        ? "1080x1080"
                        : asset.aspectRatio === "9:16"
                          ? "1080x1920"
                          : "1920x1080"}
                    </span>
                  </div>
                  <a
                    href={`/api${asset.filePath}`}
                    download
                    className="text-sm text-green-600 hover:text-green-800"
                  >
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
