"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Brain, CheckCircle2, Lightbulb, Users, BarChart3, Globe2, Swords, Shuffle, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import PoweredByBadge from "@/components/powered-by-badge"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"

// Define action types for the research API
type ResearchAction = "run_agent" | "get_summary"

// Define payload structures (adjust as needed)
interface RunAgentPayload {
  selected_idea: string
  agent_name: string
  combined_context: any
  round_num: number
}

interface GetSummaryPayload {
  research_results: Record<string, any[]>
  selected_idea: string
}

const RESEARCH_AGENTS = [
  { id: "user_psychology", name: "User Psychology", color: "purple", specialization: "Analyzing user behavior and feedback management patterns", icon: <Brain className="h-5 w-5" /> },
  { id: "business_value", name: "Business Value", color: "blue", specialization: "Evaluating economic impact of effective feedback management", icon: <BarChart3 className="h-5 w-5" /> },
  { id: "market_research", name: "Market Research", color: "green", specialization: "Identifying target audience and competitive landscape", icon: <Globe2 className="h-5 w-5" /> },
  { id: "integration_tech", name: "Integration Tech", color: "indigo", specialization: "Assessing technical feasibility of multi-platform integration", icon: <ArrowRight className="h-5 w-5" /> },
  { id: "future_trends", name: "Future Trends", color: "amber", specialization: "Analyzing future of feedback management and AI prioritization", icon: <Lightbulb className="h-5 w-5" /> },
  { id: "market_intelligence", name: "Market Intelligence", color: "emerald", specialization: "Gathering data on market conditions", icon: <Users className="h-5 w-5" /> },
  { id: "competitive_analysis", name: "Competitive Analysis", color: "cyan", specialization: "Analyzing competitor strategies and products", icon: <Swords className="h-5 w-5" /> },
  { id: "analogical_synthesis", name: "Analogical Synthesis", color: "pink", specialization: "Drawing parallels from unrelated domains", icon: <Shuffle className="h-5 w-5" /> },
  { id: "contrarian_research", name: "Contrarian Research", color: "red", specialization: "Challenging assumptions and exploring alternatives", icon: <AlertTriangle className="h-5 w-5" /> },
]

interface ResearchPhaseProps {
  idea: string
  onCompleteAction: (researchSummary: string) => void
  combinedContext: any
}

// Add interface for the insight object
interface LatestInsight {
  id: string // Unique ID for the insight
  agentId: string
  agentName: string
  agentColor: string
  content: string
  timestamp: number
}

