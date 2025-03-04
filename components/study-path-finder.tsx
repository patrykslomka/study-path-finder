"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Loader2, Search, Target, ArrowLeft, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ProgramResults } from "./program-results";
import type { Program } from "@/types/program";

const GUIDED_QUESTIONS_BASE = {
  // Base structure for Step 1 (Interest)
  0: {
    id: "interest",
    question: "What field interests you the most?",
    weight: 0.4,
    options: [
      { id: "business", label: "Business & Entrepreneurship", keywords: ["business", "entrepreneurship", "economics"] },
      { id: "technology", label: "Technology (AI, Data, Software)", keywords: ["artificial intelligence", "data science", "statistics", "analytics", "software development", "programming", "cognitive science", "cybersecurity", "information security"] },
      { id: "law", label: "Law & Governance", keywords: ["law", "governance", "global law"] },
      { id: "social", label: "Social Sciences & Impact", keywords: ["sociology", "social issues", "global management", "psychology", "human resources", "organizational behavior"] },
      { id: "culture", label: "Culture, Media & Leisure", keywords: ["digital culture", "leisure studies", "theology", "media studies"] },
    ],
  },
};

const DYNAMIC_OPTIONS = {
  // Step 2 (Career) based on Step 1 (Interest)
  career: {
    business: [
      { id: "startup", label: "Start my own business", keywords: ["entrepreneurship", "business innovation"] },
      { id: "organization", label: "Work in a large corporation", keywords: ["international business", "management", "economics"] },
      { id: "consulting", label: "Work as a business consultant", keywords: ["business strategy", "consulting", "finance"] },
    ],
    technology: [
      { id: "tech_dev", label: "Develop technology (AI, Data, Software)", keywords: ["artificial intelligence", "data science", "programming"] },
      { id: "research", label: "Conduct tech research", keywords: ["cognitive science", "machine learning", "research"] },
      { id: "startup_tech", label: "Work in a tech startup", keywords: ["tech innovation", "startup", "software development"] },
    ],
    law: [
      { id: "law_firm", label: "Work in a law firm", keywords: ["law", "legal practice", "corporate law"] },
      { id: "large_org", label: "Work in a large organization", keywords: ["global law", "governance", "international law"] },
      { id: "startup_law", label: "Work in a startup with legal focus", keywords: ["law", "startup", "legal innovation"] },
    ],
    social: [
      { id: "social_impact", label: "Make a social impact", keywords: ["sociology", "global management", "social issues"] },
      { id: "org_behavior", label: "Work in organizational behavior", keywords: ["human resources", "organizational behavior", "psychology"] },
      { id: "policy", label: "Develop social policies", keywords: ["social policy", "research", "human rights"] },
    ],
    culture: [
      { id: "media_creative", label: "Create in media or culture", keywords: ["digital culture", "media studies", "cultural innovation"] },
      { id: "leisure", label: "Work in leisure or tourism", keywords: ["leisure studies", "tourism management", "cultural events"] },
      { id: "theology", label: "Work in religious studies", keywords: ["theology", "spirituality", "interfaith dialogue"] },
    ],
  },

  // Step 3 (Skills) based on Step 2 (Career), grouped by interest
  skills: {
    business: {
      startup: [
        { id: "innovative", label: "Innovative & entrepreneurial skills", keywords: ["innovative thinking", "business planning", "risk management"] },
        { id: "leadership", label: "Leadership & networking skills", keywords: ["leadership", "networking", "communication"] },
        { id: "financial", label: "Financial & strategic skills", keywords: ["financial acumen", "strategic planning", "market analysis"] },
      ],
      organization: [
        { id: "strategic", label: "Strategic & managerial skills", keywords: ["strategic thinking", "management", "leadership"] },
        { id: "analytical", label: "Analytical & data skills", keywords: ["data analysis", "analytical skills", "research skills"] },
        { id: "cross_cultural", label: "Cross-cultural communication", keywords: ["cross-cultural communication", "global strategy", "team collaboration"] },
      ],
      consulting: [
        { id: "analytical", label: "Analytical & problem-solving skills", keywords: ["analytical skills", "problem solving", "research skills"] },
        { id: "strategic", label: "Strategic & consulting skills", keywords: ["strategic planning", "consulting", "business strategy"] },
        { id: "communication", label: "Communication & presentation skills", keywords: ["communication", "public speaking", "pitch development"] },
      ],
    },
    technology: {
      tech_dev: [
        { id: "technical", label: "Technical & programming skills", keywords: ["programming", "software development", "machine learning"] },
        { id: "data", label: "Data analysis & AI skills", keywords: ["data science", "artificial intelligence", "data analysis"] },
        { id: "problem_solving", label: "Problem-solving & innovation", keywords: ["problem solving", "tech innovation", "creative thinking"] },
      ],
      research: [
        { id: "research", label: "Research & analytical skills", keywords: ["research skills", "data analysis", "cognitive science"] },
        { id: "tech", label: "Technical & AI skills", keywords: ["artificial intelligence", "programming", "machine learning"] },
        { id: "critical", label: "Critical thinking & innovation", keywords: ["critical thinking", "tech innovation", "problem solving"] },
      ],
      startup_tech: [
        { id: "innovative", label: "Innovative & tech skills", keywords: ["tech innovation", "programming", "startup development"] },
        { id: "entrepreneurial", label: "Entrepreneurial & leadership skills", keywords: ["entrepreneurship", "leadership", "business planning"] },
        { id: "data", label: "Data & AI skills", keywords: ["data science", "artificial intelligence", "analytics"] },
      ],
    },
    law: [
      { id: "legal", label: "Legal analysis & drafting skills", keywords: ["legal analysis", "contract drafting", "legal research"] },
      { id: "negotiation", label: "Negotiation & advocacy skills", keywords: ["negotiation", "advocacy", "conflict resolution"] },
      { id: "communication", label: "Cross-cultural & communication skills", keywords: ["cross-cultural communication", "public speaking", "policy development"] },
    ],
    social: {
      social_impact: [
        { id: "social", label: "Social innovation & policy skills", keywords: ["social innovation", "social policy", "ethical decision making"] },
        { id: "cultural", label: "Cultural sensitivity & leadership", keywords: ["cultural sensitivity", "leadership", "community engagement"] },
        { id: "research", label: "Research & analytical skills", keywords: ["research skills", "data interpretation", "social analysis"] },
      ],
      org_behavior: [
        { id: "behavioral", label: "Behavioral & HR skills", keywords: ["organizational behavior", "human resources", "team collaboration"] },
        { id: "leadership", label: "Leadership & communication", keywords: ["leadership", "communication", "problem solving"] },
        { id: "analytical", label: "Analytical & strategic skills", keywords: ["analytical skills", "strategic planning", "data analysis"] },
      ],
      policy: [
        { id: "policy", label: "Policy development & research skills", keywords: ["policy analysis", "research skills", "social policy"] },
        { id: "ethical", label: "Ethical & leadership skills", keywords: ["ethical decision making", "leadership", "advocacy"] },
        { id: "communication", label: "Communication & advocacy skills", keywords: ["communication", "public speaking", "community engagement"] },
      ],
    },
    culture: {
      media_creative: [
        { id: "creative", label: "Creative & media skills", keywords: ["creative design", "media analysis", "digital storytelling"] },
        { id: "tech", label: "Digital & tech skills", keywords: ["digital media", "tech culture", "programming"] },
        { id: "communication", label: "Communication & cultural skills", keywords: ["communication", "cultural awareness", "storytelling"] },
      ],
      leisure: [
        { id: "management", label: "Leisure & event management skills", keywords: ["event planning", "tourism management", "project management"] },
        { id: "creative", label: "Creative & cultural skills", keywords: ["cultural programming", "creativity", "cultural sensitivity"] },
        { id: "marketing", label: "Marketing & strategic skills", keywords: ["tourism marketing", "strategic planning", "customer experience"] },
      ],
      theology: [
        { id: "theological", label: "Theological & ethical skills", keywords: ["theology", "ethics", "religious philosophy"] },
        { id: "communication", label: "Interfaith & communication skills", keywords: ["interfaith dialogue", "communication", "public speaking"] },
        { id: "pastoral", label: "Pastoral & leadership skills", keywords: ["pastoral care", "leadership", "community leadership"] },
      ],
    },
  },
};

