import natural from 'natural';
import programs from './programs.json';
import { additionalTrainingData } from './additional-training-data';

const tokenizer = new natural.WordTokenizer();
const classifier = new natural.BayesClassifier();

export async function createEnhancedNlpManager(syntheticData: string[]) {
  // Add existing programs to classifier
  programs.programs.forEach((program, index) => {
    const doc = `${program.name} ${program.description} ${program.subjects.join(' ')} ${program.careers.join(' ')} ${program.skills.join(' ')} ${program.keywords.join(' ')}`;
    classifier.addDocument(doc, `program_${index}`);
  });

  // Add additional training data
  additionalTrainingData.forEach((data, index) => {
    classifier.addDocument(data.content, `program_${index}`);
  });

  // Enhance training data with synthetic data
  syntheticData.forEach((entry, index) => {
    const keyInfo = extractKeyInfo(entry);
    classifier.addDocument(keyInfo.join(' '), `synthetic_${index}`);
  });

  await new Promise<void>((resolve) => {
    classifier.train(() => {
      resolve();
    });
  });

  return classifier;
}

function extractKeyInfo(entry: string): string[] {
  const tokens = tokenizer.tokenize(entry.toLowerCase());
  return tokens ? tokens.filter(token => token.length > 2) : []; // Remove short words
}

