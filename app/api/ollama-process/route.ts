import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  console.time("Ollama Processing");
  try {
    const { userInput } = await req.json();
    if (!userInput || typeof userInput !== "string") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const ollamaHost = process.env.OLLAMA_HOST || "http://localhost:11434";
    const programList = [
      "BSc International Business Administration",
      "BSc Entrepreneurship and Business Innovation",
      "LLB Global Law",
      "BSc Psychology",
      "BSc Cognitive Science and Artificial Intelligence",
      "BSc Economics",
      "BA Liberal Arts and Sciences",
      "BSc Data Science",
      "BSc Econometrics and Operations Research",
      "BSc Global Management of Social Issues",
      "BA Digital Culture",
      "BSc Human Resource Studies: People Management",
      "BSc International Sociology",
      "BA Theology",
      "BSc Leisure Studies",
    ];

    // Sequential requests to reduce resource usage
    const keywordResponse = await axios.post(`${ollamaHost}/api/generate`, {
      model: "llama3.2:3b-instruct-q4_0",
      prompt: `
        Given this input: "${userInput}", extract up to 5 key interests, career goals, or skills as keywords with weights (CRITICAL: 2.0, HIGH: 1.5, MEDIUM: 1.0, LOW: 0.5). Return the result strictly as JSON in the format: { "keywords": [{ "keyword": string, "weight": number }] }. Do not include any additional text, explanations, or code snippets outside the JSON.

        Example:
        For input: "I want to work with technology and innovate in AI",
        Output: { "keywords": [{ "keyword": "technology", "weight": 2.0 }, { "keyword": "artificial intelligence", "weight": 2.0 }, { "keyword": "innovation", "weight": 1.5 }] }
      `,
      stream: false,
    }, { timeout: 180000 });

    const recommendationResponse = await axios.post(`${ollamaHost}/api/generate`, {
      model: "llama3.2:3b-instruct-q4_0",
      prompt: `
        Based on this input: "${userInput}", generate a concise recommendation message for a university program finder tool, like: "Based on your interests in [key interests], we recommend checking out [program names] at Tilburg University." Use up to 3 program names from these options: ${programList.join(", ")}. Keep the message under 100 words and avoid extra text.
      `,
      stream: false,
    }, { timeout: 180000 });

    const recommendationText = recommendationResponse.data.response.trim() || "";
    const recommendedProgramsMatch = recommendationText.match(/we recommend checking out (.+?) at Tilburg University/);
    const recommendedPrograms = recommendedProgramsMatch ? recommendedProgramsMatch[1] : programList.slice(0, 3).join(", ");
    const recommendedProgramList = recommendedPrograms.split(", ").map((program) => program.trim());

    const explanationResponse = await axios.post(`${ollamaHost}/api/generate`, {
      model: "llama3.2:3b-instruct-q4_0",
      prompt: `
        Based on this input: "${userInput}", write a short explanation (2-3 sentences) showing that you understood the prospective student's interests and goals, and explain why you recommend the following Tilburg University programs: ${recommendedPrograms}. Do not mention any other programs or universities outside this list: ${programList.join(", ")}. Focus on how these programs align with the student's stated interests and goals. For example: "I see you're passionate about technology and innovation, aiming to work in a tech-driven field. That's why I recommend BSc Cognitive Science and Artificial Intelligence and BSc Data Science at Tilburg University, which focus on AI, data analysis, and cutting-edge tech development." Keep the explanation under 100 words.
      `,
      stream: false,
    }, { timeout: 180000 });

    // Handle potential non-JSON or malformed responses for keywords
    let keywordsResult;
    try {
      const rawResponse = keywordResponse.data.response.trim();
      keywordsResult = JSON.parse(rawResponse || "{}");

      // Validate the JSON structure
      if (!keywordsResult.keywords || !Array.isArray(keywordsResult.keywords)) {
        throw new Error("Invalid keywords format: 'keywords' must be an array");
      }

      for (const kw of keywordsResult.keywords) {
        if (!kw.keyword || typeof kw.keyword !== "string" || !kw.weight || typeof kw.weight !== "number") {
          throw new Error("Invalid keyword entry: must have 'keyword' (string) and 'weight' (number)");
        }
      }
    } catch (parseError) {
      console.error("Failed to parse keywords response:", parseError, keywordResponse.data.response);
      // Fallback to basic keyword extraction
      const fallbackKeywords = userInput
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 3 && !["want", "like", "interested"].includes(word))
        .slice(0, 5)
        .map((word) => ({ keyword: word, weight: 1.0 }));
      keywordsResult = { keywords: fallbackKeywords };
    }

    const recommendation = recommendationText;
    const explanation = explanationResponse.data.response.trim() || `I understood your interests and recommend ${recommendedPrograms} at Tilburg University based on your goals.`;

    console.log("Weighted Keywords from Ollama:", keywordsResult.keywords);
    console.log("Recommendation from Ollama:", recommendation);
    console.log("Explanation from Ollama:", explanation);

    return NextResponse.json({ keywords: keywordsResult.keywords, recommendation, explanation });
  } catch (error) {
    console.error("Ollama error:", error);
    if (axios.isAxiosError(error)) {
      return NextResponse.json({ error: `Ollama API error: ${error.message} (Status: ${error.response?.status})` }, { status: 500 });
    }
    return NextResponse.json({ error: "Failed to process input with Ollama" }, { status: 500 });
  } finally {
    console.timeEnd("Ollama Processing");
  }
}