export function StudyPathFinder() {
  const [activeTab, setActiveTab] = React.useState("guided");
  const [currentStep, setCurrentStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [freeformInput, setFreeformInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [matchingPrograms, setMatchingPrograms] = React.useState<Program[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [aiExplanation, setAiExplanation] = React.useState<string>("");

  // Dynamically generate GUIDED_QUESTIONS based on answers
  const getDynamicQuestions = () => {
    const questions = { ...GUIDED_QUESTIONS_BASE };
    const interest = answers.interest;

    // Step 2: Career (depends on Step 1: Interest)
    if (interest) {
      questions[1] = {
        id: "career",
        question: "What's your primary career goal?",
        weight: 0.3,
        options: DYNAMIC_OPTIONS.career[interest] || DYNAMIC_OPTIONS.career.business, // Default to business if no match
      };
    }

    // Step 3: Skills (depends on Step 1: Interest and Step 2: Career)
    const career = answers.career;
    if (interest && career) {
      questions[2] = {
        id: "skills",
        question: "Which skills do you want to develop?",
        weight: 0.2,
        options:
          DYNAMIC_OPTIONS.skills[interest]?.[career] ||
          DYNAMIC_OPTIONS.skills.business.organization, // Default to business organization skills if no match
      };
    }

    // Step 4: Learning (depends on Step 1: Interest, optional for simplicity, can be dynamic if needed)
    if (interest) {
      questions[3] = {
        id: "learning",
        question: "What type of learning experience suits you best?",
        weight: 0.1,
        options: [
          { id: "theory_practical", label: "Theory & practical learning", keywords: [`${interest}_theory_practical`] },
          { id: "collaborative", label: "Collaborative & global learning", keywords: [`${interest}_collaborative`] },
        ],
      };
    }

    return questions;
  };

  const GUIDED_QUESTIONS = getDynamicQuestions();

  const handleGuidedSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Combine keywords from selected answers with weights
      const weightedKeywords = Object.entries(answers)
        .map(([questionId, answerId]) => {
          const question = Object.values(GUIDED_QUESTIONS).find((q) => q.id === questionId);
          if (!question) return [];

          const selectedOption = question.options.find((opt) => opt.id === answerId);
          if (!selectedOption) {
            console.warn(`No option found for ID ${questionId} with value ${answerId}`);
            return [];
          }
          return selectedOption.keywords.map((keyword) => ({ keyword, weight: question.weight }));
        })
        .flat();

      console.log("Weighted Keywords for Guided Search:", weightedKeywords);

      if (weightedKeywords.length === 0) {
        throw new Error("No keywords selected for matching");
      }

      // Fetch matching programs
      const response = await fetch("/api/match-programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weightedKeywords }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch matching programs: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("API Response for Guided Search:", data);

      const programs = Array.isArray(data.matchingPrograms) ? data.matchingPrograms : [];
      console.log("Parsed matchingPrograms for Guided Search:", programs);

      setMatchingPrograms(programs);
      setCurrentStep(Object.keys(GUIDED_QUESTIONS).length);
    } catch (err) {
      setError(`An error occurred while finding matching programs: ${err.message}`);
      console.error("Guided Search Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFreeformSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!freeformInput.trim()) return;

    setIsLoading(true);
    setError(null);
    setAiExplanation(""); // Reset explanation

    try {
      console.time("Freeform Search Processing");
      const ollamaResponse = await fetch("/api/ollama-process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput: freeformInput }),
        timeout: 120000, // 120-second timeout for llama3.2
      });

      if (!ollamaResponse.ok) {
        throw new Error(`Failed to process with Ollama: ${ollamaResponse.status}`);
      }

      const data = await ollamaResponse.json();
      console.log("Ollama Response for Freeform Search:", data);

      let weightedKeywords;
      let recommendation;
      let explanation;
      if ("keywords" in data && "recommendation" in data && "explanation" in data) {
        weightedKeywords = data.keywords;
        recommendation = data.recommendation;
        explanation = data.explanation;
      } else {
        throw new Error("Invalid Ollama response format");
      }

      console.log("Weighted Keywords from Ollama:", weightedKeywords);

      // Step 2: Pass to match-programs API
      const matchResponse = await fetch("/api/match-programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weightedKeywords }),
        timeout: 120000,
      });

      if (!matchResponse.ok) {
        const errorText = await matchResponse.text();
        throw new Error(`Failed to fetch matching programs: ${matchResponse.status} - ${errorText}`);
      }

      const matchData = await matchResponse.json();
      console.log("API Response for Freeform Search:", matchData);

      const programs = Array.isArray(matchData.matchingPrograms) ? matchData.matchingPrograms : [];
      console.log("Parsed matchingPrograms for Freeform Search:", programs);

      setMatchingPrograms(programs);
      setAiExplanation(explanation || "I understood your interests and recommend these programs based on your goals.");
      console.timeEnd("Freeform Search Processing");
    } catch (err) {
      console.error("Freeform Search Error:", err);
      // Fallback: Use string-based matching if Ollama fails
      try {
        const fallbackResponse = await fetch("/api/match-programs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userInput: freeformInput }),
          timeout: 120000,
        });

        if (!fallbackResponse.ok) {
          const errorText = await fallbackResponse.text();
          throw new Error(`Fallback failed: ${fallbackResponse.status} - ${errorText}`);
        }

        const data = await fallbackResponse.json();
        console.log("Fallback API Response:", data);

        const programs = Array.isArray(data.matchingPrograms) ? data.matchingPrograms : [];
        console.log("Parsed matchingPrograms for Fallback:", programs);

        // Generate AI explanation for the fallback case
        const programNames = programs.map((program) => program.name).join(", ");
        const ollamaHost = process.env.OLLAMA_HOST || "http://localhost:11434";
        const explanationResponse = await fetch("/api/ollama-process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userInput: `Student's input: ${freeformInput}. Recommended programs: ${programNames}.`,
          }),
          timeout: 120000,
        });

        let explanation = "I understood your interests and recommend these programs based on your goals.";
        if (explanationResponse.ok) {
          const explanationData = await explanationResponse.json();
          explanation = explanationData.explanation || explanation;
        }

        setMatchingPrograms(programs);
        setAiExplanation(explanation);
      } catch (fallbackErr) {
        setError("An error occurred. Please try again.");
        console.error("Freeform Fallback Error:", fallbackErr);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(0);
    setAnswers({});
    setFreeformInput("");
    setMatchingPrograms([]);
    setError(null);
    setAiExplanation("");
  };

  const currentQuestion = GUIDED_QUESTIONS[currentStep];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center space-y-4 mb-8">
        <img src="/logo-tilburg.png" alt="Tilburg University Logo" className="mx-auto w-32 h-auto mb-4" />
        <h1 className="text-4xl font-bold tracking-tight">Find Your Study Path</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Discover the perfect bachelor's program at Tilburg University based on your interests and goals
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value);
          resetForm();
        }}
      >
        <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100 rounded-full p-1">
          <TabsTrigger value="guided" className="flex items-center space-x-2 p-2 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-md">
            <Target className="w-4 h-4" />
            <span>Guided Search</span>
          </TabsTrigger>
          <TabsTrigger value="freeform" className="flex items-center space-x-2 p-2 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-md">
            <Search className="w-4 h-4" />
            <span>Free Search</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="guided">
          <Card>
            <AnimatePresence mode="wait">
              {currentStep < Object.keys(GUIDED_QUESTIONS).length ? (
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <CardHeader>
                    <CardTitle>{currentQuestion.question}</CardTitle>
                    <CardDescription>
                      Step {currentStep + 1} of {Object.keys(GUIDED_QUESTIONS).length}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress value={((currentStep + 1) / Object.keys(GUIDED_QUESTIONS).length) * 100} className="mb-4" />
                    <RadioGroup
                      value={answers[currentQuestion.id] || ""}
                      onValueChange={(value) => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }))}
                    >
                      <div className="space-y-3">
                        {currentQuestion.options.map((option) => (
                          <div key={option.id} className="flex items-center space-x-2">
                            <RadioGroupItem value={option.id} id={option.id} />
                            <Label htmlFor={option.id} className="cursor-pointer">
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep((prev) => prev - 1)}
                      disabled={currentStep === 0}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      onClick={() => {
                        if (currentStep === Object.keys(GUIDED_QUESTIONS).length - 1) {
                          handleGuidedSubmit();
                        } else {
                          setCurrentStep((prev) => prev + 1);
                        }
                      }}
                      disabled={!answers[currentQuestion.id]}
                    >
                      {currentStep === Object.keys(GUIDED_QUESTIONS).length - 1 ? (
                        <span className="flex items-center">
                          Find Programs
                          <Sparkles className="ml-2 h-4 w-4" />
                        </span>
                      ) : (
                        <span className="flex items-center">
                          Next
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </span>
                      )}
                    </Button>
                  </CardFooter>
                </motion.div>
              ) : (
                matchingPrograms.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6"
                  >
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold mb-2">Our Recommendations for You</h2>
                      <p className="text-muted-foreground max-w-2xl mx-auto">
                        Based on your interests in{" "}
                        {Object.entries(answers)
                          .map(([_, answerId]) => {
                            const question = Object.values(GUIDED_QUESTIONS).find((q) => q.options.some((opt) => opt.id === answerId));
                            const option = question?.options.find((opt) => opt.id === answerId);
                            return option?.keywords || [];
                          })
                          .flat()
                          .filter((word, index, self) => self.indexOf(word) === index) // Remove duplicates
                          .slice(0, 3)
                          .join(", ") || "your described goals"}
                        , we recommend checking out these programs at Tilburg University:
                        {matchingPrograms.map((program, index) => (
                          <span key={program.name} className="inline-block">
                            {index === 0 ? " " : ", "}
                            <strong>{program.name}</strong>
                          </span>
                        ))}
                        .
                      </p>
                    </div>
                    <ProgramResults programs={matchingPrograms} />
                    <div className="mt-6 flex justify-center">
                      <Button variant="outline" onClick={resetForm}>
                        Start Over
                      </Button>
                    </div>
                  </motion.div>
                )
              )}
            </AnimatePresence>
          </Card>
        </TabsContent>

        <TabsContent value="freeform">
          <Card>
            <CardHeader>
              <CardTitle>Tell us about your interests</CardTitle>
              <CardDescription>
                Describe your interests, career goals, and the skills you'd like to develop
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFreeformSubmit} className="space-y-4">
                <Textarea
                  placeholder="For example: I'm interested in technology and innovation, and I'd like to learn how to analyze data to solve business problems..."
                  value={freeformInput}
                  onChange={(e) => setFreeformInput(e.target.value)}
                  className="min-h-[150px]"
                />
                <Button type="submit" className="w-full" disabled={!freeformInput.trim()}>
                  {isLoading ? (
                    <span className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Finding Programs...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      Find Matching Programs
                      <Sparkles className="ml-2 h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
          {error && <div className="mt-8 text-center text-red-500">{error}</div>}

          {isLoading && (
            <div className="mt-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Finding the best programs for you...</p>
            </div>
          )}

          {matchingPrograms.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Our Recommendations for You</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Based on your interests in{" "}
                  {freeformInput
                    .split(/\s+/)
                    .filter((word) => word.length > 0 && !["i", "my", "me", "want", "like"].includes(word.toLowerCase()))
                    .slice(0, 3)
                    .join(", ") || "your described goals"}
                  , we recommend checking out these programs at Tilburg University:
                  {matchingPrograms.map((program, index) => (
                    <span key={program.name}>
                      {index === 0 ? " " : ", "}
                      <strong>{program.name}</strong>
                    </span>
                  ))}
                  .
                </p>
                <p className="text-muted-foreground max-w-2xl mx-auto mt-2 italic">{aiExplanation}</p>
              </div>
              <ProgramResults programs={matchingPrograms} />
              <div className="mt-6 flex justify-center">
                <Button variant="outline" onClick={resetForm}>
                  Start Over
                </Button>
              </div>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}