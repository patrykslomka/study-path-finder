'use client'

import { useState } from 'react'
import { UserInputForm } from './user-input-form'
import { ProgramResults } from './program-results'
import { Loader2 } from 'lucide-react'

interface Program {
  name: string;
  description: string;
  subjects: string[];
  careers: string[];
  skills: string[];
  keywords: string[];
}

export default function StudyPathFinder() {
  const [matchingPrograms, setMatchingPrograms] = useState<Program[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userInput, setUserInput] = useState<string>('')

  const handleSubmit = async (input: string) => {
    setIsLoading(true)
    setError(null)
    setUserInput(input)
    try {
      const response = await fetch('/api/match-programs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userInput: input }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.matchingPrograms || !Array.isArray(data.matchingPrograms)) {
        throw new Error('Invalid response format')
      }

      setMatchingPrograms(data.matchingPrograms)
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      setError('An error occurred while fetching matching programs. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-center">Tilburg University Study Path Finder</h1>
      <UserInputForm onSubmit={handleSubmit} />
      {isLoading && (
        <div className="flex justify-center items-center mt-8">
          <Loader2 className="mr-2 h-8 w-8 animate-spin" />
          <p className="text-lg">Finding matching programs...</p>
        </div>
      )}
      {error && <p className="mt-8 text-red-500 text-center">{error}</p>}
      {!isLoading && !error && (
        <>
          {matchingPrograms.length > 0 ? (
            <>
              <h2 className="text-2xl font-semibold mt-12 mb-6 text-center">Matching Programs for "{userInput}"</h2>
              <ProgramResults programs={matchingPrograms} />
            </>
          ) : userInput && (
            <p className="mt-8 text-center">No specific matches found for "{userInput}". Try adjusting your input or using more specific terms.</p>
          )}
        </>
      )}
    </div>
  )
}

