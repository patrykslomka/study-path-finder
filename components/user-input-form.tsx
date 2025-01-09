'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface UserInputFormProps {
  onSubmit: (input: string) => void;
}

export function UserInputForm({ onSubmit }: UserInputFormProps) {
  const [userInput, setUserInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userInput.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/match-programs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userInput }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch matching programs')
      }

      const data = await response.json()
      onSubmit(data.matchingPrograms)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        placeholder="Tell us about your interests and future goals..."
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        className="min-h-[150px]"
      />
      <Button 
        type="submit" 
        disabled={!userInput.trim() || isSubmitting}
      >
        {isSubmitting ? 'Finding Programs...' : 'Find Matching Programs'}
      </Button>
    </form>
  )
}

