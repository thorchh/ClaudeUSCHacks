"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import PoweredByBadge from "@/components/powered-by-badge"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowRight,
  MessageSquare,
  Loader2,
  Users,
  Zap,
  Lightbulb,
  Shield,
  Sparkles,
  CheckCircle2,
  Briefcase,
  Puzzle,
  Shuffle,
  Scale,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface AgentDebateProps {
  idea: string
  onCompleteAction: (summary: string) => void
  combinedContext: any
}

interface DebateTurn {
  round: number
  agent_role: string
  insight: string
  critiques: string[]
  vote: number
  empirical_weight: number
  change_log: string
  chain_of_thought?: string
}

interface Agent {
  id: string
  name: string
  role: string
  color: string
  avatar: string
  bgColor: string
  textColor: string
  icon: React.ReactNode
}

const AGENTS_DATA: Agent[] = [
  {
    id: "Market Agent",
    name: "Market Agent",
    role: "Analyzes market and adoption perspectives",
    color: "green",
    avatar: "MA",
    bgColor: "bg-green-100",
    textColor: "text-green-600",
    icon: <Briefcase className="h-5 w-5 text-green-600" />,
  },
  {
    id: "Feature Agent",
    name: "Feature Agent",
    role: "Evaluates product and technical feasibility",
    color: "blue",
    avatar: "FA",
    bgColor: "bg-blue-100",
    textColor: "text-blue-600",
    icon: <Puzzle className="h-5 w-5 text-blue-600" />,
  },
  {
    id: "Synthesis Agent",
    name: "Synthesis Agent",
    role: "Integrates perspectives for holistic solutions",
    color: "purple",
    avatar: "SA",
    bgColor: "bg-purple-100",
    textColor: "text-purple-600",
    icon: <Shuffle className="h-5 w-5 text-purple-600" />,
  },
  {
    id: "Contrarian Agent",
    name: "Contrarian Agent",
    role: "Challenges assumptions and identifies risks",
    color: "red",
    avatar: "CA",
    bgColor: "bg-red-100",
    textColor: "text-red-600",
    icon: <Shield className="h-5 w-5 text-red-600" />,
  },
  {
    id: "Fusion Agent",
    name: "Fusion Agent",
    role: "Proposes creative integrations and hybrid solutions",
    color: "amber",
    avatar: "FU",
    bgColor: "bg-amber-100",
    textColor: "text-amber-600",
    icon: <Sparkles className="h-5 w-5 text-amber-600" />,
  },
]

const getAgentByName = (name: string): Agent | undefined => {
  return AGENTS_DATA.find((agent) => agent.id === name)
}

interface DebateTopic {
  id: string
  name: string
  color: string
  agentRoles: string[]
  messageCount: number
}

const DEBATE_ROUNDS = 3

