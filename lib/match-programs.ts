import { Program } from '@/types/program'
import { calculateSimilarity, calculateContextScore } from './utils'

interface ScoredProgram {
  program: Program
  score: number
}

export function matchPrograms(userInput: string, programs: Program[]): Program[] {
  try {
    const scoredPrograms: ScoredProgram[] = programs.map(program => {
      // Calculate main content similarity
      const contentSimilarity = calculateSimilarity(
        userInput,
        `${program.name} ${program.description}`
      )

      // Calculate context relevance
      const contextScore = calculateContextScore(
        userInput,
        [
          ...program.keywords,
          ...program.skills,
          ...program.careers
        ]
      )

      // Special handling for entrepreneurship-related queries
      const isEntrepreneurshipQuery = userInput.toLowerCase().includes('own business') ||
        userInput.toLowerCase().includes('start business') ||
        userInput.toLowerCase().includes('entrepreneur')

      // Apply program-specific boosts
      let boost = 1.0
      if (isEntrepreneurshipQuery) {
        if (program.name.toLowerCase().includes('entrepreneur')) {
          boost = 2.0
        } else if (program.name.toLowerCase().includes('business')) {
          boost = 1.5
        }
      }

      // Calculate final score
      const score = (contentSimilarity * 0.4 + contextScore * 0.6) * boost

      return { program, score }
    })

    // Sort by score and return top matches
    return scoredPrograms
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.program)

  } catch (error) {
    console.error('Error in matchPrograms:', error)
    return []
  }
}

