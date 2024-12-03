'use client'

import { useState } from 'react'
import { UserInputForm } from '../components/user-input-form'
import { ProgramResults } from '../components/program-results'

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
    console.log('Submitting user input:', input)
    try {
      const response = await fetch('/api/match-programs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userInput: input }),
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Received data:', data)

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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Tilburg University Study Path Finder</h1>
      <UserInputForm onSubmit={handleSubmit} />
      {isLoading && <p className="mt-4">Finding matching programs...</p>}
      {error && <p className="mt-4 text-red-500">{error}</p>}
      {!isLoading && !error && (
        <>
          {matchingPrograms.length > 0 ? (
            <>
              <h2 className="text-2xl font-semibold mt-8 mb-4">Matching Programs for "{userInput}":</h2>
              <ProgramResults programs={matchingPrograms} />
            </>
          ) : (
            <p className="mt-4">No specific matches found for "{userInput}". Try adjusting your input or using more specific terms.</p>
          )}
        </>
      )}
    </div>
  )
}