const callDebateApi = async (action: 'get_available_roles' | 'run_debate_round', payload?: any) => {
  try {
    const method = action === 'get_available_roles' ? 'GET' : 'POST';
    const url = '/api/brainstorm/debate';
    const options: RequestInit = {
      method: method,
      headers: method === 'POST' ? { 'Content-Type': 'application/json' } : undefined,
      body: method === 'POST' ? JSON.stringify({ action, payload }) : undefined,
    };
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details?.error || errorData.error || `API request failed with status ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error(`Error calling debate API action ${action}:`, error);
    return null;
  }
};

const summarizeDebateLog = async (debateLog: DebateTurn[], selectedIdea: string) => {
  let summary = null;
  let tries = 0;
  const safeDebateLog = Array.isArray(debateLog) ? debateLog : [];
  console.log("summarizeDebateLog: Starting summary process...");
  console.log("Debate log to summarize (length):", safeDebateLog.length, safeDebateLog);
  while (tries < 3 && (!summary || !summary.trim())) {
    tries++;
    try {
      console.log(`summarizeDebateLog: Attempt ${tries} sending payload:`, {
        action: 'summarize_debate',
        payload: { debate_log: safeDebateLog, selected_idea: selectedIdea },
      });
      const response = await fetch('/api/brainstorm/debate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'summarize_debate',
          payload: { debate_log: safeDebateLog, selected_idea: selectedIdea },
        }),
      });
      const data = await response.json();
      console.log(`summarizeDebateLog: Response for attempt ${tries}:`, data);
      if (response.ok && data.data && data.data.trim()) {
        summary = data.data;
      } else {
        console.warn(`summarizeDebateLog: Empty or failed summary (attempt ${tries}). Retrying...`);
      }
    } catch (e) {
      console.warn(`summarizeDebateLog: Exception on attempt ${tries}:`, e);
    }
  }
  if (!summary || !summary.trim()) {
    console.error("summarizeDebateLog: All attempts failed, passing empty string.");
    return "";
  }
  return summary;
};

export default function AgentDebate({ idea, onCompleteAction, combinedContext }: AgentDebateProps) {
  const [debateLog, setDebateLog] = useState<DebateTurn[]>([])
  const [currentRound, setCurrentRound] = useState(1)
  const [availableRoles, setAvailableRoles] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [debateComplete, setDebateComplete] = useState(false)
  const [overallProgress, setOverallProgress] = useState(0)
  const [currentTask, setCurrentTask] = useState("Initializing debate...")
  const { toast } = useToast()
  const debateEndRef = useRef<HTMLDivElement>(null)

  const [typingAgentId, setTypingAgentId] = useState<string | null>(null)
  const [agentActivity, setAgentActivity] = useState<{ [key: string]: number }>({});
  const [topics, setTopics] = useState<DebateTopic[]>([
    { id: "market", name: "Market/Adoption", color: "green", agentRoles: ["Market Agent"], messageCount: 0 },
    { id: "technical", name: "Product/Tech", color: "blue", agentRoles: ["Feature Agent"], messageCount: 0 },
    { id: "integration", name: "Synthesis/Integration", color: "purple", agentRoles: ["Synthesis Agent"], messageCount: 0 },
    { id: "risks", name: "Risks/Challenges", color: "red", agentRoles: ["Contrarian Agent"], messageCount: 0 },
    { id: "innovation", name: "Innovation/Fusion", color: "amber", agentRoles: ["Fusion Agent"], messageCount: 0 },
  ])
  const [activeTopics, setActiveTopics] = useState<string[]>([])
  const [debateSummary, setDebateSummary] = useState<string | null>(null);

  const debateStarted = useRef(false);

  useEffect(() => {
    const initialActivity: { [key: string]: number } = {};
    AGENTS_DATA.forEach(agent => {
      initialActivity[agent.id] = 0;
    });
    setAgentActivity(initialActivity);
  }, []);

  useEffect(() => {
    debateEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [debateLog, typingAgentId])

  useEffect(() => {
    async function initializeDebate() {
      if (!idea || !combinedContext?.research_summary) {
        console.warn("AgentDebate: Waiting for idea and research summary in combinedContext.");
        return;
      }
      if (debateStarted.current) return;
      debateStarted.current = true;
      setLoading(true)
      setCurrentTask("Fetching agent roles...")
      const rolesResponse = await callDebateApi('get_available_roles');
      if (rolesResponse && rolesResponse.data) {
        setAvailableRoles(rolesResponse.data);
        setCurrentTask(`Starting Round ${currentRound}...`)
        runDebateRound(1, rolesResponse.data, combinedContext.research_summary, []);
      } else {
        toast({ title: "Error", description: "Could not fetch agent roles." });
        setLoading(false);
      }
    }
    initializeDebate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idea, combinedContext]);

  useEffect(() => {
    const newActivity = { ...agentActivity };
    const newTopics = topics.map(t => ({ ...t, messageCount: 0 }));
    let currentActiveTopics: string[] = [];

    debateLog.forEach(turn => {
      if (newActivity[turn.agent_role] !== undefined) {
        newActivity[turn.agent_role]++;
      }
      const topicIndex = newTopics.findIndex(t => t.agentRoles.includes(turn.agent_role));
      if (topicIndex !== -1) {
        newTopics[topicIndex].messageCount++;
        currentActiveTopics = [newTopics[topicIndex].id];
      }
    });

    setAgentActivity(newActivity);
    setTopics(newTopics);
    setActiveTopics(currentActiveTopics);

  }, [debateLog]);

  async function runDebateRound(roundNum: number, roles: string[], researchSummary: string, localDebateLog: DebateTurn[] = []) {
    if (roundNum > DEBATE_ROUNDS) {
      setDebateComplete(true)
      setLoading(false)
      setCurrentTask("Debate concluded. Summarizing...")
      setOverallProgress(100)
      setTypingAgentId(null)
      // Only pass the last 5 turns (i.e., the last round) to the summarizer
      const lastRoundLog = localDebateLog.slice(-5);
      const summary = await summarizeDebateLog(lastRoundLog, idea);
      setDebateSummary(summary || "");
      return
    }
    setCurrentRound(roundNum)
    setLoading(true)
    let feedbackForNextAgent: any[] = [];
    for (const role of roles) {
      if (debateComplete) break;
      setCurrentTask(`Round ${roundNum}: ${role}'s turn...`)
      setTypingAgentId(role)
      const payload = {
        selected_idea: idea,
        research_summary: researchSummary,
        agent_role: role,
        other_feedback: feedbackForNextAgent,
        round_num: roundNum,
      };
      await new Promise(resolve => setTimeout(resolve, 300));
      const turnResultResponse = await callDebateApi('run_debate_round', payload);
      setTypingAgentId(null)
      if (turnResultResponse && turnResultResponse.data) {
        const newTurnData = { ...turnResultResponse.data };
        if (!newTurnData.round) newTurnData.round = roundNum;
        if (!newTurnData.agent_role) newTurnData.agent_role = role;
        const newTurn: DebateTurn = newTurnData as DebateTurn;
        feedbackForNextAgent.push({
          agent_name: role,
          insight: newTurn.insight,
          vote: newTurn.vote,
          empirical_weight: newTurn.empirical_weight
        });
        localDebateLog.push(newTurn);
        setDebateLog(prev => [...prev, newTurn]);
      } else {
        const errorMsg = turnResultResponse?.error || `Agent ${role} failed to respond in round ${roundNum}.`;
        toast({ title: "Debate Error", description: errorMsg });
      }
      const agentsCompletedThisRound = roles.indexOf(role) + 1;
      const progressThisRound = (agentsCompletedThisRound / roles.length) * (100 / DEBATE_ROUNDS);
      const progressPreviousRounds = ((roundNum - 1) / DEBATE_ROUNDS) * 100;
      setOverallProgress(Math.min(100, progressPreviousRounds + progressThisRound));
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    if (!debateComplete) {
      runDebateRound(roundNum + 1, roles, researchSummary, localDebateLog);
    }
  }

  const renderAgentActivityChart = () => {
    const maxActivity = Math.max(...Object.values(agentActivity), 1);

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium mb-2">Agent Participation</h4>
        <div className="space-y-2">
          {AGENTS_DATA.map((agent) => {
            const activity = agentActivity[agent.id] || 0;
            const percentage = maxActivity > 0 ? (activity / maxActivity) * 100 : 0;

            const bgColorMap: Record<string, string> = {
              green: "bg-green-500",
              red: "bg-red-500",
              blue: "bg-blue-500",
              purple: "bg-purple-500",
              amber: "bg-amber-500",
            }

            return (
              <div key={agent.id} className="flex items-center">
                <Avatar className={`h-6 w-6 mr-2 ${agent.bgColor} ${agent.textColor}`}>
                  <AvatarFallback className="text-xs">{agent.avatar}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span>{agent.name}</span>
                    <span>{activity} contributions</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ease-out ${bgColorMap[agent.color]}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderTopicDistribution = () => {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium mb-2">Topic Distribution (by Agent)</h4>
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => {
            const messageCount = topic.messageCount;
            const size = 30 + messageCount * 5;

            const bgColorMap: Record<string, string> = {
              blue: "bg-blue-100",
              purple: "bg-purple-100",
              green: "bg-green-100",
              red: "bg-red-100",
              amber: "bg-amber-100",
            }
            const textColorMap: Record<string, string> = {
              blue: "text-blue-700",
              purple: "text-purple-700",
              green: "text-green-700",
              red: "text-red-700",
              amber: "text-amber-700",
            }
            const borderColorMap: Record<string, string> = {
              blue: "border-blue-200",
              purple: "border-purple-200",
              green: "border-green-200",
              red: "border-red-200",
              amber: "border-amber-200",
            }

            return (
              <div
                key={topic.id}
                className={`rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 cursor-help ${bgColorMap[topic.color]} ${textColorMap[topic.color]} border ${borderColorMap[topic.color]}`}
                style={{ width: `${size}px`, height: `${size}px` }}
                title={`${topic.name}: ${messageCount} mentions`}
              >
                <span className="text-xs font-medium">{messageCount}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full shadow-xl border-t-4 border-t-green-500 animate-fade-in relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent pointer-events-none"></div>

      <CardHeader className="pb-4 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-green-400 to-green-300 opacity-30"></div>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-2 mr-2">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <span>Multi-Agent Debate Phase</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="px-2 py-1 text-xs">
              Phase 3 of 4
            </Badge>
            <PoweredByBadge type="claude" size="sm" />
          </div>
        </CardTitle>
        <CardDescription>
          AI agents discuss and critique the refined idea based on research findings.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Debate Progress</span>
              <span className="text-sm text-gray-500">
                Round {currentRound} of {DEBATE_ROUNDS}
              </span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-500 ease-out"
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
             <p className="text-xs text-muted-foreground text-center pt-1">{currentTask}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="flex flex-wrap gap-2 mb-4">
                {AGENTS_DATA.map((agent) => (
                  <div
                    key={agent.id}
                    className={`flex items-center space-x-1 rounded-full px-3 py-1 text-xs ${agent.bgColor} ${agent.textColor} transition-all duration-300 ${typingAgentId === agent.id ? "ring-2 ring-offset-2 ring-" + agent.color + "-400" : ""}`}
                  >
                    <Avatar className={`h-5 w-5 ${agent.bgColor} ${agent.textColor}`}>
                      <AvatarFallback className="text-xs">{agent.avatar}</AvatarFallback>
                    </Avatar>
                    <span>{agent.name}</span>
                    {typingAgentId === agent.id && (
                      <span className="ml-1 flex space-x-0.5">
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="border rounded-lg overflow-hidden shadow-md">
                <div className="bg-gray-50 p-3 border-b">
                  <h3 className="font-medium flex items-center justify-between">
                    <div className="flex items-center">
                      <span>Debate Transcript</span>
                      <Badge variant="outline" className="ml-2 px-2 py-0.5 text-xs">
                        Round {currentRound}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1">
                      {topics.map((topic) => {
                        const isActive = activeTopics.includes(topic.id);
                        const activeColorMap: Record<string, string> = {
                          blue: "bg-blue-500",
                          purple: "bg-purple-500",
                          green: "bg-green-500",
                          red: "bg-red-500",
                          amber: "bg-amber-500",
                        }
                        return (
                          <div
                            key={topic.id}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${isActive ? activeColorMap[topic.color] : "bg-gray-300"}`}
                            title={topic.name}
                          />
                        )
                      })}
                    </div>
                  </h3>
                </div>
                <ScrollArea className="p-4 space-y-4 h-[450px] custom-scrollbar">
                  {debateLog.map((turn, index) => {
                    const agent = getAgentByName(turn.agent_role);
                    if (!agent) return null;

                    // Defensive: ensure critiques is always an array
                    const critiques = Array.isArray(turn.critiques) ? turn.critiques : (turn.critiques ? [turn.critiques] : []);

                    return (
                      <div key={index} className="space-y-1 animate-fade-in">
                        <div className="flex items-center space-x-2">
                          <Avatar className={`${agent.bgColor} ${agent.textColor} border-2 border-${agent.color}-200`}>
                            <AvatarFallback>{agent.avatar}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="font-medium text-sm">{agent.name}</div>
                            </div>
                            <div className="text-xs text-gray-500">{agent.role}</div>
                          </div>
                        </div>
                        <div
                          className={`pl-8 text-sm p-3 rounded-lg ml-6 bg-${agent.color}-50 border-l-2 border-${agent.color}-200 relative`}
                          id={`turn-${index}`}
                        >
                          <p className="mb-2">{turn.insight}</p>

                          {critiques.length > 0 && (
                            <div className="mb-2 p-2 border rounded-md bg-red-50 border-red-100">
                              <h4 className="text-xs font-semibold mb-1 text-red-700">Critiques Raised:</h4>
                              <ul className="list-disc list-inside space-y-1">
                                {critiques.map((critique, cIndex) => (
                                  <li key={cIndex} className="text-xs text-red-900">{critique}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center space-x-2">
                              <Scale className="h-3.5 w-3.5" />
                              <span>Vote: <strong className="text-black">{turn.vote}/10</strong></span>
                              <span className="ml-2">Weight: <strong className="text-black">{(turn.empirical_weight * 100).toFixed(0)}%</strong></span>
                            </div>
                            {turn.change_log && (
                              <span className="italic text-gray-500">{turn.change_log}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {typingAgentId && (
                    <div className="space-y-1 animate-fade-in">
                      {(() => {
                        const agent = getAgentByName(typingAgentId);
                        if (!agent) return null;
                        return (
                          <>
                            <div className="flex items-center space-x-2">
                              <Avatar className={`${agent.bgColor} ${agent.textColor} border-2 border-${agent.color}-200`}>
                                <AvatarFallback>{agent.avatar}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-sm">{agent.name}</div>
                                <div className="text-xs text-gray-500">{agent.role}</div>
                              </div>
                            </div>
                            <div className={`pl-8 text-sm p-3 rounded-lg ml-6 bg-${agent.color}-50 border-l-2 border-${agent.color}-200 relative`}>
                              <span className="inline-flex space-x-1">
                                <span className="typing-dot"></span>
                                <span className="typing-dot"></span>
                                <span className="typing-dot"></span>
                              </span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {debateLog.length === 0 && !typingAgentId && loading && (
                    <div className="text-center py-8 text-gray-500">
                      <p>Agents are preparing to debate your idea...</p>
                      <div className="flex justify-center space-x-2 mt-2">
                        <Loader2 className="h-5 w-5 animate-spin text-green-500" />
                      </div>
                    </div>
                  )}

                  <div ref={debateEndRef} />
                </ScrollArea>
              </div>
            </div>

            <div className="space-y-4">
              <Card className="shadow-sm">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base flex items-center">
                    <Zap className="h-4 w-4 mr-2 text-amber-500" />
                    Debate Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  {renderAgentActivityChart()}
                  {renderTopicDistribution()}
                </CardContent>
              </Card>

              <div className="bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-lg border shadow-sm">
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <Lightbulb className="h-4 w-4 mr-1 text-amber-500" />
                  Debate Progress
                </h4>
                <div className="space-y-3">
                  {[1, 2, 3].map((roundStep) => (
                    <div key={roundStep} className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${currentRound >= roundStep ? "bg-green-500" : "bg-gray-300"}`}></div>
                      <div className="text-sm flex-1">
                        {roundStep === 1 && "Initial perspectives shared"}
                        {roundStep === 2 && "Challenges and solutions discussed"}
                        {roundStep === 3 && "Consensus and recommendations formed"}
                      </div>
                      {currentRound > roundStep || (currentRound === roundStep && overallProgress >= (roundStep / DEBATE_ROUNDS) * 100 - 1) ? (
                         <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          onClick={() => onCompleteAction(debateSummary || "")}
          disabled={!debateComplete || loading || debateSummary === null}
          className="w-full shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 bg-gradient-to-r from-green-500 to-green-600"
        >
          {loading ? "Debate in Progress..." : debateSummary === null ? "Summarizing..." : "Proceed to Final Report"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
