import { tokenizeAndStem, removeStopwords, calculateTfIdf, cosineSimilarity, normalizeText } from '../../lib/utils';
import Fuse from 'fuse.js';
import programs from '../../lib/programs.json';
import { createEnhancedNlpManager } from '../../lib/enhancedTraining';
import fs from 'fs';
import path from 'path';

const syntheticDataPath = path.join(process.cwd(), 'synthetic_data.json');
const syntheticData = JSON.parse(fs.readFileSync(syntheticDataPath, 'utf8'));

let classifier: any = null;

async function initializeClassifier() {
  if (!classifier) {
    classifier = await createEnhancedNlpManager(syntheticData);
  }
}

function processText(text: string): string[] {
  return removeStopwords(tokenizeAndStem(normalizeText(text)));
}

function calculateTfIdfSimilarity(userTokens: string[], programTokens: string[]): number {
  const allTokens = [...new Set([...userTokens, ...programTokens])];
  const userVector = calculateTfIdf(userTokens, [allTokens]);
  const programVector = calculateTfIdf(programTokens, [allTokens]);
  return cosineSimilarity(userVector, programVector);
}

async function calculateNlpSimilarity(userInput: string, programIndex: number): Promise<number> {
  const result = classifier.getClassifications(userInput);
  const programScore = result.find(c => c.label === `program_${programIndex}`);
  return programScore ? programScore.value : 0;
}

function calculateWeightedScore(tfidfScore: number, nlpScore: number): number {
  const tfidfWeight = 0.3;
  const nlpWeight = 0.7;
  return (tfidfScore * tfidfWeight) + (nlpScore * nlpWeight);
}

function fallbackMatching(userInput: string, programs: any[]): any[] {
  const lowercaseInput = userInput.toLowerCase();
  return programs.filter(program => 
    program.name.toLowerCase().includes(lowercaseInput) ||
    program.description.toLowerCase().includes(lowercaseInput) ||
    program.subjects.some((subject: string) => subject.toLowerCase().includes(lowercaseInput)) ||
    program.careers.some((career: string) => career.toLowerCase().includes(lowercaseInput)) ||
    program.skills.some((skill: string) => skill.toLowerCase().includes(lowercaseInput)) ||
    program.keywords.some((keyword: string) => keyword.toLowerCase().includes(lowercaseInput))
  );
}

export default async function handler(req: any, res: any) {
  console.log('API route called with method:', req.method);

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    await initializeClassifier();

    const { userInput } = req.body;
    console.log('Received user input:', userInput);

    if (typeof userInput !== 'string' || userInput.trim() === '') {
      return res.status(400).json({ error: 'Invalid user input' });
    }

    const userTokens = processText(userInput);
    console.log('Processed user tokens:', userTokens);

    const programScores = await Promise.all(programs.programs.map(async (program, index) => {
      const programText = `${program.name} ${program.description} ${program.subjects.join(' ')} ${program.careers.join(' ')} ${program.skills.join(' ')} ${program.keywords.join(' ')}`;
      const programTokens = processText(programText);
      
      const tfidfSimilarity = calculateTfIdfSimilarity(userTokens, programTokens);
      const nlpSimilarity = await calculateNlpSimilarity(userInput, index);
      
      const weightedScore = calculateWeightedScore(tfidfSimilarity, nlpSimilarity);
      
      return { program, similarity: weightedScore };
    }));

    console.log('Program scores:', programScores);

    programScores.sort((a, b) => b.similarity - a.similarity);

    const topPrograms = programScores.slice(0, 5).map(score => score.program);

    // Implement fuzzy matching for final ranking
    const fuse = new Fuse(topPrograms, {
      keys: ['name', 'description', 'subjects', 'careers', 'skills', 'keywords'],
      includeScore: true,
      threshold: 0.6,
      minMatchCharLength: 3
    });

    const fuzzyResults = fuse.search(userInput);
    const matchingPrograms = fuzzyResults
      .filter(result => result.score && result.score <= 0.6)
      .map(result => result.item);

    console.log('Matching programs:', matchingPrograms);

    res.status(200).json({ matchingPrograms: matchingPrograms.slice(0, 3) });
  } catch (error) {
    console.error('Error in match-programs API:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
}

