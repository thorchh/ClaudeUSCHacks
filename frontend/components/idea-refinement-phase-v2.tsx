"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Brain, Lightbulb, Sparkles, MessageSquare, ThumbsDown } from "lucide-react"
import PoweredByBadge from "@/components/powered-by-badge"
import VariantComparisonCard from "@/components/variant-comparison-card"
import FeasibilityRadarChart from "@/components/feasibility-radar-chart"

interface IdeaRefinementPhaseV2Props {
  idea: string
  onComplete: (selectedIdea: string) => void
}

interface Feasibility {
  technical: number
  market: number
  novelty: number
}

interface IdeaVariant {
  id: string
  content: string
  pushback: string
  feasibility: Feasibility
  risks: string
  tags: string[]
  framework: string
}

export default function IdeaRefinementPhaseV2({ idea, onComplete }: IdeaRefinementPhaseV2Props) {
  const [activeTab, setActiveTab] = useState("problem")
  const [progress, setProgress] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [coreProblem, setCoreProblem] = useState("")
  const [keyThemes, setKeyThemes] = useState<string[]>([])
  const [ideaVariants, setIdeaVariants] = useState<IdeaVariant[]>([])
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [isGeneratingVariants, setIsGeneratingVariants] = useState(false)

  // Initialize the component
  useEffect(() => {
    // Simulate analysis progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setIsAnalyzing(false)
            generateCoreProblem()
            generateKeyThemes()
          }, 500)
          return 100
        }
        return prev + 5
      })
    }, 100)

    return () => clearInterval(interval)
  }, [])

  const generateCoreProblem = () => {
    setCoreProblem(
      "Users need a centralized system to collect, organize, and prioritize feedback from multiple channels to ensure important insights aren't missed and can be acted upon efficiently.",
    )
  }

  const generateKeyThemes = () => {
    setKeyThemes(["Centralization", "Prioritization", "Integration", "Automation", "User Experience"])
  }

  const handleGenerateVariants = () => {
    setActiveTab("variants")
    setIsGeneratingVariants(true)

    // Simulate variant generation
    setTimeout(() => {
      generateVariants()
      setIsGeneratingVariants(false)
    }, 2000)
  }

  const generateVariants = () => {
    const variants: IdeaVariant[] = [
      {
        id: "variant-1",
        content:
          "A browser extension that automatically captures feedback from multiple platforms and centralizes it in a smart inbox with AI-powered prioritization",
        pushback: "Browser extensions have limited capabilities on mobile devices",
        feasibility: {
          technical: 85,
          market: 90,
          novelty: 75,
        },
        risks: "API rate limits, browser compatibility issues, and maintaining updates across browser versions",
        tags: ["browser-extension", "ai-prioritization", "cross-platform"],
        framework: "SCAMPER",
      },
      {
        id: "variant-2",
        content:
          "A dedicated email address that users can forward or BCC feedback to, which then uses NLP to categorize, tag, and prioritize before presenting in a dashboard",
        pushback: "Email-based solutions can feel disconnected from the original context",
        feasibility: {
          technical: 90,
          market: 80,
          novelty: 65,
        },
        risks: "Email deliverability issues, handling of attachments and formatting, spam filtering",
        tags: ["email-based", "nlp", "dashboard"],
        framework: "First Principles",
      },
      {
        id: "variant-3",
        content:
          "A Slack bot that can be invited to channels and DMs, which monitors for feedback patterns and creates a structured database with reminders and follow-ups",
        pushback: "Slack bots can be perceived as intrusive if not well-designed",
        feasibility: {
          technical: 80,
          market: 85,
          novelty: 70,
        },
        risks: "Slack API limitations, privacy concerns, maintaining context across conversations",
        tags: ["slack-bot", "reminders", "structured-database"],
        framework: "Six Thinking Hats",
      },
      {
        id: "variant-4",
        content:
          "A universal feedback inbox inspired by email clients, but with smart filters, automated tagging, and integration with task management systems",
        pushback: "Universal inboxes can become overwhelming without proper organization",
        feasibility: {
          technical: 75,
          market: 95,
          novelty: 80,
        },
        risks: "Integration complexity, user adoption, competing with established tools",
        tags: ["universal-inbox", "smart-filters", "task-integration"],
        framework: "Cross-Industry Analogies",
      },
      {
        id: "variant-5",
        content:
          "A feedback CRM that treats each piece of feedback like a lead, with pipelines for triage, evaluation, implementation, and follow-up",
        pushback: "CRM systems can be complex and require training for effective use",
        feasibility: {
          technical: 85,
          market: 85,
          novelty: 85,
        },
        risks: "Complexity vs. simplicity balance, CRM feature bloat, adoption barriers",
        tags: ["feedback-crm", "pipeline", "follow-up"],
        framework: "Hybrid Concepts",
      },
    ]

    setIdeaVariants(variants)
  }

  const handleSelectVariant = (variantId: string) => {
    setSelectedVariant(variantId)
  }

  const handleContinue = () => {
    const selected = ideaVariants.find((v) => v.id === selectedVariant)
    if (selected) {
      onComplete(selected.content)
    }
  }

  return (
    <Card className="w-full shadow-xl border-t-4 border-t-primary animate-fade-in relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>

      <CardHeader className="pb-4 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-blue-500 opacity-30"></div>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="rounded-full bg-primary/10 p-2 mr-2">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span>Idea Refinement</span>
              <p className="text-sm font-normal text-muted-foreground">Exploring and improving your concept</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="px-2 py-1 text-xs">
              Phase 1 of 4
            </Badge>
            <PoweredByBadge type="claude" size="sm" />
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {isAnalyzing ? (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center mb-4">
                <div className="p-2 rounded-full bg-primary/10 mr-3">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Analyzing Your Idea</h3>
                  <p className="text-sm text-gray-500">Extracting core concepts and challenges</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary/5 to-blue-500/5 p-4 rounded-lg border border-primary/10 mb-6">
                <p className="text-gray-700">{idea}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">Analysis Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="flex justify-center py-4">
                  <div className="flex space-x-2">
                    <div
                      className="h-2 w-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="h-2 w-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="h-2 w-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="problem">Problem Definition</TabsTrigger>
                <TabsTrigger value="variants">Solution Variants</TabsTrigger>
              </TabsList>

              <TabsContent value="problem" className="space-y-4 pt-4">
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="p-2 rounded-full bg-primary/10 mr-3">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Core Problem</h3>
                      <p className="text-sm text-gray-500">The fundamental challenge your idea addresses</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-primary/5 to-blue-500/5 p-4 rounded-lg border border-primary/10 mb-4">
                    <p className="text-gray-700">{coreProblem}</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Original Idea</h4>
                      <div className="bg-gray-50 p-3 rounded-lg border text-sm text-gray-700">{idea}</div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Key Themes</h4>
                      <div className="flex flex-wrap gap-2">
                        {keyThemes.map((theme, index) => (
                          <Badge key={index} variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 rounded-full bg-amber-100 mt-1">
                          <ThumbsDown className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-amber-800 mb-1">Key Challenges to Address</h4>
                          <ul className="text-sm text-amber-700 space-y-2">
                            <li>• Integration complexity with multiple platforms and their varying APIs</li>
                            <li>• Balancing automation with human judgment in prioritization</li>
                            <li>• Preventing information overload while maintaining comprehensive coverage</li>
                            <li>• Ensuring a consistent experience across devices and platforms</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button
                      onClick={handleGenerateVariants}
                      className="w-full shadow-sm transition-all hover:shadow-md bg-gradient-to-r from-primary to-blue-600"
                    >
                      Generate Solution Variants
                      <Sparkles className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="variants" className="space-y-4 pt-4">
                {isGeneratingVariants ? (
                  <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="p-2 rounded-full bg-primary/10 mr-3">
                        <Sparkles className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">Generating Solution Variants</h3>
                        <p className="text-sm text-gray-500">Applying multiple creativity frameworks</p>
                      </div>
                    </div>

                    <div className="flex justify-center py-12">
                      <div className="flex flex-col items-center">
                        <div className="relative h-16 w-16 mb-4">
                          <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-dashed animate-spin"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Brain className="h-8 w-8 text-primary" />
                          </div>
                        </div>
                        <p className="text-gray-700 mb-2">Generating creative solutions...</p>
                        <div className="flex space-x-2">
                          <div
                            className="h-2 w-2 bg-primary rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          ></div>
                          <div
                            className="h-2 w-2 bg-primary rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          ></div>
                          <div
                            className="h-2 w-2 bg-primary rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                      <div className="flex items-center mb-4">
                        <div className="p-2 rounded-full bg-primary/10 mr-3">
                          <Lightbulb className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">Solution Variants</h3>
                          <p className="text-sm text-gray-500">Select the most promising approach</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {ideaVariants.map((variant) => (
                          <div
                            key={variant.id}
                            className={`border rounded-lg transition-all hover:shadow-md cursor-pointer ${
                              selectedVariant === variant.id
                                ? "border-primary bg-primary/5 shadow-md"
                                : "hover:border-primary/30 hover:bg-primary/5"
                            }`}
                            onClick={() => handleSelectVariant(variant.id)}
                          >
                            <div className="p-4">
                              <div className="flex justify-between items-start mb-3">
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    variant.framework === "SCAMPER"
                                      ? "text-blue-600 bg-blue-50 border-blue-200"
                                      : variant.framework === "First Principles"
                                        ? "text-green-600 bg-green-50 border-green-200"
                                        : variant.framework === "Six Thinking Hats"
                                          ? "text-amber-600 bg-amber-50 border-amber-200"
                                          : variant.framework === "Cross-Industry Analogies"
                                            ? "text-purple-600 bg-purple-50 border-purple-200"
                                            : "text-indigo-600 bg-indigo-50 border-indigo-200"
                                  }`}
                                >
                                  {variant.framework}
                                </Badge>
                                {selectedVariant === variant.id && (
                                  <Badge className="bg-primary text-white">Selected</Badge>
                                )}
                              </div>

                              <h4 className="text-base font-medium mb-3">{variant.content}</h4>

                              <div className="bg-amber-50 border border-amber-100 rounded-md p-3 text-sm text-amber-800 mb-4">
                                <div className="flex items-center mb-1">
                                  <ThumbsDown className="h-3.5 w-3.5 mr-1.5 text-amber-600" />
                                  <span className="font-medium">Key Challenge:</span>
                                </div>
                                {variant.pushback}
                              </div>

                              <div className="space-y-3">
                                <h5 className="text-sm font-medium">Feasibility Assessment</h5>
                                <div className="grid grid-cols-3 gap-3">
                                  <div>
                                    <div className="flex justify-between text-xs mb-1">
                                      <span>Technical</span>
                                      <span className="font-medium">{variant.feasibility.technical}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full ${
                                          variant.feasibility.technical >= 85
                                            ? "bg-green-500"
                                            : variant.feasibility.technical >= 70
                                              ? "bg-amber-500"
                                              : "bg-red-500"
                                        }`}
                                        style={{ width: `${variant.feasibility.technical}%` }}
                                      ></div>
                                    </div>
                                  </div>

                                  <div>
                                    <div className="flex justify-between text-xs mb-1">
                                      <span>Market</span>
                                      <span className="font-medium">{variant.feasibility.market}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full ${
                                          variant.feasibility.market >= 85
                                            ? "bg-green-500"
                                            : variant.feasibility.market >= 70
                                              ? "bg-amber-500"
                                              : "bg-red-500"
                                        }`}
                                        style={{ width: `${variant.feasibility.market}%` }}
                                      ></div>
                                    </div>
                                  </div>

                                  <div>
                                    <div className="flex justify-between text-xs mb-1">
                                      <span>Novelty</span>
                                      <span className="font-medium">{variant.feasibility.novelty}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full ${
                                          variant.feasibility.novelty >= 85
                                            ? "bg-green-500"
                                            : variant.feasibility.novelty >= 70
                                              ? "bg-amber-500"
                                              : "bg-red-500"
                                        }`}
                                        style={{ width: `${variant.feasibility.novelty}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <VariantComparisonCard
                          variants={ideaVariants}
                          selectedVariant={selectedVariant}
                          onSelectVariant={handleSelectVariant}
                        />
                        <FeasibilityRadarChart variants={ideaVariants} selectedVariant={selectedVariant} />
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col space-y-4 pt-2">
        {!isAnalyzing && selectedVariant && (
          <Button
            onClick={handleContinue}
            className="w-full shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 bg-gradient-to-r from-primary to-blue-600"
          >
            Continue to Deep Research Phase
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
