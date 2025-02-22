import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const { userInput } = await req.json();
    if (!userInput || typeof userInput !== "string") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const ollamaHost = process.env.OLLAMA_HOST || "http://localhost:11434";
    
    // First, extract keywords
    const keywordPrompt = `
      Given this input: "${userInput}", extract key interests, career goals, and skills as keywords with weights (CRITICAL: 2.0, HIGH: 1.5, MEDIUM: 1.0, LOW: 0.5). Return as JSON: { keywords: [{ keyword: string, weight: number }] }
    `;
    const keywordResponse = await axios.post(`${ollamaHost}/api/generate`, {
      model: "phi:latest",
      prompt: keywordPrompt,
      stream: false,
    });
    const keywordsResult = JSON.parse(keywordResponse.data.response || keywordResponse.data);

    // Second, generate a recommendation summary
    const recommendationPrompt = `
      Based on this input: "${userInput}", generate a concise recommendation message for a university program finder tool, like: "Based on your interests in [key interests], we recommend checking out [program names] at Tilburg University." Use up to 3 program names from these options: BSc International Business Administration, BSc Entrepreneurship and Business Innovation, LLB Global Law, BSc Psychology, BSc Cognitive Science and Artificial Intelligence, BSc Economics, BA Liberal Arts and Sciences, BSc Data Science, BSc Econometrics and Operations Research, BSc Global Management of Social Issues, BA Digital Culture, BSc Human Resource Studies: People Management, BSc International Sociology, BA Theology, BSc Leisure Studies. Keep the message under 100 words and avoid extra text.
    `;
    const recommendationResponse = await axios.post(`${ollamaHost}/api/generate`, {
      model: "phi:latest",
      prompt: recommendationPrompt,
      stream: false,
    });
    const recommendation = recommendationResponse.data.response || recommendationResponse.data;

    return NextResponse.json({ ...keywordsResult, recommendation });
  } catch (error) {
    console.error("Ollama error:", error);
    if (axios.isAxiosError(error)) {
      return NextResponse.json({ error: `Ollama API error: ${error.message} (Status: ${error.response?.status})` }, { status: 500 });
    }
    return NextResponse.json({ error: "Failed to process input with Ollama" }, { status: 500 });
  }
}