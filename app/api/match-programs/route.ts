import { NextResponse } from 'next/server'
import { matchPrograms } from '@/lib/match-programs'
import programs from '@/lib/programs.json'

export async function POST(req: Request) {
  try {
    const { userInput } = await req.json()

    if (!userInput || typeof userInput !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      )
    }

    const matchingPrograms = matchPrograms(userInput, programs.programs)

    return NextResponse.json({
      matchingPrograms,
      message: 'Successfully matched programs'
    })

  } catch (error) {
    console.error('Error matching programs:', error)
    return NextResponse.json(
      { 
        error: 'An error occurred while processing your request',
        matchingPrograms: []
      },
      { status: 500 }
    )
  }
}

