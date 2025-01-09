'use client'

import { useState } from 'react'
import { UserInputForm } from '@/components/user-input-form'
import { ProgramResults } from '@/components/program-results'
import type { Program } from '@/types/program'

export default function Home() {
  const [matchingPrograms, setMatchingPrograms] = useState<Program[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleResults = (programs: Program[]) => {
    setError(null)
    setMatchingPrograms(programs)
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Tilburg University Study Path Finder
      </h1>
      <UserInputForm onSubmit={handleResults} />
      {error && (
        <p className="mt-4 text-red-500 text-center">{error}</p>
      )}
      {matchingPrograms.length > 0 && (
        <div className="mt-8">
          <ProgramResults programs={matchingPrograms} />
        </div>
      )}
    </main>
  )
}

