import { ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Simple stemmer implementation (Porter's algorithm simplified)
export function stemWord(word: string): string {
  return word.toLowerCase()
    .replace(/(?:s|es|ed|ing|ly)$/, '')
}

// Simplified tokenizer
export function tokenize(text: string): string[] {
  return text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0)
}

// Domain-specific stopwords
const stopwords = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'were', 'will', 'with', 'would', 'like', 'want',
  'interested', 'looking', 'i', 'my', 'me', 'we', 'our'
])

export function removeStopwords(tokens: string[]): string[] {
  return tokens.filter(token => !stopwords.has(token))
}

// Keyword importance weights
const keywordWeights: Record<string, number> = {
  'entrepreneur': 2.0,
  'business': 1.8,
  'startup': 2.0,
  'innovation': 1.5,
  'create': 1.5,
  'own': 2.0,
  'start': 1.5,
  'management': 1.0,
  'international': 0.8,
  'law': 0.7,
  'technology': 1.5,
  'data': 1.5,
  'psychology': 1.2,
  'research': 1.0,
  'analysis': 1.2
}

export function calculateSimilarity(text1: string, text2: string): number {
  const tokens1 = new Set(removeStopwords(tokenize(text1)).map(stemWord))
  const tokens2 = new Set(removeStopwords(tokenize(text2)).map(stemWord))
  
  let score = 0
  tokens1.forEach(token => {
    if (tokens2.has(token)) {
      score += keywordWeights[token] || 1.0
    }
  })
  
  return score / (Math.sqrt(tokens1.size) * Math.sqrt(tokens2.size))
}

export function calculateContextScore(text: string, context: string[]): number {
  const tokens = new Set(removeStopwords(tokenize(text)).map(stemWord))
  const contextTokens = new Set(context.flatMap(c => removeStopwords(tokenize(c)).map(stemWord)))
  
  let matches = 0
  tokens.forEach(token => {
    if (contextTokens.has(token)) {
      matches += keywordWeights[token] || 1.0
    }
  })
  
  return matches / Math.max(1, tokens.size)
}