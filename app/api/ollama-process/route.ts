import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: Request) {
  console.time("Claude Processing");
  try {
    const { userInput } = await req.json();
    if (!userInput || typeof userInput !== "string") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Debug: Log the API key to verify it's loaded
    console.log("ANTHROPIC_API_KEY:", process.env.ANTHROPIC_API_KEY);

    // Check if API key is present
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error("ANTHROPIC_API_KEY is not set in environment variables");
      // Fallback to string-based matching
      throw new Error("Anthropic API key is missing. Falling back to string-based matching.");
    }

    // Initialize Anthropic client with API key from environment variable
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

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

    // Request 1: Extract keywords using Claude 3 Haiku
    const keywordResponse = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `
            Given this input: "${userInput}", extract up to 5 key interests, career goals, or skills as keywords with weights (CRITICAL: 2.0, HIGH: 1.5, MEDIUM: 1.0, LOW: 0.5). Return the result strictly as JSON in the format: { "keywords": [{ "keyword": string, "weight": number }] }. Do not include any additional text, explanations, or code snippets outside the JSON.

            Example:
            For input: "I want to work with technology and innovate in AI",
            Output: { "keywords": [{ "keyword": "technology", "weight": 2.0 }, { "keyword": "artificial intelligence", "weight": 2.0 }, { "keyword": "innovation", "weight": 1.5 }] }
          `,
        },
      ],
    });

    // Request 2: Generate recommendation message
    const recommendationResponse = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `
            Based on this input: "${userInput}", generate a concise recommendation message for a university program finder tool, like: "Based on your interests in [key interests], we recommend checking out [program names] at Tilburg University." Use up to 3 program names from these options: ${programList.join(", ")}. Keep the message under 100 words and avoid extra text.
          `,
        },
      ],
    });

    // Extract recommended programs for the explanation prompt
    const recommendationText = recommendationResponse.content[0].text.trim();
    const recommendedProgramsMatch = recommendationText.match(/we recommend checking out (.+?) at Tilburg University/);
    const recommendedPrograms = recommendedProgramsMatch ? recommendedProgramsMatch[1] : programList.slice(0, 3).join(", ");

    // Request 3: Generate explanation
    const explanationResponse = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `
            Based on this input: "${userInput}", write a short explanation (2-3 sentences) directly addressing the student, explaining why the following Tilburg University programs are the best match for them: ${recommendedPrograms}. Use student-focused language like "it looks like it would be best for you to follow this program" to make it engaging. Do not mention any other programs outside of ${recommendedPrograms}, and do not mention other universities. Focus on how these programs align with the student's stated interests, career goals, and skills. Keep the explanation under 100 words.
          `,
        },
      ],
    });

    // Handle keyword response
    let keywordsResult;
    try {
      const rawResponse = keywordResponse.content[0].text.trim();
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
      console.error("Failed to parse keywords response:", parseError, keywordResponse.content[0].text);
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
    const explanation = explanationResponse.content[0].text.trim() || `I understood your interests and recommend ${recommendedPrograms} at Tilburg University based on your goals.`;

    console.log("Weighted Keywords from Claude:", keywordsResult.keywords);
    console.log("Recommendation from Claude:", recommendation);
    console.log("Explanation from Claude:", explanation);

    return NextResponse.json({ keywords: keywordsResult.keywords, recommendation, explanation });
  } catch (error) {
    console.error("Claude API error:", error);
    // Fallback to string-based matching if Claude API fails
    try {
      const fallbackResponse = await fetch("/api/match-programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput }),
        timeout: 60000,
      });

      if (!fallbackResponse.ok) {
        const errorText = await fallbackResponse.text();
        throw new Error(`Fallback failed: ${fallbackResponse.status} - ${errorText}`);
      }

      const data = await fallbackResponse.json();
      console.log("Fallback API Response:", data);

      const programs = Array.isArray(data.matchingPrograms) ? data.matchingPrograms : [];
      console.log("Parsed matchingPrograms for Fallback:", programs);

      return NextResponse.json({
        keywords: userInput
          .toLowerCase()
          .split(/\s+/)
          .filter((word) => word.length > 3 && !["want", "like", "interested"].includes(word))
          .slice(0, 5)
          .map((word) => ({ keyword: word, weight: 1.0 })),
        recommendation: "Based on your input, we recommend checking out these programs at Tilburg University.",
        explanation: "I understood your interests and recommend these programs based on your goals.",
      });
    } catch (fallbackErr) {
      console.error("Fallback error:", fallbackErr);
      return NextResponse.json({ error: "Failed to process input with Claude API and fallback" }, { status: 500 });
    }
  } finally {
    console.timeEnd("Claude Processing");
  }
}