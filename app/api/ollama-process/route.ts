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

    // Try smaller model (e.g., smollm)
    let keywordResponse, recommendationResponse;
    try {
      [keywordResponse, recommendationResponse] = await Promise.all([
        axios.post(`${ollamaHost}/api/generate`, {
          model: "smollm", // Using smollm as per your current setup
          prompt: `
            Given this input: "${userInput}", extract up to 5 key interests, career goals, or skills as keywords with weights (CRITICAL: 2.0, HIGH: 1.5, MEDIUM: 1.0, LOW: 0.5). Return as JSON: { keywords: [{ keyword: string, weight: number }] }
          `,
          stream: false,
        }, { timeout: 30000 }),
        axios.post(`${ollamaHost}/api/generate`, {
          model: "smollm", // Using smollm as per your current setup
          prompt: `
            Based on this input: "${userInput}", generate a concise recommendation message for a university program finder tool, like: "Based on your interests in [key interests], we recommend checking out [program names] at Tilburg University." Use up to 3 program names from these options: BSc International Business Administration, BSc Entrepreneurship and Business Innovation, LLB Global Law, BSc Psychology, BSc Cognitive Science and Artificial Intelligence, BSc Economics, BA Liberal Arts and Sciences, BSc Data Science, BSc Econometrics and Operations Research, BSc Global Management of Social Issues, BA Digital Culture, BSc Human Resource Studies: People Management, BSc International Sociology, BA Theology, BSc Leisure Studies. Keep the message under 100 words and avoid extra text.
          `,
          stream: false,
        }, { timeout: 30000 }),
      ]);
    } catch (error) {
      console.warn("smollm failed, falling back to ben1t0/tiny-llm:", error);
      // Fallback to ben1t0/tiny-llm
      [keywordResponse, recommendationResponse] = await Promise.all([
        axios.post(`${ollamaHost}/api/generate`, {
          model: "ben1t0/tiny-llm",
          prompt: `
            Given this input: "${userInput}", extract up to 5 key interests, career goals, or skills as keywords with weights (CRITICAL: 2.0, HIGH: 1.5, MEDIUM: 1.0, LOW: 0.5). Return as JSON: { keywords: [{ keyword: string, weight: number }] }
          `,
          stream: false,
        }, { timeout: 30000 }),
        axios.post(`${ollamaHost}/api/generate`, {
          model: "ben1t0/tiny-llm",
          prompt: `
            Based on this input: "${userInput}", generate a concise recommendation message for a university program finder tool, like: "Based on your interests in [key interests], we recommend checking out [program names] at Tilburg University." Use up to 3 program names from these options: BSc International Business Administration, BSc Entrepreneurship and Business Innovation, LLB Global Law, BSc Psychology, BSc Cognitive Science and Artificial Intelligence, BSc Economics, BA Liberal Arts and Sciences, BSc Data Science, BSc Econometrics and Operations Research, BSc Global Management of Social Issues, BA Digital Culture, BSc Human Resource Studies: People Management, BSc International Sociology, BA Theology, BSc Leisure Studies. Keep the message under 100 words and avoid extra text.
          `,
          stream: false,
        }, { timeout: 30000 }),
      ]);
    }

    // Handle potential non-JSON or malformed responses
    let keywordsResult;
    try {
      keywordsResult = JSON.parse(keywordResponse.data.response.trim() || "{}");
    } catch (parseError) {
      console.error("Failed to parse keywords response:", parseError, keywordResponse.data.response);
      throw new Error("Invalid keywords format from Ollama");
    }

    const recommendation = recommendationResponse.data.response.trim() || "";

    if (!keywordsResult.keywords || !Array.isArray(keywordsResult.keywords)) {
      throw new Error("Invalid keywords format from Ollama");
    }

    console.log("Weighted Keywords from Ollama:", keywordsResult.keywords); // Debug log
    console.log("Recommendation from Ollama:", recommendation); // Debug log
    console.timeEnd("Ollama Processing");

    return NextResponse.json({ keywords: keywordsResult.keywords, recommendation });
  } catch (error) {
    console.error("Ollama error:", error);
    if (axios.isAxiosError(error)) {
      return NextResponse.json({ error: `Ollama API error: ${error.message} (Status: ${error.response?.status})` }, { status: 500 });
    }
    return NextResponse.json({ error: "Failed to process input with Ollama" }, { status: 500 });
  }
}