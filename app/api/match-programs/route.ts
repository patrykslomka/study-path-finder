import { NextResponse } from "next/server";
import { matchPrograms } from "@/lib/match-programs";
import programsData from "@/lib/programs.json"; // Import the entire JSON object

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let input: string | { keyword: string; weight: number }[];

    if ("weightedKeywords" in body) {
      input = body.weightedKeywords;
      console.log("Received weightedKeywords for guided search:", input); // Debug log
    } else if ("userInput" in body) {
      input = body.userInput;
      console.log("Received userInput for freeform search:", input); // Debug log
    } else {
      return NextResponse.json({ error: "Invalid input format" }, { status: 400 });
    }

    // Extract the programs array from the JSON object
    const programs = programsData.programs;
    if (!Array.isArray(programs)) {
      throw new Error("Programs data is not an array in programs.json");
    }

    const matchingPrograms = matchPrograms(input, programs);
    console.log("Matching programs output:", matchingPrograms); // Debug log

    if (!matchingPrograms || matchingPrograms.length === 0) {
      console.warn("No matching programs found for input:", input);
      return NextResponse.json({ matchingPrograms: [] }); // Explicitly return empty array
    }

    return NextResponse.json({ matchingPrograms });
  } catch (error) {
    console.error("Error in match-programs API:", error);
    return NextResponse.json({ error: `Failed to match programs: ${error.message}` }, { status: 500 });
  }
}