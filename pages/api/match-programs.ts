import natural from 'natural';
import programs from '../../../programs.json';

const TfIdf = natural.TfIdf;
const tokenizer = new natural.WordTokenizer();

function processText(text) {
  return tokenizer.tokenize(text.toLowerCase());
}

function calculateSimilarity(userTokens, programTokens) {
  const tfidf = new TfIdf();
  tfidf.addDocument(userTokens);
  tfidf.addDocument(programTokens);

  const userVector = tfidf.vector(0);
  const programVector = tfidf.vector(1);

  let dotProduct = 0;
  let userMagnitude = 0;
  let programMagnitude = 0;

  for (let i = 0; i < userVector.length; i++) {
    dotProduct += userVector[i][1] * (programVector[i] ? programVector[i][1] : 0);
    userMagnitude += Math.pow(userVector[i][1], 2);
  }

  for (let i = 0; i < programVector.length; i++) {
    programMagnitude += Math.pow(programVector[i][1], 2);
  }

  return dotProduct / (Math.sqrt(userMagnitude) * Math.sqrt(programMagnitude));
}

export function matchPrograms(userInput) {
  const userTokens = processText(userInput);

  const programScores = programs.programs.map(program => {
    const programText = `${program.name} ${program.description} ${program.subjects.join(' ')} ${program.careers.join(' ')} ${program.skills.join(' ')} ${program.keywords.join(' ')}`;
    const programTokens = processText(programText);
    const similarity = calculateSimilarity(userTokens, programTokens);
    return { program, similarity };
  });

  programScores.sort((a, b) => b.similarity - a.similarity);

  return programScores.slice(0, 3).map(score => score.program);
}

// Example usage
const userInput = "I'm interested in technology and how it can be used to solve business problems. I want to work with data and create innovative solutions.";
const matchingPrograms = matchPrograms(userInput);
console.log(matchingPrograms);