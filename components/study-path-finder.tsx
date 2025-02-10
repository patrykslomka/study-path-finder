"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, Loader2, Search, Sparkles, Target, ArrowLeft, Download, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ProgramResults } from "./program-results"
import type { Program } from "@/types/program"

const GUIDED_QUESTIONS = [
  {
    id: "interest",
    question: "What field interests you the most?",
    weight: 0.4,
    options: [
      { id: "business", label: "Business & Entrepreneurship", keywords: ["business", "entrepreneurship", "economics"] },
      { id: "ai", label: "Artificial Intelligence", keywords: ["artificial intelligence", "cognitive science"] },
      { id: "data", label: "Data Science", keywords: ["data science", "statistics", "analytics"] },
      { id: "cybersecurity", label: "Cybersecurity", keywords: ["cybersecurity", "information security"] },
      { id: "software", label: "Software Development", keywords: ["software development", "programming"] },
      { id: "law", label: "Law & Governance", keywords: ["law", "governance", "global law"] },
      {
        id: "social",
        label: "Social Sciences & Society",
        keywords: ["sociology", "social issues", "global management"],
      },
      {
        id: "people",
        label: "People & Organizations",
        keywords: ["human resources", "psychology", "organizational behavior"],
      },
      { id: "culture", label: "Culture & Leisure", keywords: ["digital culture", "leisure studies", "theology"] },
    ],
  },
  {
    id: "career",
    question: "What's your primary career goal?",
    weight: 0.3,
    options: [
      { id: "entrepreneur", label: "Start my own business", keywords: ["entrepreneurship", "business innovation"] },
      {
        id: "corporate",
        label: "Work in a large organization",
        keywords: ["international business", "human resources", "economics"],
      },
      {
        id: "research",
        label: "Conduct research & analyze data",
        keywords: ["econometrics", "cognitive science", "psychology", "data science"],
      },
      { id: "social_impact", label: "Make a social impact", keywords: ["sociology", "global management", "theology"] },
      {
        id: "international",
        label: "Work in international organizations",
        keywords: ["global law", "international business", "international relations"],
      },
      { id: "academia", label: "Pursue academia/PhD", keywords: ["research", "academic", "phd"] },
      {
        id: "creative",
        label: "Create and innovate in media & culture",
        keywords: ["digital culture", "leisure studies"],
      },
    ],
  },
  {
    id: "skills",
    question: "Which skills do you want to develop?",
    weight: 0.2,
    options: [
      {
        id: "analytical",
        label: "Analytical & quantitative skills",
        keywords: ["econometrics", "economics", "data science", "cognitive science"],
      },
      {
        id: "creative",
        label: "Creative & innovative thinking",
        keywords: ["entrepreneurship", "digital culture", "leisure studies"],
      },
      { id: "people", label: "People & communication skills", keywords: ["human resources", "psychology", "theology"] },
      {
        id: "technical",
        label: "Technical & digital skills",
        keywords: ["data science", "artificial intelligence", "digital culture"],
      },
      {
        id: "strategic",
        label: "Decision-making & strategic thinking",
        keywords: ["international business", "economics", "global law", "human resources"],
      },
    ],
  },
  {
    id: "learning",
    question: "What type of learning experience suits you best?",
    weight: 0.1,
    options: [
      {
        id: "theory",
        label: "Theory & research-based learning",
        keywords: ["psychology", "theology", "sociology", "global law", "econometrics"],
      },
      {
        id: "hands_on",
        label: "Hands-on, project-based learning",
        keywords: ["entrepreneurship", "business innovation", "leisure studies"],
      },
      {
        id: "collaborative",
        label: "Collaborative & social learning",
        keywords: ["human resources", "global management", "digital culture"],
      },
      {
        id: "global",
        label: "International & global perspective",
        keywords: ["global law", "international business", "international sociology"],
      },
    ],
  },
]

export function StudyPathFinder() {
  const [activeTab, setActiveTab] = React.useState("guided")
  const [currentStep, setCurrentStep] = React.useState(0)
  const [answers, setAnswers] = React.useState<Record<string, string>>({})
  const [freeformInput, setFreeformInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [matchingPrograms, setMatchingPrograms] = React.useState<Program[]>([])
  const [error, setError] = React.useState<string | null>(null)

  const handleGuidedSubmit = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Combine keywords from selected answers with weights
      const weightedKeywords = GUIDED_QUESTIONS.flatMap((q) => {
        const selectedOption = q.options.find((opt) => opt.id === answers[q.id])
        return selectedOption?.keywords.map((keyword) => ({ keyword, weight: q.weight })) || []
      })

      const response = await fetch("/api/match-programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weightedKeywords }),
      })

      if (!response.ok) throw new Error("Failed to fetch matching programs")

      const data = await response.json()
      setMatchingPrograms(data.matchingPrograms)
      setCurrentStep(GUIDED_QUESTIONS.length)
    } catch (err) {
      setError("An error occurred while finding matching programs. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFreeformSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!freeformInput.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/match-programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput: freeformInput }),
      })

      if (!response.ok) throw new Error("Failed to fetch matching programs")

      const data = await response.json()
      setMatchingPrograms(data.matchingPrograms)
    } catch (err) {
      setError("An error occurred while finding matching programs. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setCurrentStep(0)
    setAnswers({})
    setFreeformInput("")
    setMatchingPrograms([])
    setError(null)
  }

  const saveResults = () => {
    // Implement save functionality (e.g., generate PDF or send email)
    console.log("Saving results...")
  }

  const currentQuestion = GUIDED_QUESTIONS[currentStep]

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Find Your Perfect Study Program</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Discover the ideal bachelor's program at Tilburg University based on your interests, goals, and aspirations
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value)
          resetForm()
        }}
      >
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="guided" className="space-x-2">
            <Target className="w-4 h-4" />
            <span>Guided Search</span>
          </TabsTrigger>
          <TabsTrigger value="freeform" className="space-x-2">
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
                      value={answers[currentQuestion.id]}
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
                          handleGuidedSubmit()
                        } else {
                          setCurrentStep((prev) => prev + 1)
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
                <Button type="submit" className="w-full" disabled={!freeformInput.trim() || isLoading}>
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
        </TabsContent>
      </Tabs>

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
            <h2 className="text-2xl font-bold mb-2">Your Top 3 Recommended Programs</h2>
            <p className="text-muted-foreground">
              Based on your {activeTab === "guided" ? "answers" : "interests"}, here are the top 3 programs that best
              match your profile
            </p>
          </div>
          <ProgramResults programs={matchingPrograms} />
          <div className="mt-6 flex justify-center space-x-4">
            <Button variant="outline" onClick={resetForm}>
              Start Over
            </Button>
            <Button onClick={saveResults}>
              <Download className="mr-2 h-4 w-4" />
              Save Results
            </Button>
            <Button onClick={saveResults}>
              <Mail className="mr-2 h-4 w-4" />
              Email Results
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

