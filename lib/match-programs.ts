import type { Program } from "@/types/program";
import { calculateSimilarity, calculateContextScore } from "./utils";

const KEYWORD_WEIGHTS = {
  CRITICAL: 2.0,
  HIGH: 1.5,
  MEDIUM: 1.0,
  LOW: 0.5,
};

// Updated INTENT_KEYWORDS with expanded keywords, common student terms, synonyms, and related terms
const INTENT_KEYWORDS = {
  business: [
    { term: "business", weight: KEYWORD_WEIGHTS.CRITICAL }, // Common student term
    { term: "entrepreneurship", weight: KEYWORD_WEIGHTS.CRITICAL },
    { term: "economics", weight: KEYWORD_WEIGHTS.HIGH },
    { term: "business innovation", weight: KEYWORD_WEIGHTS.HIGH },
    { term: "startup", weight: KEYWORD_WEIGHTS.HIGH }, // Common student term
    { term: "management", weight: KEYWORD_WEIGHTS.MEDIUM }, // Common student term
    { term: "finance", weight: KEYWORD_WEIGHTS.MEDIUM },
    { term: "international business", weight: KEYWORD_WEIGHTS.MEDIUM },
    { term: "global business", weight: KEYWORD_WEIGHTS.MEDIUM }, // Synonym
    { term: "commerce", weight: KEYWORD_WEIGHTS.MEDIUM }, // Synonym
    { term: "new business", weight: KEYWORD_WEIGHTS.MEDIUM }, // Synonym for startup
    { term: "business venture", weight: KEYWORD_WEIGHTS.MEDIUM }, // Related
    { term: "corporate strategy", weight: KEYWORD_WEIGHTS.LOW }, // Related
    { term: "business leadership", weight: KEYWORD_WEIGHTS.LOW }, // Related
    { term: "international trade", weight: KEYWORD_WEIGHTS.LOW }, // Related
  ],
  technology: [
    { term: "technology", weight: KEYWORD_WEIGHTS.CRITICAL }, // Common student term
    { term: "artificial intelligence", weight: KEYWORD_WEIGHTS.CRITICAL },
    { term: "data science", weight: KEYWORD_WEIGHTS.CRITICAL },
    { term: "software development", weight: KEYWORD_WEIGHTS.HIGH },
    { term: "programming", weight: KEYWORD_WEIGHTS.HIGH },
    { term: "statistics", weight: KEYWORD_WEIGHTS.HIGH },
    { term: "analytics", weight: KEYWORD_WEIGHTS.MEDIUM },
    { term: "cognitive science", weight: KEYWORD_WEIGHTS.MEDIUM },
    { term: "cybersecurity", weight: KEYWORD_WEIGHTS.MEDIUM },
    { term: "machine learning", weight: KEYWORD_WEIGHTS.MEDIUM },
    { term: "tech", weight: KEYWORD_WEIGHTS.HIGH }, // Synonym
    { term: "tech-savvy", weight: KEYWORD_WEIGHTS.HIGH }, // Synonym
    { term: "tech innovation", weight: KEYWORD_WEIGHTS.MEDIUM }, // Related
    { term: "computer science", weight: KEYWORD_WEIGHTS.MEDIUM }, // Related
    { term: "ai technology", weight: KEYWORD_WEIGHTS.MEDIUM }, // Related
    { term: "data analytics", weight: KEYWORD_WEIGHTS.MEDIUM }, // Related
    { term: "machine intelligence", weight: KEYWORD_WEIGHTS.LOW }, // Related
    { term: "tech research", weight: KEYWORD_WEIGHTS.LOW }, // Related
    { term: "intelligent systems", weight: KEYWORD_WEIGHTS.LOW }, // Related
    { term: "tech solutions", weight: KEYWORD_WEIGHTS.LOW }, // Related
  ],
  law: [
    { term: "law", weight: KEYWORD_WEIGHTS.CRITICAL }, // Common student term
    { term: "global law", weight: KEYWORD_WEIGHTS.CRITICAL },
    { term: "governance", weight: KEYWORD_WEIGHTS.HIGH },
    { term: "human rights", weight: KEYWORD_WEIGHTS.HIGH },
    { term: "corporate law", weight: KEYWORD_WEIGHTS.MEDIUM },
    { term: "environmental law", weight: KEYWORD_WEIGHTS.MEDIUM },
    { term: "international law", weight: KEYWORD_WEIGHTS.MEDIUM },
    { term: "lawyer", weight: KEYWORD_WEIGHTS.HIGH }, // Synonym
    { term: "court", weight: KEYWORD_WEIGHTS.HIGH }, // Synonym
    { term: "legal studies", weight: KEYWORD_WEIGHTS.MEDIUM }, // Related
    { term: "international justice", weight: KEYWORD_WEIGHTS.MEDIUM }, // Related
    { term: "legal practice", weight: KEYWORD_WEIGHTS.MEDIUM }, // Synonym
    { term: "legal policy", weight: KEYWORD_WEIGHTS.LOW }, // Related
    { term: "humanitarian law", weight: KEYWORD_WEIGHTS.LOW }, // Related
    { term: "legal governance", weight: KEYWORD_WEIGHTS.LOW }, // Related
  ],
  social: [
    { term: "sociology", weight: KEYWORD_WEIGHTS.CRITICAL }, // Common student term
    { term: "social issues", weight: KEYWORD_WEIGHTS.HIGH },
    { term: "global management", weight: KEYWORD_WEIGHTS.HIGH },
    { term: "psychology", weight: KEYWORD_WEIGHTS.HIGH }, // Common student term
    { term: "human resources", weight: KEYWORD_WEIGHTS.HIGH },
    { term: "organizational behavior", weight: KEYWORD_WEIGHTS.MEDIUM },
    { term: "social policy", weight: KEYWORD_WEIGHTS.MEDIUM },
    { term: "social studies", weight: KEYWORD_WEIGHTS.MEDIUM }, // Synonym
    { term: "cultural diversity", weight: KEYWORD_WEIGHTS.MEDIUM }, // Related
    { term: "mental health", weight: KEYWORD_WEIGHTS.MEDIUM }, // Related for psychology
    { term: "behavioral studies", weight: KEYWORD_WEIGHTS.MEDIUM }, // Related for psychology
    { term: "hr", weight: KEYWORD_WEIGHTS.MEDIUM }, // Common student term
    { term: "human rights", weight: KEYWORD_WEIGHTS.LOW }, // Related
    { term: "social justice", weight: KEYWORD_WEIGHTS.LOW }, // Related
    { term: "organizational strategies", weight: KEYWORD_WEIGHTS.LOW }, // Related
  ],
  culture: [
    { term: "digital culture", weight: KEYWORD_WEIGHTS.CRITICAL },
    { term: "leisure studies", weight: KEYWORD_WEIGHTS.HIGH }, // Common student term
    { term: "theology", weight: KEYWORD_WEIGHTS.HIGH }, // Common student term
    { term: "media studies", weight: KEYWORD_WEIGHTS.HIGH },
    { term: "cultural programming", weight: KEYWORD_WEIGHTS.MEDIUM },
    { term: "social media", weight: KEYWORD_WEIGHTS.MEDIUM },
    { term: "tech culture", weight: KEYWORD_WEIGHTS.MEDIUM }, // Related
    { term: "cultural innovation", weight: KEYWORD_WEIGHTS.MEDIUM }, // Related
    { term: "recreation", weight: KEYWORD_WEIGHTS.MEDIUM }, // Synonym for leisure
    { term: "religion", weight: KEYWORD_WEIGHTS.MEDIUM }, // Common student term
    { term: "spiritual studies", weight: KEYWORD_WEIGHTS.MEDIUM }, // Synonym
    { term: "cultural events", weight: KEYWORD_WEIGHTS.LOW }, // Related
    { term: "digital media", weight: KEYWORD_WEIGHTS.LOW }, // Related
    { term: "faith studies", weight: KEYWORD_WEIGHTS.LOW }, // Related
    { term: "media innovation", weight: KEYWORD_WEIGHTS.LOW }, // Related
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
            if (inputLower.includes(term.toLowerCase())) {
              intentMatches += weight;
            }
          });
          intentScore = Math.max(intentScore, intentMatches);
        });

        const nameScore = calculateSimilarity(inputLower, program.name.toLowerCase()) * 3.0;
        const descriptionScore = calculateSimilarity(inputLower, program.description.toLowerCase()) * 2.0;
        const keywordScore = calculateContextScore(inputLower, program.keywords) * 5.0; // Increased weight for keywords since they’re the only field

        const baseScore = (nameScore + descriptionScore + keywordScore) / 10.0; // Adjusted for only keywords
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
          const keywordScore = calculateContextScore(keywordLower, program.keywords) * 5.0; // Increased weight for keywords

          score += ((nameScore + descriptionScore + keywordScore) / 10.0) * weight;
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