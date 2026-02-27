# Creative Automation Pipeline

A proof-of-concept application that automates creative asset generation for social ad campaigns using GenAI. Built for the Adobe FDE Take-Home Exercise.

## Tech Stack

- **Framework**: Next.js 16 (App Router), TypeScript
- **Image Generation**: OpenAI DALL-E 3
- **Image Processing**: Sharp (resize, crop, SVG text composite)
- **Styling**: Tailwind CSS
- **Runtime**: Node.js 22+

## Prerequisites

- Node.js 18+ (tested with 22)
- npm
- OpenAI API key with DALL-E 3 access

## Getting Started

### 1. Clone & Install

```bash
git clone <repo-url>
cd creative-automation
npm install
```

### 2. Set up environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your OpenAI API key:

```
OPENAI_API_KEY=sk-your-key-here
```

### 3. Generate placeholder logo (optional)

```bash
npx tsx scripts/create-logo.ts
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. The app opens with a sample campaign brief pre-loaded in the JSON editor
2. Click **"Load Sample Brief"** to reset to the default example
3. Edit the JSON to customize products, messaging, regions, etc.
4. Click **"Generate Campaign Creatives"**
5. Wait for DALL-E 3 to generate images (typically 15-30 seconds per product)
6. View generated creatives in the gallery panel, organized by product
7. Download individual assets or view them in the output folder

## Example Input

```json
{
  "campaignName": "Summer Refresh 2025",
  "brand": {
    "name": "FreshCo",
    "colors": ["#00A86B", "#FFFFFF", "#1B1B1B"],
    "logoPath": "input-assets/freshco-logo.png"
  },
  "products": [
    {
      "id": "sparkling-water",
      "name": "FreshCo Sparkling Water",
      "description": "A refreshing bottle of sparkling water with lime slices...",
      "existingAsset": null
    },
    {
      "id": "green-tea",
      "name": "FreshCo Green Tea",
      "description": "Premium organic Japanese green tea in an elegant glass bottle...",
      "existingAsset": null
    }
  ],
  "targetRegion": "US - West Coast",
  "targetAudience": "Health-conscious millennials, 25-35",
  "campaignMessage": "Stay Fresh This Summer",
  "aspectRatios": ["1:1", "9:16", "16:9"]
}
```

## Example Output

Generated assets are saved to:

```
output/
  summer-refresh-2025/
    sparkling-water/
      1x1.png      (1080x1080 - Instagram feed)
      9x16.png     (1080x1920 - Stories/Reels)
      16x9.png     (1920x1080 - Facebook/YouTube banner)
    green-tea/
      1x1.png
      9x16.png
      16x9.png
    report.json    (metadata, warnings, timestamps)
```

Each image includes:
- AI-generated or reused product hero image
- Brand logo overlay (top-left corner)
- Campaign message text banner (bottom, semi-transparent background)

## Key Design Decisions

1. **Next.js App Router**: Chose full-stack Next.js to keep everything in one deployable unit — API routes for the pipeline, React for the UI. Easy for reviewers to run with a single `npm run dev`.

2. **Sharp for image processing**: Native Node.js image library with excellent performance. Used SVG-based text overlay to avoid additional dependencies like `node-canvas` (which requires native build tools). Sharp handles resize, crop, and composite operations.

3. **DALL-E 3 with b64_json**: Request base64 response format to avoid needing to download from a URL, reducing latency and avoiding CORS issues.

4. **Asset reuse pattern**: The pipeline checks for `existingAsset` paths first, falling back to AI generation only when needed. This supports the requirement to reuse uploaded assets.

5. **SVG text compositing**: Campaign messages are rendered via SVG overlaid onto images using Sharp's composite API. This avoids platform-specific font dependencies while providing clean, customizable typography.

6. **Brand compliance checker**: Samples dominant colors from generated images and compares against brand color palette using Euclidean distance in RGB space. Simple but effective for a PoC.

7. **Output organization**: Files are organized by campaign name, then product ID, then aspect ratio — making it easy to find and review generated assets.

## Bonus Features

- **Brand compliance checks**: Verifies logo presence and brand color usage in generated creatives
- **Legal content checks**: Scans campaign messages against a configurable list of prohibited advertising words/phrases
- **Pipeline logging**: Timestamped console logs for every pipeline step
- **Report generation**: `report.json` saved with each campaign containing metadata, asset paths, warnings, and timing

## Assumptions & Limitations

- **API key required**: A valid OpenAI API key with DALL-E 3 access must be provided
- **Text rendering**: Uses system fonts (Arial/Helvetica) via SVG; custom brand fonts are not supported in this PoC
- **No authentication**: The app has no login/auth — designed for local use
- **Local storage only**: Assets are stored on the local filesystem (no cloud storage integration)
- **Single-threaded pipeline**: Products are processed sequentially to avoid API rate limits
- **No image editing**: Generated images cannot be manually tweaked in the UI — regeneration is the only option
- **English only**: Campaign messages are displayed in English; localization is not implemented in this PoC

## Project Structure

```
src/
├── app/
│   ├── page.tsx                      # Main dashboard page
│   ├── layout.tsx                    # Root layout
│   └── api/
│       ├── generate/route.ts         # POST: run pipeline
│       ├── campaigns/route.ts        # GET: list past campaigns
│       └── output/[...path]/route.ts # GET: serve generated files
├── lib/
│   ├── pipeline.ts                   # Pipeline orchestrator
│   ├── image-generator.ts            # DALL-E 3 integration
│   ├── image-resizer.ts              # Sharp resize/crop
│   ├── text-compositor.ts            # Text + logo overlay
│   ├── brand-checker.ts              # Brand compliance
│   ├── legal-checker.ts              # Prohibited word scan
│   └── types.ts                      # Shared TypeScript types
└── components/
    ├── CampaignForm.tsx              # Brief input form
    └── CampaignGallery.tsx           # Results gallery
```
