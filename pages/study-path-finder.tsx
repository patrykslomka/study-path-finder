'use client'

import { useState } from 'react'
import { UserInputForm } from '../components/user-input-form'
import { ProgramResults } from '../components/program-results'

export default function StudyPathFinder() {
  const [matchingPrograms, setMatchingPrograms] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (userInput: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/match-programs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userInput }),
      })
      const data = await response.json()
      setMatchingPrograms(data.matchingPrograms)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Tilburg University Study Path Finder</h1>
      <UserInputForm onSubmit={handleSubmit} />
      {isLoading && <p className="mt-4">Finding matching programs...</p>}
      {matchingPrograms.length > 0 && <ProgramResults programs={matchingPrograms} />}
    </div>
  )
}

