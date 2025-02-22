import { NextResponse } from "next/server";
import { matchPrograms } from "@/lib/match-programs";
import programsData from "@/lib/programs.json"; // Import the entire JSON object

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let input: string | { keyword: string; weight: number }[];

    if ("weightedKeywords" in body) {
      input = body.weightedKeywords;
    } else if ("userInput" in body) {
      input = body.userInput;
    } else {
      return NextResponse.json({ error: "Invalid input format" }, { status: 400 });
    }

    // Extract the programs array from the JSON object
    const programs = programsData.programs;
    if (!Array.isArray(programs)) {
      throw new Error("Programs data is not an array in programs.json");
    }

    const matchingPrograms = matchPrograms(input, programs);
    return NextResponse.json({ matchingPrograms });
  } catch (error) {
    console.error("Error in match-programs API:", error);
    return NextResponse.json({ error: `Failed to match programs: ${error.message}` }, { status: 500 });
  }
}