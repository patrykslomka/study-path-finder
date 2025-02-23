import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const { userInput } = await req.json();
    if (!userInput || typeof userInput !== "string") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const ollamaHost = process.env.OLLAMA_HOST || "http://localhost:11434";
    console.time("Ollama Processing");

    // Parallelize keyword extraction and recommendation generation
    const [keywordResponse, recommendationResponse] = await Promise.all([
      axios.post(`${ollamaHost}/api/generate`, {
        model: "phi:latest",
        prompt: `
          Given this input: "${userInput}", extract up to 5 key interests, career goals, or skills as keywords with weights (CRITICAL: 2.0, HIGH: 1.5, MEDIUM: 1.0, LOW: 0.5). Return as JSON: { keywords: [{ keyword: string, weight: number }] }
        `,
        stream: false,
      }),
      axios.post(`${ollamaHost}/api/generate`, {
        model: "phi:latest",
        prompt: `
          Based on this input: "${userInput}", generate a concise recommendation message for a university program finder tool, like: "Based on your interests in [key interests], we recommend checking out [program names] at Tilburg University." Use up to 3 program names from these options: BSc International Business Administration, BSc Entrepreneurship and Business Innovation, LLB Global Law, BSc Psychology, BSc Cognitive Science and Artificial Intelligence, BSc Economics, BA Liberal Arts and Sciences, BSc Data Science, BSc Econometrics and Operations Research, BSc Global Management of Social Issues, BA Digital Culture, BSc Human Resource Studies: People Management, BSc International Sociology, BA Theology, BSc Leisure Studies. Keep the message under 100 words and avoid extra text.
        `,
        stream: false,
      }),
    ]);

    const keywordsResult = JSON.parse(keywordResponse.data.response || "{}");
    const recommendation = recommendationResponse.data.response || "";

    console.log("Weighted Keywords from Ollama:", keywordsResult.keywords); // Debug log
    console.log("Recommendation from Ollama:", recommendation); // Debug log
    console.timeEnd("Ollama Processing");

    return NextResponse.json({ keywords: keywordsResult.keywords || [], recommendation });
  } catch (error) {
    console.error("Ollama error:", error);
    if (axios.isAxiosError(error)) {
      return NextResponse.json({ error: `Ollama API error: ${error.message} (Status: ${error.response?.status})` }, { status: 500 });
    }
    return NextResponse.json({ error: "Failed to process input with Ollama" }, { status: 500 });
  }
}