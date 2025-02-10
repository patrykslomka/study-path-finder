import { NextResponse } from "next/server"
import { matchPrograms } from "@/lib/match-programs"
import programsData from "@/lib/programs.json"

export async function POST(request: Request) {
  try {
    const { weightedKeywords, userInput } = await request.json()

    if (!weightedKeywords && !userInput) {
      return NextResponse.json({ error: "Either weighted keywords or user input is required" }, { status: 400 })
    }

    const matchingPrograms = matchPrograms(weightedKeywords || userInput, programsData.programs)

    return NextResponse.json({ matchingPrograms })
  } catch (error) {
    console.error("Error in match-programs route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

