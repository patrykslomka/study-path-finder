import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import natural from 'natural';

// Utility function for combining Tailwind CSS classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Text processing utilities
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

export function tokenizeAndStem(text: string): string[] {
  const tokens = tokenizer.tokenize(text.toLowerCase());
  return tokens ? tokens.map(token => stemmer.stem(token)) : [];
}

// Function to remove stopwords
const stopwords = new Set(natural.stopwords);
export function removeStopwords(tokens: string[]): string[] {
  return tokens.filter(token => !stopwords.has(token));
}

// Function to calculate TF-IDF
export function calculateTfIdf(tokens: string[], documents: string[][] = []): number[] {
  const tfidf = new natural.TfIdf();

  tfidf.addDocument(tokens);
  documents.forEach(doc => {
    tfidf.addDocument(doc);
  });

  return tokens.map(token => tfidf.tfidf(token, 0));
}

// Function to calculate cosine similarity
export function cosineSimilarity(vec1: number[], vec2: number[]): number {
  const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
  const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
  const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));

  if (magnitude1 === 0 || magnitude2 === 0) return 0;

  return dotProduct / (magnitude1 * magnitude2);
}

// Function to normalize text (remove punctuation, lowercase, etc.)
export function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, '');
}

// Function to extract keywords from text
export function extractKeywords(text: string, topN: number = 5): string[] {
  const tokens = tokenizeAndStem(normalizeText(text));
  const filteredTokens = removeStopwords(tokens);

  const freqDist = natural.FrequencyDist.fromArray(filteredTokens);
  return freqDist.getMostFrequent(topN).map(([word]) => word);
}

