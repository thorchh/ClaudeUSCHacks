"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Brain, Sparkles, ArrowDown, Lightbulb, Zap } from "lucide-react"
import Link from "next/link"
import IdeaRefinementPhase from "@/components/idea-refinement-phase"
import ResearchPhase from "@/components/research-phase"
import AgentDebate from "@/components/agent-debate"
import FinalReport from "@/components/final-report"
import PhaseIndicator from "@/components/phase-indicator"
import PoweredByBadge from "@/components/powered-by-badge"

export default function BrainstormPage() {
  const [activePhase, setActivePhase] = useState<string>("chat")
  const [progress, setProgress] = useState<number>(0)
  const [idea, setIdea] = useState<string>("")
  const [refinedIdea, setRefinedIdea] = useState<string>("")
  const [isStarted, setIsStarted] = useState<boolean>(false)
  const [showPlaceholder, setShowPlaceholder] = useState<boolean>(true)

  const startBrainstorming = () => {
    if (idea.trim().length > 0) {
      setIsStarted(true)
      setProgress(5)
    }
  }

  const moveToNextPhase = (selectedIdea: string) => {
    setRefinedIdea(selectedIdea)
    setActivePhase("research")
    setProgress(50)
  }

  const moveToDebatePhase = () => {
    setActivePhase("debate")
    setProgress(75)
  }

  const moveToReportPhase = () => {
    setActivePhase("report")
    setProgress(100)
  }

  const handleTextareaFocus = () => {
    setShowPlaceholder(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background to-accent/5">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative w-8 h-8 flex items-center justify-center">
                <div className="absolute inset-0 bg-primary rounded-full opacity-20 animate-pulse-slow"></div>
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <span className="font-bold text-xl">deepBrainstormAI</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center space-x-4">
            {isStarted && (
              <div className="w-full max-w-md">
                <Progress value={progress} className="h-2 progress-bar-animated" />
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {isStarted && (
              <div className="hidden md:flex items-center space-x-2">
                <PhaseIndicator
                  phase="chat"
                  label="Idea Refinement"
                  number={1}
                  isActive={activePhase === "chat"}
                  icon={<Lightbulb className="h-3.5 w-3.5" />}
                />
                <PhaseIndicator phase="research" label="Research" number={2} isActive={activePhase === "research"} />
                <PhaseIndicator phase="debate" label="Debate" number={3} isActive={activePhase === "debate"} />
                <PhaseIndicator phase="report" label="Report" number={4} isActive={activePhase === "report"} />
              </div>
            )}
            <Button variant="ghost" size="icon">
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6">
        {!isStarted ? (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="text-center mb-8 space-y-3">
              <Badge
                variant="outline"
                className="px-3 py-1 rounded-full border-primary/20 bg-primary/10 text-primary mx-auto"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                <span>AI-Powered Brainstorming</span>
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Transform Your <span className="gradient-text">Ideas</span> into{" "}
                <span className="gradient-text">Insights</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Let our AI orchestrate a deep exploration of your concept through multiple perspectives and disciplines
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/10 rounded-3xl blur-3xl opacity-30"></div>

              <Card className="shadow-2xl border-0 bg-gradient-to-b from-background to-background/80 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 via-purple-500/40 to-blue-500/40"></div>

                <CardHeader className="space-y-1 pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded-full bg-primary/10">
                        <Lightbulb className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-2xl">Begin Your Deep Brainstorm</CardTitle>
                    </div>
                    <PoweredByBadge type="claude" />
                  </div>
                  <CardDescription className="text-base">
                    Share your concept and watch as our AI orchestrates a comprehensive exploration
                  </CardDescription>
                </CardHeader>

                <CardContent className="pb-2">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-xl overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 animate-gradient-flow"></div>
                    </div>

                    <div className="relative rounded-xl border border-primary/10 shadow-lg overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-blue-500 opacity-30"></div>

                      <div className="p-1 bg-black/5">
                        <div className="flex space-x-1.5 px-2 py-1">
                          <div className="w-3 h-3 rounded-full bg-red-500/30"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500/30"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500/30"></div>
                        </div>
                      </div>

                      <div className="relative">
                        {showPlaceholder && (
                          <div className="absolute inset-0 flex flex-col justify-center px-6 py-4 pointer-events-none">
                            <div className="flex items-center text-muted-foreground mb-2">
                              <Zap className="h-4 w-4 mr-2 text-primary" />
                              <span className="text-sm font-medium">Start typing your idea...</span>
                            </div>
                            <p className="text-muted-foreground/70 text-sm">
                              This is a freewriting space. Share any idea that comes to mind, no matter how rough or
                              unpolished.
                            </p>
                          </div>
                        )}

                        <Textarea
                          placeholder=""
                          className="min-h-[200px] resize-none transition-all focus:shadow-md border-0 rounded-none bg-transparent focus:ring-0 text-lg"
                          value={idea}
                          onChange={(e) => setIdea(e.target.value)}
                          onFocus={handleTextareaFocus}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center mt-6">
                    <div className="animate-bounce">
                      <ArrowDown className="h-6 w-6 text-primary/50" />
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-2">
                  <Button
                    onClick={startBrainstorming}
                    disabled={idea.trim().length === 0}
                    className="w-full py-6 text-lg shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 bg-gradient-to-r from-primary to-primary/90"
                  >
                    Begin Deep Exploration
                    <Brain className="ml-2 h-5 w-5" />
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="mt-8 text-center">
              <div className="inline-flex items-center space-x-2 text-sm text-muted-foreground">
                <span>Powered by advanced multi-agent AI technology</span>
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <Tabs value={activePhase} className="w-full">
              <TabsContent value="chat" className="mt-0">
                <IdeaRefinementPhase idea={idea} onComplete={moveToNextPhase} />
              </TabsContent>
              <TabsContent value="research" className="mt-0">
                <ResearchPhase idea={refinedIdea || idea} onComplete={moveToDebatePhase} />
              </TabsContent>
              <TabsContent value="debate" className="mt-0">
                <AgentDebate idea={refinedIdea || idea} onComplete={moveToReportPhase} />
              </TabsContent>
              <TabsContent value="report" className="mt-0">
                <FinalReport
                  idea={refinedIdea || idea}
                  onRestart={() => {
                    setIdea("")
                    setRefinedIdea("")
                    setIsStarted(false)
                    setActivePhase("chat")
                    setProgress(0)
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>

      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="relative w-6 h-6 flex items-center justify-center">
              <div className="absolute inset-0 bg-primary rounded-full opacity-20"></div>
              <Brain className="h-4 w-4 text-primary" />
            </div>
            <p className="text-center text-sm leading-loose text-gray-500 md:text-left">
              © 2025 deepBrainstormAI. All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Made with</span>
            <PoweredByBadge type="claude-3.7" size="sm" />
          </div>
        </div>
      </footer>
    </div>
  )
}
