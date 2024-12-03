import { tokenizeAndStem, removeStopwords, calculateTfIdf, cosineSimilarity, normalizeText, extractKeywords } from './utils';

function processText(text: string): string[] {
  return removeStopwords(tokenizeAndStem(normalizeText(text)));
}

function calculateSimilarity(userTokens: string[], programTokens: string[]): number {
  const allTokens = [...new Set([...userTokens, ...programTokens])];
  const userVector = calculateTfIdf(userTokens, [allTokens]);
  const programVector = calculateTfIdf(programTokens, [allTokens]);
  return cosineSimilarity(userVector, programVector);
}

// Example usage:
const userText = "What is the weather like today?";
const programText = "The weather forecast shows sunny skies.";

const userTokens = processText(userText);
const programTokens = processText(programText);

const similarityScore = calculateSimilarity(userTokens, programTokens);

console.log(`Similarity score: ${similarityScore}`);

