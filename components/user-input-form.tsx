import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface UserInputFormProps {
  onSubmit: (input: string) => void;
}

export function UserInputForm({ onSubmit }: UserInputFormProps) {
  const [userInput, setUserInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (userInput.trim()) {
      onSubmit(userInput)
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
      <Button type="submit" disabled={!userInput.trim()}>Find Matching Programs</Button>
    </form>
  )
}

