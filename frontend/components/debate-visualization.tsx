"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowUpRight, MessageCircle, ThumbsUp, ThumbsDown, Scale, Brain, Lightbulb } from "lucide-react"

// Define agent types and colors
const agentTypes = [
  { name: "Market Agent", color: "bg-emerald-500", icon: <Scale className="h-4 w-4" /> },
  { name: "Feature Agent", color: "bg-blue-500", icon: <Lightbulb className="h-4 w-4" /> },
  { name: "Synthesis Agent", color: "bg-purple-500", icon: <Brain className="h-4 w-4" /> },
  { name: "Contrarian Agent", color: "bg-amber-500", icon: <ThumbsDown className="h-4 w-4" /> },
  { name: "Fusion Agent", color: "bg-rose-500", icon: <ThumbsUp className="h-4 w-4" /> },
]

// Mock data structure that matches the backend output
interface AgentDebateData {
  agent_name: string
  insight: string
  critiques: string[]
  vote: number
  empirical_weight: number
  change_log: string
  chain_of_thought: string
}

interface DebateRound {
  round: number
  agents: AgentDebateData[]
}

// Sample data structure (this would come from your backend)
const sampleDebateData: DebateRound[] = [
  {
    round: 1,
    agents: agentTypes.map((agent) => ({
      agent_name: agent.name,
      insight: `Initial insight from ${agent.name}...`,
      critiques: ["Critique 1", "Critique 2"],
      vote: Math.floor(Math.random() * 10) + 1,
      empirical_weight: Number.parseFloat((Math.random() * 0.5 + 0.5).toFixed(1)),
      change_log: "Initial position",
      chain_of_thought: "Initial reasoning process...",
    })),
  },
  {
    round: 2,
    agents: agentTypes.map((agent) => ({
      agent_name: agent.name,
      insight: `Updated insight from ${agent.name} after round 1...`,
      critiques: ["New critique 1", "New critique 2"],
      vote: Math.floor(Math.random() * 10) + 1,
      empirical_weight: Number.parseFloat((Math.random() * 0.5 + 0.5).toFixed(1)),
      change_log: "Position shifted based on Market Agent's critique",
      chain_of_thought: "Updated reasoning process...",
    })),
  },
  {
    round: 3,
    agents: agentTypes.map((agent) => ({
      agent_name: agent.name,
      insight: `Final insight from ${agent.name}...`,
      critiques: ["Final critique 1", "Final critique 2"],
      vote: Math.floor(Math.random() * 10) + 1,
      empirical_weight: Number.parseFloat((Math.random() * 0.5 + 0.5).toFixed(1)),
      change_log: "Final position after considering all perspectives",
      chain_of_thought: "Final reasoning process with synthesis...",
    })),
  },
]

const DebateVisualization = () => {
  const [currentRound, setCurrentRound] = useState(1)
  const [debateData, setDebateData] = useState<DebateRound[]>(sampleDebateData)
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null)

  // Function to get agent color
  const getAgentColor = (agentName: string) => {
    const agent = agentTypes.find((a) => a.name === agentName)
    return agent ? agent.color : "bg-gray-500"
  }

  // Function to get agent icon
  const getAgentIcon = (agentName: string) => {
    const agent = agentTypes.find((a) => a.name === agentName)
    return agent ? agent.icon : <MessageCircle className="h-4 w-4" />
  }

  // Toggle expanded state for an agent
  const toggleExpandAgent = (agentName: string) => {
    if (expandedAgent === agentName) {
      setExpandedAgent(null)
    } else {
      setExpandedAgent(agentName)
    }
  }

  return (
    <div className="w-full">
      {/* Round selector */}
      <div className="flex justify-center mb-6 space-x-2">
        {debateData.map((round) => (
          <button
            key={round.round}
            onClick={() => setCurrentRound(round.round)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              currentRound === round.round
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            Round {round.round}
          </button>
        ))}
      </div>

      {/* Debate visualization */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {debateData
          .find((round) => round.round === currentRound)
          ?.agents.map((agent, index) => (
            <motion.div
              key={agent.agent_name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card
                className="overflow-hidden border-t-4"
                style={{ borderTopColor: getAgentColor(agent.agent_name).replace("bg-", "") }}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`p-1.5 rounded-full ${getAgentColor(agent.agent_name)} text-white`}>
                        {getAgentIcon(agent.agent_name)}
                      </div>
                      <h3 className="font-semibold">{agent.agent_name}</h3>
                    </div>
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <span>Vote: {agent.vote}/10</span>
                      <span className="text-xs opacity-70">({agent.empirical_weight})</span>
                    </Badge>
                  </div>

                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Insight</h4>
                    <p className="text-sm">{agent.insight}</p>
                  </div>

                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Change Log</h4>
                    <p className="text-sm italic">{agent.change_log}</p>
                  </div>

                  {expandedAgent === agent.agent_name && (
                    <>
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Critiques</h4>
                        <ul className="text-sm list-disc pl-5">
                          {agent.critiques.map((critique, i) => (
                            <li key={i}>{critique}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Chain of Thought</h4>
                        <p className="text-sm">{agent.chain_of_thought}</p>
                      </div>
                    </>
                  )}

                  <button
                    onClick={() => toggleExpandAgent(agent.agent_name)}
                    className="flex items-center text-xs text-primary hover:underline mt-2"
                  >
                    {expandedAgent === agent.agent_name ? "Show less" : "Show more"}
                    <ArrowUpRight className="h-3 w-3 ml-1" />
                  </button>
                </div>

                <div className="px-4 pb-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Confidence</span>
                    <span>{Math.round(agent.empirical_weight * 100)}%</span>
                  </div>
                  <Progress value={agent.empirical_weight * 100} className="h-1.5" />
                </div>
              </Card>
            </motion.div>
          ))}
      </div>
    </div>
  )
}

export default DebateVisualization
