"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Loader2, Search, Target, ArrowLeft, Sparkles } from "lucide-react"; // Removed unused icons

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ProgramResults } from "./program-results";
import type { Program } from "@/types/program";

const GUIDED_QUESTIONS = [
  {
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
  {
    id: "career",
    question: "What's your primary career goal?",
    weight: 0.3,
    options: [
      { id: "entrepreneur", label: "Start my own business", keywords: ["entrepreneurship", "business innovation"] },
      { id: "organization", label: "Work in organizations (business or international)", keywords: ["international business", "human resources", "economics", "global law", "international relations"] },
      { id: "research", label: "Conduct research & analyze data", keywords: ["econometrics", "cognitive science", "psychology", "data science"] },
      { id: "social_impact", label: "Make a social impact", keywords: ["sociology", "global management", "theology"] },
      { id: "creative", label: "Create and innovate in media & culture", keywords: ["digital culture", "leisure studies"] },
    ],
  },
  {
    id: "skills",
    question: "Which skills do you want to develop?",
    weight: 0.2,
    options: [
      { id: "analytical_tech", label: "Analytical & technical skills", keywords: ["econometrics", "economics", "data science", "cognitive science", "artificial intelligence", "statistics", "programming"] },
      { id: "creative", label: "Creative & innovative thinking", keywords: ["entrepreneurship", "digital culture", "leisure studies", "business innovation"] },
      { id: "people", label: "People, communication & leadership skills", keywords: ["human resources", "psychology", "organizational behavior", "leadership"] },
    ],
  },
  {
    id: "learning",
    question: "What type of learning experience suits you best?",
    weight: 0.1,
    options: [
      { id: "theory_practical", label: "Theory & practical learning", keywords: ["psychology", "theology", "sociology", "global law", "econometrics", "entrepreneurship", "business innovation", "leisure studies"] },
      { id: "collaborative", label: "Collaborative & global learning", keywords: ["human resources", "global management", "digital culture", "international business", "international sociology"] },
    ],
  },
];

export function StudyPathFinder() {
  const [activeTab, setActiveTab] = React.useState("guided");
  const [currentStep, setCurrentStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [freeformInput, setFreeformInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [matchingPrograms, setMatchingPrograms] = React.useState<Program[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const handleGuidedSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Combine keywords from selected answers with weights, ensuring all IDs exist
      const weightedKeywords = GUIDED_QUESTIONS.flatMap((q) => {
        const selectedOption = q.options.find((opt) => opt.id === answers[q.id]);
        if (!selectedOption) {
          console.warn(`No option found for ID ${q.id} with value ${answers[q.id]}`);
        }
        return selectedOption?.keywords.map((keyword) => ({ keyword, weight: q.weight })) || [];
      });

      console.log("Weighted Keywords for Guided Search:", weightedKeywords); // Debug log

      if (weightedKeywords.length === 0) {
        throw new Error("No keywords selected for matching");
      }

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
      console.log("API Response for Guided Search:", data); // Debug log
      setMatchingPrograms(data.matchingPrograms || []);
      setCurrentStep(GUIDED_QUESTIONS.length);
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

    try {
      // Step 1: Process with Ollama
      const ollamaResponse = await fetch("/api/ollama-process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput: freeformInput }),
      });

      if (!ollamaResponse.ok) {
        const errorText = await ollamaResponse.text();
        throw new Error(`Failed to process with Ollama: ${ollamaResponse.status} - ${errorText}`);
      }

      const { keywords: weightedKeywords } = await ollamaResponse.json();
      console.log("Weighted Keywords from Ollama:", weightedKeywords); // Debug log

      // Step 2: Pass to match-programs API
      const matchResponse = await fetch("/api/match-programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weightedKeywords }),
      });

      if (!matchResponse.ok) {
        const errorText = await matchResponse.text();
        throw new Error(`Failed to fetch matching programs: ${matchResponse.status} - ${errorText}`);
      }

      const data = await matchResponse.json();
      console.log("API Response for Freeform Search:", data); // Debug log
      setMatchingPrograms(data.matchingPrograms || []);
    } catch (err) {
      // Fallback: Use original string-based matching if Ollama fails
      if (err.message.includes("Failed to process with Ollama")) {
        try {
          const fallbackResponse = await fetch("/api/match-programs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userInput: freeformInput }),
          });

          if (!fallbackResponse.ok) {
            const errorText = await fallbackResponse.text();
            throw new Error(`Fallback failed: ${fallbackResponse.status} - ${errorText}`);
          }

          const data = await fallbackResponse.json();
          console.log("Fallback API Response:", data); // Debug log
          setMatchingPrograms(data.matchingPrograms || []);
        } catch (fallbackErr) {
          setError("An error occurred. Please try again.");
          console.error("Freeform Fallback Error:", fallbackErr);
        }
      } else {
        setError("An error occurred while finding matching programs. Please try again.");
        console.error("Freeform Search Error:", err);
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
  };

  const saveResults = () => {
    // This function is now empty but kept for potential future use
    console.log("Save and email functionality removed for now.");
  };

  const currentQuestion = GUIDED_QUESTIONS[currentStep];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center space-y-4 mb-8">
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
              {currentStep < GUIDED_QUESTIONS.length ? (
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <CardHeader>
                    <CardTitle>{currentQuestion.question}</CardTitle>
                    <CardDescription>
                      Step {currentStep + 1} of {GUIDED_QUESTIONS.length}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress value={((currentStep + 1) / GUIDED_QUESTIONS.length) * 100} className="mb-4" />
                    <RadioGroup
                      value={answers[currentQuestion.id] || ""} // Ensure a default value to prevent rendering issues
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
                        if (currentStep === GUIDED_QUESTIONS.length - 1) {
                          handleGuidedSubmit();
                        } else {
                          setCurrentStep((prev) => prev + 1);
                        }
                      }}
                      disabled={!answers[currentQuestion.id]}
                    >
                      {currentStep === GUIDED_QUESTIONS.length - 1 ? (
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
              ) : null}
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
                    .join(", ") || "your described goals"}, we recommend checking out these programs at Tilburg University:
                  {matchingPrograms.map((program, index) => (
                    <span key={program.name}>
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
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}