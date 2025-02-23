import type { Program } from "@/types/program";
import { calculateSimilarity, calculateContextScore } from "./utils";

const KEYWORD_WEIGHTS = {
  CRITICAL: 2.0,
  HIGH: 1.5,
  MEDIUM: 1.0,
  LOW: 0.5,
};

// Updated INTENT_KEYWORDS to match GUIDED_QUESTIONS and programs.json
const INTENT_KEYWORDS = {
  business: [
    { term: "business", weight: KEYWORD_WEIGHTS.CRITICAL },
    { term: "entrepreneurship", weight: KEYWORD_WEIGHTS.CRITICAL },
    { term: "economics", weight: KEYWORD_WEIGHTS.HIGH },
    { term: "business innovation", weight: KEYWORD_WEIGHTS.HIGH },
    { term: "startup", weight: KEYWORD_WEIGHTS.HIGH },
    { term: "management", weight: KEYWORD_WEIGHTS.MEDIUM },
    { term: "finance", weight: KEYWORD_WEIGHTS.MEDIUM },
  ],
  technology: [
    { term: "technology", weight: KEYWORD_WEIGHTS.CRITICAL },
    { term: "artificial intelligence", weight: KEYWORD_WEIGHTS.CRITICAL },
    { term: "data science", weight: KEYWORD_WEIGHTS.CRITICAL },
    { term: "software development", weight: KEYWORD_WEIGHTS.HIGH },
    { term: "programming", weight: KEYWORD_WEIGHTS.HIGH },
    { term: "statistics", weight: KEYWORD_WEIGHTS.HIGH },
    { term: "analytics", weight: KEYWORD_WEIGHTS.MEDIUM },
    { term: "cognitive science", weight: KEYWORD_WEIGHTS.MEDIUM },
    { term: "cybersecurity", weight: KEYWORD_WEIGHTS.MEDIUM },
  ],
  law: [
    { term: "law", weight: KEYWORD_WEIGHTS.CRITICAL },
    { term: "global law", weight: KEYWORD_WEIGHTS.CRITICAL },
    { term: "governance", weight: KEYWORD_WEIGHTS.HIGH },
    { term: "human rights", weight: KEYWORD_WEIGHTS.HIGH },
    { term: "corporate law", weight: KEYWORD_WEIGHTS.MEDIUM },
    { term: "environmental law", weight: KEYWORD_WEIGHTS.MEDIUM },
  ],
  social: [
    { term: "sociology", weight: KEYWORD_WEIGHTS.CRITICAL },
    { term: "social issues", weight: KEYWORD_WEIGHTS.HIGH },
    { term: "global management", weight: KEYWORD_WEIGHTS.HIGH },
    { term: "psychology", weight: KEYWORD_WEIGHTS.HIGH },
    { term: "human resources", weight: KEYWORD_WEIGHTS.HIGH },
    { term: "organizational behavior", weight: KEYWORD_WEIGHTS.MEDIUM },
  ],
  culture: [
    { term: "digital culture", weight: KEYWORD_WEIGHTS.CRITICAL },
    { term: "leisure studies", weight: KEYWORD_WEIGHTS.HIGH },
    { term: "theology", weight: KEYWORD_WEIGHTS.HIGH },
    { term: "media studies", weight: KEYWORD_WEIGHTS.HIGH },
    { term: "cultural programming", weight: KEYWORD_WEIGHTS.MEDIUM },
  ],
};

interface WeightedKeyword {
  keyword: string;
  weight: number;
}

export function matchPrograms(input: string | WeightedKeyword[], programs: Program[]): Program[] {
  try {
    // Ensure programs is an array
    if (!Array.isArray(programs)) {
      throw new Error("Programs must be an array");
    }

    const scoredPrograms = programs.map((program) => {
      let score = 0;

      if (typeof input === "string") {
        // Fallback: String-based matching for freeform input
        const inputLower = input.toLowerCase();
        let intentScore = 0;

        Object.entries(INTENT_KEYWORDS).forEach(([intent, keywords]) => {
          let intentMatches = 0;
          keywords.forEach(({ term, weight }) => {
            if (inputLower.includes(term.toLowerCase())) { // Ensure case-insensitive matching
              intentMatches += weight;
            }
          });
          intentScore = Math.max(intentScore, intentMatches);
        });

        const nameScore = calculateSimilarity(inputLower, program.name.toLowerCase()) * 3.0;
        const descriptionScore = calculateSimilarity(inputLower, program.description.toLowerCase()) * 2.0;
        const keywordScore = calculateContextScore(inputLower, program.keywords) * 2.5;
        const skillScore = calculateContextScore(inputLower, program.skills) * 1.5;
        const careerScore = calculateContextScore(inputLower, program.careers) * 1.5;
        const subjectScore = calculateContextScore(inputLower, program.subjects) * 2.0;

        const baseScore = (nameScore + descriptionScore + keywordScore + skillScore + careerScore + subjectScore) / 12.5;
        score = baseScore * (1 + intentScore);

        // Apply exact match bonus for keywords
        if (program.keywords.some((keyword) => inputLower.includes(keyword.toLowerCase()))) {
          score *= 1.5;
        }
      } else if (Array.isArray(input)) {
        // Weighted keyword matching for guided search or Ollama output
        input.forEach(({ keyword, weight }) => {
          const keywordLower = keyword.toLowerCase();
          const nameScore = calculateSimilarity(keywordLower, program.name.toLowerCase()) * 3.0;
          const descriptionScore = calculateSimilarity(keywordLower, program.description.toLowerCase()) * 2.0;
          const keywordScore = calculateContextScore(keywordLower, program.keywords) * 2.5;
          const skillScore = calculateContextScore(keywordLower, program.skills) * 1.5;
          const careerScore = calculateContextScore(keywordLower, program.careers) * 1.5;
          const subjectScore = calculateContextScore(keywordLower, program.subjects) * 2.0;

          score +=
            ((nameScore + descriptionScore + keywordScore + skillScore + careerScore + subjectScore) / 12.5) * weight;
        });
        score /= input.length;
      } else {
        throw new Error("Invalid input type for matchPrograms");
      }

      return { program, score };
    });

    // Sort by score, filter out zero or negative scores, and return top 3
    const validScoredPrograms = scoredPrograms.filter((p) => p.score > 0);
    if (validScoredPrograms.length === 0) {
      console.warn("No programs matched with positive scores. Input:", input);
      return [];
    }

    return validScoredPrograms
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ program, score }, index) => ({
        ...program,
        compatibilityPercentage: calculateDisplayPercentage(score, index),
      }));
  } catch (error) {
    console.error("Error in matchPrograms:", error);
    return []; // Return empty array for graceful fallback
  }
}

// Minimal implementation of calculateDisplayPercentage for completeness
function calculateDisplayPercentage(score: number, index: number): number {
  let percentage = Math.round(score * 100);

  // Apply position-based adjustments
  if (index === 0) {
    percentage = Math.min(98, percentage + 5);
  } else if (index === 1) {
    percentage = Math.min(95, percentage);
  } else if (index === 2) {
    percentage = Math.min(90, percentage);
  }

  // Ensure reasonable minimum percentages
  percentage = Math.max(percentage, 60 - index * 15);

  // Cap at 100%
  return Math.min(100, percentage);
}

export function boostPercentage(percentage: number): number {
  return Math.min(100, Math.round(percentage * 1.1));
}