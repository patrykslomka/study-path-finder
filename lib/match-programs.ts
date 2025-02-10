import type { Program } from "@/types/program"

const KEYWORD_WEIGHTS = {
  CRITICAL: 2.0,
  HIGH: 1.5,
  MEDIUM: 1.0,
  LOW: 0.5,
}

// Define critical keywords for different intents
const INTENT_KEYWORDS = {
    entrepreneurship: [
      { term: "entrepreneur", weight: KEYWORD_WEIGHTS.CRITICAL },
      { term: "start business", weight: KEYWORD_WEIGHTS.CRITICAL },
      { term: "own business", weight: KEYWORD_WEIGHTS.CRITICAL },
      { term: "business innovation", weight: KEYWORD_WEIGHTS.HIGH },
      { term: "startup", weight: KEYWORD_WEIGHTS.HIGH },
      { term: "venture capital", weight: KEYWORD_WEIGHTS.MEDIUM },
      { term: "business model", weight: KEYWORD_WEIGHTS.MEDIUM },
    ],
    business: [
      { term: "international business", weight: KEYWORD_WEIGHTS.CRITICAL },
      { term: "supply chain", weight: KEYWORD_WEIGHTS.HIGH },
      { term: "marketing", weight: KEYWORD_WEIGHTS.HIGH },
      { term: "finance", weight: KEYWORD_WEIGHTS.HIGH },
      { term: "management", weight: KEYWORD_WEIGHTS.HIGH },
      { term: "corporate strategy", weight: KEYWORD_WEIGHTS.MEDIUM },
      { term: "global markets", weight: KEYWORD_WEIGHTS.MEDIUM },
    ],
    economics: [
      { term: "economics", weight: KEYWORD_WEIGHTS.CRITICAL },
      { term: "macroeconomics", weight: KEYWORD_WEIGHTS.HIGH },
      { term: "microeconomics", weight: KEYWORD_WEIGHTS.HIGH },
      { term: "economic policy", weight: KEYWORD_WEIGHTS.MEDIUM },
      { term: "development economics", weight: KEYWORD_WEIGHTS.MEDIUM },
      { term: "financial markets", weight: KEYWORD_WEIGHTS.MEDIUM },
    ],
    law: [
      { term: "global law", weight: KEYWORD_WEIGHTS.CRITICAL },
      { term: "international law", weight: KEYWORD_WEIGHTS.CRITICAL },
      { term: "human rights", weight: KEYWORD_WEIGHTS.HIGH },
      { term: "corporate law", weight: KEYWORD_WEIGHTS.HIGH },
      { term: "environmental law", weight: KEYWORD_WEIGHTS.MEDIUM },
      { term: "legal analysis", weight: KEYWORD_WEIGHTS.MEDIUM },
    ],
    psychology: [
      { term: "psychology", weight: KEYWORD_WEIGHTS.CRITICAL },
      { term: "mental health", weight: KEYWORD_WEIGHTS.HIGH },
      { term: "cognitive psychology", weight: KEYWORD_WEIGHTS.HIGH },
      { term: "neuroscience", weight: KEYWORD_WEIGHTS.HIGH },
      { term: "behavioral science", weight: KEYWORD_WEIGHTS.MEDIUM },
      { term: "clinical psychology", weight: KEYWORD_WEIGHTS.MEDIUM },
      { term: "personality psychology", weight: KEYWORD_WEIGHTS.LOW },
    ],
    sociology: [
      { term: "sociology", weight: KEYWORD_WEIGHTS.CRITICAL },
      { term: "social inequality", weight: KEYWORD_WEIGHTS.HIGH },
      { term: "migration", weight: KEYWORD_WEIGHTS.HIGH },
      { term: "cultural diversity", weight: KEYWORD_WEIGHTS.HIGH },
      { term: "social research", weight: KEYWORD_WEIGHTS.MEDIUM },
      { term: "policy analysis", weight: KEYWORD_WEIGHTS.MEDIUM },
    ],
    ai_and_data: [
      { term: "artificial intelligence", weight: KEYWORD_WEIGHTS.CRITICAL },
      { term: "machine learning", weight: KEYWORD_WEIGHTS.CRITICAL },
      { term: "cognitive science", weight: KEYWORD_WEIGHTS.HIGH },
      { term: "data science", weight: KEYWORD_WEIGHTS.CRITICAL },
      { term: "technology", weight: KEYWORD_WEIGHTS.CRITICAL },
      { term: "big data", weight: KEYWORD_WEIGHTS.HIGH },
      { term: "natural language processing", weight: KEYWORD_WEIGHTS.MEDIUM },
      { term: "predictive modeling", weight: KEYWORD_WEIGHTS.MEDIUM },
    ],
    econometrics: [
      { term: "econometrics", weight: KEYWORD_WEIGHTS.CRITICAL },
      { term: "quantitative analysis", weight: KEYWORD_WEIGHTS.HIGH },
      { term: "operations research", weight: KEYWORD_WEIGHTS.HIGH },
      { term: "statistical modeling", weight: KEYWORD_WEIGHTS.MEDIUM },
      { term: "optimization", weight: KEYWORD_WEIGHTS.MEDIUM },
    ],
    human_resources: [
      { term: "human resource management", weight: KEYWORD_WEIGHTS.CRITICAL },
      { term: "talent management", weight: KEYWORD_WEIGHTS.HIGH },
      { term: "people management", weight: KEYWORD_WEIGHTS.HIGH },
      { term: "leadership", weight: KEYWORD_WEIGHTS.MEDIUM },
      { term: "diversity and inclusion", weight: KEYWORD_WEIGHTS.MEDIUM },
    ],
    global_issues: [
      { term: "social impact", weight: KEYWORD_WEIGHTS.CRITICAL },
      { term: "sustainability", weight: KEYWORD_WEIGHTS.HIGH },
      { term: "human rights", weight: KEYWORD_WEIGHTS.HIGH },
      { term: "social policy", weight: KEYWORD_WEIGHTS.HIGH },
      { term: "corporate social responsibility", weight: KEYWORD_WEIGHTS.MEDIUM },
    ],
    theology: [
      { term: "theology", weight: KEYWORD_WEIGHTS.CRITICAL },
      { term: "religion", weight: KEYWORD_WEIGHTS.CRITICAL },
      { term: "spirituality", weight: KEYWORD_WEIGHTS.HIGH },
      { term: "ethics", weight: KEYWORD_WEIGHTS.HIGH },
      { term: "biblical studies", weight: KEYWORD_WEIGHTS.MEDIUM },
    ],
    digital_culture: [
      { term: "digital culture", weight: KEYWORD_WEIGHTS.CRITICAL },
      { term: "media studies", weight: KEYWORD_WEIGHTS.HIGH },
      { term: "social media", weight: KEYWORD_WEIGHTS.HIGH },
      { term: "digital storytelling", weight: KEYWORD_WEIGHTS.MEDIUM },
      { term: "human-computer interaction", weight: KEYWORD_WEIGHTS.MEDIUM },
    ],
    leisure_studies: [
      { term: "leisure", weight: KEYWORD_WEIGHTS.CRITICAL },
      { term: "tourism", weight: KEYWORD_WEIGHTS.HIGH },
      { term: "event management", weight: KEYWORD_WEIGHTS.HIGH },
      { term: "cultural programming", weight: KEYWORD_WEIGHTS.MEDIUM },
    ],
    technology: [
      { term: "technology", weight: KEYWORD_WEIGHTS.CRITICAL },
      { term: "computer science", weight: KEYWORD_WEIGHTS.CRITICAL },
      { term: "data science", weight: KEYWORD_WEIGHTS.HIGH },
      { term: "artificial intelligence", weight: KEYWORD_WEIGHTS.HIGH },
    ],
    social_sciences: [
      { term: "sociology", weight: KEYWORD_WEIGHTS.CRITICAL },
      { term: "psychology", weight: KEYWORD_WEIGHTS.CRITICAL },
      { term: "anthropology", weight: KEYWORD_WEIGHTS.HIGH },
      { term: "political science", weight: KEYWORD_WEIGHTS.HIGH },
    ]
  }

  interface WeightedKeyword {
    keyword: string;
    weight: number;
  }
  
  export function matchPrograms(input: string | WeightedKeyword[], programs: Program[]): Program[] {
    try {
      const scoredPrograms = programs.map((program) => {
        let score = 0;
  
        if (typeof input === "string") {
          const inputLower = input.toLowerCase();
  
          // Calculate intent match score
          let intentScore = 0;
          Object.entries(INTENT_KEYWORDS).forEach(([intent, keywords]) => {
            let intentMatches = 0;
            keywords.forEach(({ term, weight }) => {
              if (inputLower.includes(term)) {
                intentMatches += weight;
              }
            });
            intentScore = Math.max(intentScore, intentMatches);
          });
  
          // Calculate program relevance score
          const nameScore = calculateSimilarity(inputLower, program.name.toLowerCase()) * 3.0;
          const descriptionScore = calculateSimilarity(inputLower, program.description.toLowerCase()) * 2.0;
          const keywordScore = calculateContextScore(inputLower, program.keywords) * 2.5;
          const skillScore = calculateContextScore(inputLower, program.skills) * 1.5;
          const careerScore = calculateContextScore(inputLower, program.careers) * 1.5;
          const subjectScore = calculateContextScore(inputLower, program.subjects) * 2.0;
  
          // Combine scores
          const baseScore = (nameScore + descriptionScore + keywordScore + skillScore + careerScore + subjectScore) / 12.5;
          score = baseScore * (1 + intentScore);
  
          // Apply exact match bonus
          if (program.keywords.some((keyword) => inputLower.includes(keyword.toLowerCase()))) {
            score *= 1.5;
          }
        } else {
          // Handle weighted keywords (for guided search)
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
        }
  
        return { program, score };
      });
  
      // Sort by score and return top matches with adjusted percentages
      return scoredPrograms
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(({ program, score }, index) => ({
          ...program,
          compatibilityPercentage: calculateDisplayPercentage(score, index),
        }));
    } catch (error) {
      console.error("Error in matchPrograms:", error);
      return [];
    }
  }
  
  function calculateSimilarity(str1: string, str2: string): number {
    const words1 = new Set(str1.split(/\s+/));
    const words2 = new Set(str2.split(/\s+/));
    const intersection = new Set([...words1].filter((x) => words2.has(x)));
    return intersection.size / Math.max(words1.size, words2.size);
  }
  
  function calculateContextScore(input: string, contextArray: string[]): number {
    const inputWords = new Set(input.split(/\s+/));
    let matches = 0;
    contextArray.forEach((item) => {
      const itemWords = new Set(item.toLowerCase().split(/\s+/));
      inputWords.forEach((word) => {
        if (itemWords.has(word)) matches++;
      });
    });
    return matches / Math.max(inputWords.size, 1);
  }
  
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