// Helper to robustly parse insights (array, string, or stringified array)
function parseInsights(raw: any): string[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    // Try to parse stringified array
    try {
      const parsed = JSON.parse(raw.replace(/'/g, '"'));
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    // Fallback: remove brackets/quotes and split if comma-separated
    return raw
      .replace(/^\[|\]$/g, "")
      .split(/',\s*'|",\s*"|,\s*/)
      .map(s => s.replace(/^['"]|['"]$/g, "").trim())
      .filter(Boolean);
  }
  return [];
}

export default function ResearchPhase({ idea, onCompleteAction, combinedContext }: ResearchPhaseProps) {
  const [overallProgress, setOverallProgress] = useState(0)
  const [researchComplete, setResearchComplete] = useState(false)

  const { toast } = useToast()
  const [agentResults, setAgentResults] = useState<Record<string, any[]>>({})
  const [agentProgress, setAgentProgress] = useState<Record<string, number>>({})
  const [researchSummary, setResearchSummary] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [totalExpectedResults, setTotalExpectedResults] = useState(RESEARCH_AGENTS.length * 2)
  const [completedResultsCount, setCompletedResultsCount] = useState(0)

  // Add state for latest insights
  const [latestInsights, setLatestInsights] = useState<LatestInsight[]>([])

  const callResearchApi = async (action: ResearchAction, payload: any) => {
    try {
      const response = await fetch("/api/brainstorm/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, payload }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error(`Research API Error (${action}):`, response.status, errorData)
        toast({
          title: `Research Error (${action})`,
          description: errorData.details || `Request failed with status ${response.status}`,
          variant: "destructive",
        })
        return null
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error(`Network or parsing error calling Research API (${action}):`, error)
      toast({
        title: `Network Error (${action})`,
        description: error instanceof Error ? error.message : "Could not connect to the server.",
        variant: "destructive",
      })
      return null
    }
  }

  useEffect(() => {
    if (loading || researchComplete) {
      console.log(`ResearchPhase useEffect skipped: loading=${loading}, researchComplete=${researchComplete}`)
      return
    }

    let cancelled = false
    async function runResearch() {
      if (!idea || !combinedContext) {
        console.warn("ResearchPhase: Waiting for valid idea and combinedContext.")
        return
      }

      console.log("ResearchPhase: Starting research run...")
      setLoading(true)
      setResearchComplete(false)
      setResearchSummary("")
      let resultsAccumulator: Record<string, any[]> = {}
      let progressAccumulator: Record<string, number> = {}
      setCompletedResultsCount(0)
      setTotalExpectedResults(RESEARCH_AGENTS.length * 2)
      setLatestInsights([]) // Reset insights on new run

      for (const agent of RESEARCH_AGENTS) {
        resultsAccumulator[agent.id] = []
        progressAccumulator[agent.id] = 0
      }
      setAgentResults({ ...resultsAccumulator })
      setAgentProgress({ ...progressAccumulator })
      setOverallProgress(0)

      try {
        await Promise.all(
          RESEARCH_AGENTS.map(async (agent) => {
            for (let round = 1; round <= 2; round++) {
              if (cancelled) return

              const agentPayload: RunAgentPayload = {
                selected_idea: idea,
                agent_name: agent.id,
                combined_context: combinedContext || {},
                round_num: round,
              }

              console.log(`ResearchPhase: Calling run_agent for ${agent.name} round ${round}...`)
              const agentResponse = await callResearchApi("run_agent", agentPayload)

              if (cancelled) return

              if (agentResponse && agentResponse.data) {
                console.log(`ResearchPhase: Received data for ${agent.name} round ${round}`)
                resultsAccumulator[agent.id] = [...resultsAccumulator[agent.id], agentResponse.data]
                const successfulRounds = resultsAccumulator[agent.id].length
                progressAccumulator[agent.id] = Math.round((successfulRounds / 2) * 100)

                setAgentResults((prev) => ({ ...prev, [agent.id]: resultsAccumulator[agent.id] }))
                setAgentProgress((prev) => ({ ...prev, [agent.id]: progressAccumulator[agent.id] }))
                setCompletedResultsCount((prevCount) => {
                  const newCount = prevCount + 1
                  setOverallProgress(Math.round((newCount / totalExpectedResults) * 100))
                  return newCount
                })

                // Add new insights to the latestInsights state
                let newInsightsRaw = agentResponse.data.summarized_insights;
                const newInsights = parseInsights(newInsightsRaw);
                const timestamp = Date.now();
                const insightsToAdd: LatestInsight[] = newInsights.map((insight, index) => ({
                  id: `${agent.id}-${round}-${index}-${timestamp}`,
                  agentId: agent.id,
                  agentName: agent.name,
                  agentColor: agent.color,
                  content: insight,
                  timestamp: timestamp + index, // Ensure unique timestamp for sorting
                }));

                setLatestInsights((prevInsights) =>
                  [...insightsToAdd, ...prevInsights]
                    .sort((a, b) => b.timestamp - a.timestamp) // Sort by most recent
                    .slice(0, 10), // Keep only the latest 10 insights
                );
              } else {
                console.warn(`ResearchPhase: Agent ${agent.name} round ${round} failed or returned no data.`)
              }
            }
          }),
        )

        if (cancelled) return

        console.log("ResearchPhase: All agent calls finished.")
        setOverallProgress((prev) => Math.min(100, Math.round((completedResultsCount / totalExpectedResults) * 100)))

        console.log("ResearchPhase: Calling get_summary...")
        const summaryPayload: GetSummaryPayload = {
          research_results: resultsAccumulator,
          selected_idea: idea,
        }

        // Try to get a non-empty research summary, retry up to 2 times if needed
        let summaryResponse = null;
        let summaryTries = 0;
        let summaryOk = false;
        while (summaryTries < 3 && !summaryOk) {
          summaryTries++;
          summaryResponse = await callResearchApi("get_summary", summaryPayload);
          if (summaryResponse && summaryResponse.data && summaryResponse.data.research_summary && summaryResponse.data.research_summary.trim()) {
            summaryOk = true;
          } else {
            console.warn(`ResearchPhase: Summary API call failed or returned no summary (attempt ${summaryTries}). Retrying...`);
          }
        }
        if (cancelled) return
        if (summaryOk) {
          setResearchSummary(summaryResponse.data.research_summary)
          setResearchComplete(true)
          setOverallProgress(100)
        } else {
          setResearchSummary("");
          setResearchComplete(true);
          setOverallProgress(100);
          console.error("ResearchPhase: Summary API call failed or returned no summary after retries. Passing empty string.");
          toast({ title: "Error", description: "Failed to generate research summary after multiple attempts. Proceeding with empty summary." })
        }
      } catch (error) {
        if (cancelled) return
        console.error("ResearchPhase: Error during research execution:", error)
        toast({ title: "Error", description: "An unexpected error occurred during research." })
      } finally {
        if (!cancelled) {
          setLoading(false)
          console.log("ResearchPhase: Research run finished.")
        }
      }
    }

    runResearch()

    return () => {
      console.log("ResearchPhase: Cleanup function called.")
      cancelled = true
    }
  }, [idea, combinedContext])

  const getProgressColorClass = (progress: number) => {
    if (progress < 30) return "bg-red-500"
    if (progress < 70) return "bg-amber-500"
    return "bg-green-500"
  }

  const getCardColorClass = (color: string) => {
    switch (color) {
      case "purple":
        return "border-l-purple-500"
      case "blue":
        return "border-l-blue-500"
      case "green":
        return "border-l-green-500"
      case "indigo":
        return "border-l-indigo-500"
      case "amber":
        return "border-l-amber-500"
      case "emerald":
        return "border-l-emerald-500"
      case "cyan":
        return "border-l-cyan-500"
      case "pink":
        return "border-l-pink-500"
      case "red":
        return "border-l-red-500"
      default:
        return "border-l-gray-500"
    }
  }

  const getAgentCardClass = (color: string) => {
    switch (color) {
      case "purple":
        return "bg-purple-50 border-purple-200 text-purple-700"
      case "blue":
        return "bg-blue-50 border-blue-200 text-blue-700"
      case "green":
        return "bg-green-50 border-green-200 text-green-700"
      case "indigo":
        return "bg-indigo-50 border-indigo-200 text-indigo-700"
      case "amber":
        return "bg-amber-50 border-amber-200 text-amber-700"
      case "emerald":
        return "bg-emerald-50 border-emerald-200 text-emerald-700"
      case "cyan":
        return "bg-cyan-50 border-cyan-200 text-cyan-700"
      case "pink":
        return "bg-pink-50 border-pink-200 text-pink-700"
      case "red":
        return "bg-red-50 border-red-200 text-red-700"
      default:
        return "bg-gray-50 border-gray-200 text-gray-700"
    }
  }

  return (
    <Card className="w-full shadow-xl border-t-4 border-t-blue-500 animate-fade-in relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none"></div>

      <CardHeader className="pb-4 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-300 opacity-30"></div>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 p-2 mr-2">
              <Brain className="h-5 w-5 text-blue-600" />
            </div>
            <span>Deep Research Phase</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-3 mr-2">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-500">{RESEARCH_AGENTS.length} Agents</span>
              </div>
              <div className="flex items-center space-x-1">
                <Lightbulb className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-500">{latestInsights.length} Insights</span>
              </div>
            </div>
            <Badge variant="outline" className="px-2 py-1 text-xs">
              Phase 2 of 4
            </Badge>
            <PoweredByBadge type="claude" size="sm" />
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Overall Research Progress</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${getProgressColorClass(overallProgress)} transition-all duration-500 ease-out progress-bar-animated`}
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {RESEARCH_AGENTS.map((agent) => {
                const progress = agentProgress[agent.id] || 0
                const results = agentResults[agent.id] || []
                const insights = results.flatMap((r) => parseInsights(r?.summarized_insights))
                const isComplete = progress === 100
                return (
                  <Card
                    key={agent.id}
                    className={`overflow-hidden border-l-4 transition-all duration-300 hover:shadow-md ${getCardColorClass(agent.color)} ${isComplete ? "animate-float" : ""}`}
                  >
                    <CardHeader className="p-3 pb-2">
                      <CardTitle className="text-base flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`rounded-full bg-${agent.color}-100 p-1 mr-2 flex items-center justify-center`}>{agent.icon}</div>
                          <span>{agent.name}</span>
                        </div>
                        {isComplete && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <p className="text-xs text-gray-500 mb-2">{agent.specialization}</p>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-1.5 mb-3" />
                      <div className="flex justify-between text-xs text-gray-500 mb-2">
                        <div className="flex items-center">
                          <Lightbulb className="h-3 w-3 mr-1" />
                          <span>{insights.length} Insights</span>
                        </div>
                      </div>
                      {insights.length > 0 && (
                        <div className="mt-2 pt-2 border-t">
                          <h4 className="text-xs font-medium mb-1 text-gray-500">Top Insights:</h4>
                          <ul className="text-sm space-y-1">
                            {insights.slice(0, 2).map((insight: string, index: number) => (
                              <li key={index} className="flex items-start">
                                <span className={`text-${agent.color}-500 mr-2`}>•</span>
                                <span className="text-xs">{insight}</span>
                              </li>
                            ))}
                            {insights.length > 2 && (
                              <li className="text-xs text-blue-600 cursor-pointer hover:underline">
                                + {insights.length - 2} more insights
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border shadow-sm overflow-hidden">
                <div className="p-3 bg-gray-50 border-b">
                  <h3 className="text-sm font-medium flex items-center">
                    <Users className="h-4 w-4 mr-1.5 text-blue-600" />
                    Research Agents
                  </h3>
                </div>
                <div className="p-3 max-h-60 overflow-y-auto custom-scrollbar">
                  <div className="space-y-2">
                    {RESEARCH_AGENTS.map((agent) => (
                      <div
                        key={agent.id}
                        className={cn(
                          "p-2 rounded-lg border text-sm flex items-center justify-between",
                          getAgentCardClass(agent.color),
                          "border-l-4"
                        )}
                      >
                        <div className="flex items-center">
                          <div className={`rounded-full bg-${agent.color}-100 p-1 mr-2 flex items-center justify-center`}>{agent.icon}</div>
                          <div>
                            <span className="font-medium">{agent.name}</span>
                            <p className="text-xs opacity-70">{agent.specialization}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border shadow-sm overflow-hidden">
                <div className="p-3 bg-gray-50 border-b">
                  <h3 className="text-sm font-medium flex items-center">
                    <Lightbulb className="h-4 w-4 mr-1.5 text-amber-600" />
                    Latest Insights
                  </h3>
                </div>
                <div className="p-3 max-h-60 overflow-y-auto custom-scrollbar">
                  <div className="space-y-2">
                    {latestInsights.map((insight) => {
                      const agent = RESEARCH_AGENTS.find((a) => a.id === insight.agentId)
                      return (
                        <div
                          key={insight.id}
                          className={`p-2 rounded-lg border-l-4 border-${insight.agentColor}-400 bg-${insight.agentColor}-50 text-sm`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center">
                              <div className={`rounded-full bg-${insight.agentColor}-100 p-1 mr-2 flex items-center justify-center`}>{agent?.icon}</div>
                              <span className={`font-medium text-xs text-${insight.agentColor}-700`}>{insight.agentName}</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-700">{insight.content}</p>
                        </div>
                      )
                    })}
                    {latestInsights.length === 0 && !loading && (
                      <div className="text-sm text-gray-500 py-4 text-center">No insights generated yet.</div>
                    )}
                    {loading && latestInsights.length === 0 && (
                      <div className="text-sm text-gray-500 py-4 text-center">Generating insights...</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          onClick={() => onCompleteAction(researchSummary)}
          disabled={loading || !researchComplete || !researchSummary.trim()}
          className="w-full shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 bg-gradient-to-r from-blue-500 to-blue-600"
        >
          {loading ? `Researching... (${overallProgress}%)` : researchComplete ? "Move to Multi-Agent Debate Phase" : "Waiting for Research..."}
          {!loading && researchComplete && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </CardFooter>
    </Card>
  )
}
