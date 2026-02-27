import { LegalCheckResult } from "./types";

const PROHIBITED_WORDS = [
  "guaranteed",
  "miracle",
  "cure",
  "risk-free",
  "no side effects",
  "act now",
  "limited time only",
  "free trial",
  "winner",
  "congratulations",
  "#1",
  "best in the world",
  "scientifically proven",
];

export function checkLegalCompliance(campaignMessage: string): LegalCheckResult {
  const lowerMessage = campaignMessage.toLowerCase();
  const flaggedWords = PROHIBITED_WORDS.filter((word) =>
    lowerMessage.includes(word.toLowerCase())
  );

  console.log(`[LegalChecker] Scanned message: "${campaignMessage}"`);
  if (flaggedWords.length > 0) {
    console.log(`[LegalChecker] FLAGGED: ${flaggedWords.join(", ")}`);
  } else {
    console.log(`[LegalChecker] No prohibited words found`);
  }

  return {
    passed: flaggedWords.length === 0,
    flaggedWords,
  };
}
