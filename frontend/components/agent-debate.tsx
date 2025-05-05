"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowRight,
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
import { Badge } from "@/components/ui/badge"
import PoweredByBadge from "@/components/powered-by-badge"

interface AgentDebateProps {
  idea: string
  onComplete: () => void
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
  sentiment: "positive" | "neutral" | "negative" | "mixed"
}

interface DebateMessage {
  id: string
  agentId: string
  content: string
  timestamp: Date
  replyTo?: string
  keywords: string[]
  sentiment: "positive" | "neutral" | "negative" | "mixed"
  importance: number // 1-10 scale
  vote?: number
  empiricalWeight?: number
  changeLog?: string
}

interface DebateTopic {
  id: string
  name: string
  color: string
  messages: string[]
}

export default function AgentDebate({ idea, onComplete }: AgentDebateProps) {
  // Updated agents to match the backend roles
  const [agents] = useState<Agent[]>([
    {
      id: "market",
      name: "Market Agent",
      role: "Analyzes market and adoption perspectives",
      color: "green",
      avatar: "MA",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
      icon: <Briefcase className="h-5 w-5 text-green-600" />,
      sentiment: "positive",
    },
    {
      id: "feature",
      name: "Feature Agent",
      role: "Evaluates product and technical feasibility",
      color: "blue",
      avatar: "FA",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
      icon: <Puzzle className="h-5 w-5 text-blue-600" />,
      sentiment: "neutral",
    },
    {
      id: "synthesis",
      name: "Synthesis Agent",
      role: "Integrates perspectives for holistic solutions",
      color: "purple",
      avatar: "SA",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
      icon: <Shuffle className="h-5 w-5 text-purple-600" />,
      sentiment: "mixed",
    },
    {
      id: "contrarian",
      name: "Contrarian Agent",
      role: "Challenges assumptions and identifies risks",
      color: "red",
      avatar: "CA",
      bgColor: "bg-red-100",
      textColor: "text-red-600",
      icon: <Shield className="h-5 w-5 text-red-600" />,
      sentiment: "negative",
    },
    {
      id: "fusion",
      name: "Fusion Agent",
      role: "Proposes creative integrations and hybrid solutions",
      color: "amber",
      avatar: "FU",
      bgColor: "bg-amber-100",
      textColor: "text-amber-600",
      icon: <Sparkles className="h-5 w-5 text-amber-600" />,
      sentiment: "positive",
    },
  ])

  const [messages, setMessages] = useState<DebateMessage[]>([])
  const [debateProgress, setDebateProgress] = useState(0)
  const [debateComplete, setDebateComplete] = useState(false)
  const [currentRound, setCurrentRound] = useState(1)
  const [typingAgentId, setTypingAgentId] = useState<string | null>(null)
  const [activeConnections, setActiveConnections] = useState<{ from: string; to: string }[]>([])
  const [topics, setTopics] = useState<DebateTopic[]>([
    { id: "viability", name: "Business Viability", color: "blue", messages: [] },
    { id: "technical", name: "Technical Feasibility", color: "purple", messages: [] },
    { id: "market", name: "Market Potential", color: "green", messages: [] },
    { id: "risks", name: "Risks & Challenges", color: "red", messages: [] },
    { id: "innovation", name: "Innovation Potential", color: "amber", messages: [] },
  ])
  const [activeTopics, setActiveTopics] = useState<string[]>([])
  const [agentActivity, setAgentActivity] = useState<{ [key: string]: number }>({
    market: 0,
    feature: 0,
    synthesis: 0,
    contrarian: 0,
    fusion: 0,
  })
  const [userConfidence, setUserConfidence] = useState<number | null>(null)
  const [showConfidencePrompt, setShowConfidencePrompt] = useState<boolean>(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const totalRounds = 3 // Match the backend's 3 rounds

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Simulate debate messages
  useEffect(() => {
    // Create a clean-up flag to handle component unmounting
    let isMounted = true

    const debateScript: { [key: number]: DebateMessage[] } = {
      1: [
        {
          id: "1-1",
          agentId: "market",
          content: `This feedback management solution has strong market potential. Our research indicates 78% of professionals struggle with scattered feedback across platforms. A centralized solution addresses a clear pain point with a growing TAM as remote work increases.`,
          timestamp: new Date(),
          keywords: ["market potential", "TAM", "remote work", "pain point"],
          sentiment: "positive",
          importance: 8,
          vote: 8,
          empiricalWeight: 0.7,
        },
        {
          id: "1-2",
          agentId: "contrarian",
          content: `While the market need exists, we must consider integration complexity. Each platform has unique APIs and data structures. Users may resist adding "yet another tool" to their workflow unless the value proposition is immediately clear.`,
          timestamp: new Date(),
          replyTo: "1-1",
          keywords: ["integration", "complexity", "APIs", "resistance"],
          sentiment: "negative",
          importance: 7,
          vote: 6,
          empiricalWeight: 0.8,
        },
        {
          id: "1-3",
          agentId: "feature",
          content: `From a technical perspective, we need a modular architecture that can handle diverse data sources. I recommend starting with email, Slack, and common project management tools as the initial integrations. AI-based prioritization is feasible but will require training data.`,
          timestamp: new Date(),
          replyTo: "1-2",
          keywords: ["architecture", "integrations", "AI", "prioritization"],
          sentiment: "neutral",
          importance: 8,
          vote: 7,
          empiricalWeight: 0.9,
        },
        {
          id: "1-4",
          agentId: "fusion",
          content: `What if we combine the inbox paradigm with a CRM-style pipeline? Users could triage feedback through customizable stages like "Received," "Reviewing," "Implementing," and "Closed." This would provide structure while maintaining flexibility.`,
          timestamp: new Date(),
          keywords: ["inbox", "CRM", "pipeline", "triage"],
          sentiment: "positive",
          importance: 9,
          vote: 8,
          empiricalWeight: 0.6,
        },
        {
          id: "1-5",
          agentId: "synthesis",
          content: `Balancing all perspectives, I see a path forward: start with a lightweight integration layer focused on the most common platforms, provide immediate value through smart organization, and gradually introduce AI features as we collect user data. This addresses both market needs and technical constraints.`,
          timestamp: new Date(),
          keywords: ["balance", "integration", "value", "gradual"],
          sentiment: "mixed",
          importance: 8,
          vote: 7,
          empiricalWeight: 0.8,
        },
      ],
      2: [
        {
          id: "2-1",
          agentId: "contrarian",
          content: `I'm concerned about the cold start problem for AI prioritization. Without sufficient training data, early users may find the prioritization unreliable, undermining trust. We should consider a hybrid approach where manual prioritization feeds the AI model over time.`,
          timestamp: new Date(),
          replyTo: "1-3",
          keywords: ["cold start", "AI", "trust", "hybrid approach"],
          sentiment: "negative",
          importance: 8,
          vote: 5,
          empiricalWeight: 0.8,
          changeLog: "Reduced vote from 6 to 5 due to cold start concerns",
        },
        {
          id: "2-2",
          agentId: "feature",
          content: `Valid point. We could implement a confidence score for AI recommendations and default to simple heuristics (sender role, explicit deadlines, keywords) until we have sufficient data. This maintains value while building toward more sophisticated prioritization.`,
          timestamp: new Date(),
          replyTo: "2-1",
          keywords: ["confidence score", "heuristics", "value", "prioritization"],
          sentiment: "neutral",
          importance: 7,
          vote: 7,
          empiricalWeight: 0.9,
          changeLog: "Vote unchanged as solution addresses the concern",
        },
        {
          id: "2-3",
          agentId: "market",
          content: `Market research shows 62% of users would value integration with their existing workflow tools rather than requiring yet another dashboard to check. We should prioritize seamless integration over building a standalone destination.`,
          timestamp: new Date(),
          keywords: ["integration", "workflow", "dashboard", "seamless"],
          sentiment: "mixed",
          importance: 8,
          vote: 7,
          empiricalWeight: 0.8,
          changeLog: "Adjusted vote from 8 to 7 based on integration complexity",
        },
        {
          id: "2-4",
          agentId: "fusion",
          content: `What if we take inspiration from email clients that offer both a unified inbox and folder/label organization? Users could view all feedback in one place or filter by source, priority, or custom tags. This provides flexibility while maintaining centralization.`,
          timestamp: new Date(),
          keywords: ["email client", "unified inbox", "filter", "flexibility"],
          sentiment: "positive",
          importance: 8,
          vote: 9,
          empiricalWeight: 0.7,
          changeLog: "Increased vote from 8 to 9 as this addresses multiple concerns",
        },
        {
          id: "2-5",
          agentId: "synthesis",
          content: `The emerging consensus points to a flexible system with strong integrations, progressive AI features, and familiar UI patterns. We should focus on reducing friction in the feedback collection process while providing immediate organizational value.`,
          timestamp: new Date(),
          keywords: ["consensus", "flexible", "integrations", "friction"],
          sentiment: "positive",
          importance: 9,
          vote: 8,
          empiricalWeight: 0.8,
          changeLog: "Increased vote from 7 to 8 as solution clarity improves",
        },
      ],
      3: [
        {
          id: "3-1",
          agentId: "market",
          content: `After reviewing all perspectives, I believe a browser extension with API integrations offers the best market entry strategy. It's low-friction for users, can capture feedback across platforms, and provides immediate value. We should position it as "feedback that never falls through the cracks."`,
          timestamp: new Date(),
          keywords: ["browser extension", "API", "market entry", "positioning"],
          sentiment: "positive",
          importance: 9,
          vote: 8,
          empiricalWeight: 0.9,
          changeLog: "Increased vote from 7 to 8 as implementation strategy clarified",
        },
        {
          id: "3-2",
          agentId: "feature",
          content: `I agree with the browser extension approach for desktop, but we need a mobile strategy as well. I recommend a lightweight email forwarding solution where users can BCC a dedicated address to capture feedback from mobile apps. This provides cross-platform coverage with minimal technical overhead.`,
          timestamp: new Date(),
          replyTo: "3-1",
          keywords: ["browser extension", "mobile", "email forwarding", "cross-platform"],
          sentiment: "neutral",
          importance: 8,
          vote: 8,
          empiricalWeight: 0.9,
          changeLog: "Increased vote from 7 to 8 with addition of mobile strategy",
        },
        {
          id: "3-3",
          agentId: "contrarian",
          content: `While I see the merit in this approach, we must address privacy concerns. Users may be hesitant about a browser extension that can "see" all their communications. We need clear permissions, transparent data handling, and possibly local processing of sensitive content.`,
          timestamp: new Date(),
          replyTo: "3-2",
          keywords: ["privacy", "permissions", "transparency", "local processing"],
          sentiment: "negative",
          importance: 8,
          vote: 6,
          empiricalWeight: 0.8,
          changeLog: "Increased vote from 5 to 6 as implementation addresses some concerns",
        },
        {
          id: "3-4",
          agentId: "fusion",
          content: `What if we combine the browser extension with smart templates? Users could quickly categorize feedback as they capture it, teaching the AI while adding structure. This addresses the cold start problem while providing immediate value through organization.`,
          timestamp: new Date(),
          keywords: ["browser extension", "templates", "categorization", "cold start"],
          sentiment: "positive",
          importance: 9,
          vote: 9,
          empiricalWeight: 0.8,
          changeLog: "Vote unchanged as this reinforces previous recommendation",
        },
        {
          id: "3-5",
          agentId: "synthesis",
          content: `Our final recommendation is a dual-approach system: a browser extension with smart capture for desktop users and email forwarding for mobile. Both feed into a unified backend with progressive AI features that learn from user interactions. Privacy controls, familiar UI patterns, and seamless integration with existing tools should be prioritized.`,
          timestamp: new Date(),
          keywords: ["browser extension", "email forwarding", "unified", "privacy"],
          sentiment: "positive",
          importance: 10,
          vote: 9,
          empiricalWeight: 0.9,
          changeLog: "Increased vote from 8 to 9 as final solution addresses all key concerns",
        },
      ],
    }

    // Calculate total messages for progress tracking
    const round1Length = debateScript[1]?.length || 0
    const round2Length = debateScript[2]?.length || 0
    const round3Length = debateScript[3]?.length || 0
    const totalMessages = round1Length + round2Length + round3Length

    // Function to simulate typing and add the next message
    let messageCounter = 0

    const simulateTypingAndAddMessage = (message: DebateMessage) => {
      if (!isMounted) return

      // Set the agent as typing
      setTypingAgentId(message.agentId)

      // If this is a reply, show a connection
      if (message.replyTo) {
        setActiveConnections([{ from: message.replyTo, to: message.id }])
      } else {
        setActiveConnections([])
      }

      // Simulate typing delay based on message length
      const typingDelay = Math.min(1500, 500 + message.content.length / 10)

      setTimeout(() => {
        if (!isMounted) return

        // Stop typing and add the message
        setTypingAgentId(null)
        setMessages((prev) => [...prev, message])
        setActiveConnections([])

        // Update agent activity
        setAgentActivity((prev) => ({
          ...prev,
          [message.agentId]: (prev[message.agentId] || 0) + 1,
        }))

        // Update topics
        updateTopics(message)

        // Update progress
        const progress = ((messageCounter + 1) / totalMessages) * 100
        setDebateProgress(progress)

        // Increment counter for next message
        messageCounter++

        // Check if debate is complete
        if (messageCounter >= totalMessages) {
          setTimeout(() => {
            setShowConfidencePrompt(true)
          }, 1000)
        } else {
          // Schedule next message with a pause between messages
          scheduleNextMessage()
        }
      }, typingDelay)
    }

    // Function to update topics based on message keywords
    const updateTopics = (message: DebateMessage) => {
      const newTopics = [...topics]

      // Map keywords to topics
      const topicMapping: { [key: string]: string[] } = {
        viability: ["market potential", "TAM", "business", "revenue", "pricing", "monetization"],
        technical: ["architecture", "implementation", "complexity", "development", "technical", "integration"],
        market: ["market entry", "positioning", "user", "customer", "adoption", "competition"],
        risks: ["privacy", "challenges", "concerns", "security", "risks", "cold start"],
        innovation: ["browser extension", "templates", "flexibility", "hybrid", "fusion"],
      }

      // Find which topics this message belongs to
      const messageTopics: string[] = []

      Object.entries(topicMapping).forEach(([topicId, keywords]) => {
        const hasMatchingKeyword = message.keywords.some((keyword) =>
          keywords.some((topicKeyword) => keyword.toLowerCase().includes(topicKeyword.toLowerCase())),
        )

        if (hasMatchingKeyword) {
          const topicIndex = newTopics.findIndex((t) => t.id === topicId)
          if (topicIndex !== -1) {
            newTopics[topicIndex].messages.push(message.id)
            messageTopics.push(topicId)
          }
        }
      })

      setTopics(newTopics)
      setActiveTopics(messageTopics)
    }

    // Function to determine which message to add next and schedule it
    const scheduleNextMessage = () => {
      if (!isMounted) return

      // Determine which round we're in based on messageCounter
      let currentRoundLocal = 1
      let roundIndex = messageCounter

      if (messageCounter >= round1Length) {
        if (messageCounter >= round1Length + round2Length) {
          currentRoundLocal = 3
          roundIndex = messageCounter - (round1Length + round2Length)
        } else {
          currentRoundLocal = 2
          roundIndex = messageCounter - round1Length
        }
      }

      // Update the round state if it changed
      if (currentRoundLocal !== currentRound) {
        setCurrentRound(currentRoundLocal)

        // Add a longer pause between rounds
        setTimeout(() => {
          if (!isMounted) return

          // Get the message for the current round and index
          const roundMessages = debateScript[currentRoundLocal] || []
          if (roundIndex < roundMessages.length) {
            const messageToAdd = roundMessages[roundIndex]
            if (messageToAdd && messageToAdd.agentId) {
              simulateTypingAndAddMessage(messageToAdd)
            }
          }
        }, 1500) // Longer pause between rounds
      } else {
        // Get the message for the current round and index
        const roundMessages = debateScript[currentRoundLocal] || []
        if (roundIndex < roundMessages.length) {
          const messageToAdd = roundMessages[roundIndex]
          if (messageToAdd && messageToAdd.agentId) {
            // Add a natural pause between messages
            setTimeout(() => {
              if (!isMounted) return
              simulateTypingAndAddMessage(messageToAdd)
            }, 800) // Natural pause between messages
          }
        }
      }
    }

    // Start the message sequence
    if (totalMessages > 0) {
      setTimeout(() => {
        scheduleNextMessage()
      }, 1000)
    }

    // Clean up function
    return () => {
      isMounted = false
    }
  }, []) // Empty dependency array since we want this to run only once on mount

  const getAgentById = (id: string) => {
    if (!id) return agents[0] // Return default agent if id is undefined
    return agents.find((agent) => agent.id === id) || agents[0]
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-500"
      case "negative":
        return "bg-red-500"
      case "neutral":
        return "bg-blue-500"
      case "mixed":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  const getMessageById = (id: string) => {
    return messages.find((message) => message.id === id)
  }

  const renderConnectionLines = () => {
    if (activeConnections.length === 0) return null

    return activeConnections.map(({ from, to }, index) => {
      const fromMessage = getMessageById(from)
      const fromAgent = fromMessage ? getAgentById(fromMessage.agentId) : null

      if (!fromAgent) return null

      return (
        <div
          key={`connection-${index}`}
          className={`absolute left-8 h-8 w-0.5 ${fromAgent.bgColor} animate-pulse`}
          style={{
            top: "-8px",
            opacity: 0.7,
          }}
        />
      )
    })
  }

  const renderTopicBadges = (messageId: string) => {
    const messageTopics = topics.filter((topic) => topic.messages.includes(messageId)).map((topic) => topic.id)

    if (messageTopics.length === 0) return null

    // Map topic colors to Tailwind classes
    const borderColorMap: Record<string, string> = {
      blue: "border-blue-200",
      purple: "border-purple-200",
      green: "border-green-200",
      red: "border-red-200",
      amber: "border-amber-200",
    }

    const bgColorMap: Record<string, string> = {
      blue: "bg-blue-50",
      purple: "bg-purple-50",
      green: "bg-green-50",
      red: "bg-red-50",
      amber: "bg-amber-50",
    }

    const textColorMap: Record<string, string> = {
      blue: "text-blue-700",
      purple: "text-purple-700",
      green: "text-green-700",
      red: "text-red-700",
      amber: "text-amber-700",
    }

    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {messageTopics.map((topicId) => {
          const topic = topics.find((t) => t.id === topicId)
          if (!topic) return null

          return (
            <Badge
              key={topicId}
              variant="outline"
              className={`text-xs px-1.5 py-0 ${borderColorMap[topic.color]} ${bgColorMap[topic.color]} ${textColorMap[topic.color]}`}
            >
              {topic.name}
            </Badge>
          )
        })}
      </div>
    )
  }

  const renderAgentActivityChart = () => {
    const maxActivity = Math.max(...Object.values(agentActivity))

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium mb-2">Agent Participation</h4>
        <div className="space-y-2">
          {agents.map((agent) => {
            const activity = agentActivity[agent.id] || 0
            const percentage = maxActivity > 0 ? (activity / maxActivity) * 100 : 0

            // Map color names to actual Tailwind classes
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
                      style={{
                        width: `${percentage}%`,
                      }}
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
        <h4 className="text-sm font-medium mb-2">Topic Distribution</h4>
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => {
            const messageCount = topic.messages.length
            const size = 30 + messageCount * 5

            // Map color names to actual Tailwind classes
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
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                }}
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

  const handleConfidenceRating = (rating: number) => {
    setUserConfidence(rating)
    setShowConfidencePrompt(false)

    // If confidence is high enough, complete the debate
    if (rating >= 4) {
      setDebateComplete(true)
    } else {
      // Otherwise, simulate a targeted reanalysis round
      setTimeout(() => {
        const targetedReanalysis: DebateMessage = {
          id: "targeted-1",
          agentId: "synthesis",
          content: `Based on your feedback, I'm conducting a targeted reanalysis. The main concerns appear to be around integration complexity and privacy. Let me address these specifically: 
          
          For integration, we recommend a phased approach starting with the most common platforms (email, Slack, Google Docs) and expanding based on user demand. This reduces initial complexity while providing immediate value.
          
          For privacy, we propose local processing of sensitive content with clear opt-in controls for what gets analyzed. Users would have granular permissions for each integration point.
          
          Does this address your concerns?`,
          timestamp: new Date(),
          keywords: ["integration", "privacy", "phased approach", "local processing"],
          sentiment: "positive",
          importance: 10,
          vote: 9,
          empiricalWeight: 0.9,
        }

        setTypingAgentId("synthesis")
        setTimeout(() => {
          setTypingAgentId(null)
          setMessages((prev) => [...prev, targetedReanalysis])
          setDebateComplete(true)
        }, 2000)
      }, 1000)
    }
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
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Debate Progress</span>
              <span className="text-sm text-gray-500">
                Round {currentRound} of {totalRounds}
              </span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-500 ease-out progress-bar-animated"
                style={{ width: `${debateProgress}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="flex flex-wrap gap-2 mb-4">
                {agents.map((agent) => (
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
                        const isActive = activeTopics.includes(topic.id)

                        // Map colors to Tailwind classes
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
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                              isActive ? activeColorMap[topic.color] : "bg-gray-300"
                            }`}
                            title={topic.name}
                          />
                        )
                      })}
                    </div>
                  </h3>
                </div>
                <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                  {messages.map((message) => {
                    if (!message || !message.agentId) return null // Skip rendering if message or agentId is undefined
                    const agent = getAgentById(message.agentId)
                    return (
                      <div key={message.id} className="space-y-1 animate-fade-in">
                        <div className="flex items-center space-x-2">
                          <Avatar className={`${agent.bgColor} ${agent.textColor} border-2 border-${agent.color}-200`}>
                            <AvatarFallback>{agent.avatar}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="font-medium">{agent.name}</div>
                              <div className="flex items-center space-x-1">
                                <div
                                  className={`w-2 h-2 rounded-full ${getSentimentColor(message.sentiment)}`}
                                  title={`Sentiment: ${message.sentiment}`}
                                />
                                <div className="flex">
                                  {Array.from({ length: Math.min(5, Math.ceil(message.importance / 2)) }).map(
                                    (_, i) => (
                                      <Zap
                                        key={i}
                                        className={`h-3 w-3 text-${agent.color}-${i < (message.importance / 2) ? "500" : "300"}`}
                                      />
                                    ),
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">{agent.role}</div>
                          </div>
                        </div>
                        <div
                          className={`pl-8 text-sm p-3 rounded-lg ml-6 bg-${agent.color}-50 border-l-2 border-${agent.color}-200 agent-card-${agent.id} relative`}
                          id={message.id}
                        >
                          {message.replyTo && (
                            <div className="absolute left-0 top-0 h-full">{renderConnectionLines()}</div>
                          )}
                          {message.content}
                          {renderTopicBadges(message.id)}

                          {message.vote !== undefined && (
                            <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Scale className="h-3.5 w-3.5 text-gray-500" />
                                <span className="text-xs text-gray-600">Vote: {message.vote}/10</span>
                              </div>
                              {message.changeLog && (
                                <span className="text-xs text-gray-500 italic">{message.changeLog}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {messages.length === 0 && !typingAgentId && (
                    <div className="text-center py-8 text-gray-500">
                      <p>Agents are preparing to debate your idea...</p>
                      <div className="flex justify-center space-x-2 mt-2">
                        <div
                          className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {typingAgentId && (
                    <div className="space-y-1 animate-fade-in">
                      <div className="flex items-center space-x-2">
                        <Avatar
                          className={`${getAgentById(typingAgentId).bgColor} ${getAgentById(typingAgentId).textColor} border-2 border-${getAgentById(typingAgentId).color}-200`}
                        >
                          <AvatarFallback>{getAgentById(typingAgentId).avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{getAgentById(typingAgentId).name}</div>
                          <div className="text-xs text-gray-500">{getAgentById(typingAgentId).role}</div>
                        </div>
                      </div>
                      <div
                        className={`pl-8 text-sm p-3 rounded-lg ml-6 bg-${getAgentById(typingAgentId).color}-50 border-l-2 border-${getAgentById(typingAgentId).color}-200 relative`}
                      >
                        {activeConnections.length > 0 && (
                          <div className="absolute left-0 top-0 h-full">{renderConnectionLines()}</div>
                        )}
                        <span className="inline-flex space-x-1">
                          <span className="typing-dot"></span>
                          <span className="typing-dot"></span>
                          <span className="typing-dot"></span>
                        </span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
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
                <CardContent className="p-4">
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
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${currentRound >= 1 ? "bg-green-500" : "bg-gray-300"}`}></div>
                    <div className="text-sm flex-1">Initial perspectives shared</div>
                    {currentRound >= 1 && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${currentRound >= 2 ? "bg-green-500" : "bg-gray-300"}`}></div>
                    <div className="text-sm flex-1">Challenges and solutions discussed</div>
                    {currentRound >= 2 && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${currentRound >= 3 ? "bg-green-500" : "bg-gray-300"}`}></div>
                    <div className="text-sm flex-1">Consensus and recommendations formed</div>
                    {currentRound >= 3 && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Confidence Rating Prompt */}
        {showConfidencePrompt && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg animate-fade-in">
            <h3 className="text-lg font-medium mb-2 text-blue-800">How confident are you in these results?</h3>
            <p className="text-sm text-blue-700 mb-4">
              Your feedback helps us improve the quality of our recommendations.
            </p>
            <div className="flex justify-center space-x-3">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Button
                  key={rating}
                  variant={userConfidence === rating ? "default" : "outline"}
                  className={`h-12 w-12 rounded-full ${userConfidence === rating ? "bg-blue-600" : ""}`}
                  onClick={() => handleConfidenceRating(rating)}
                >
                  {rating}
                </Button>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-blue-700">
              <span>Not confident</span>
              <span>Very confident</span>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          onClick={onComplete}
          disabled={!debateComplete}
          className="w-full shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 bg-gradient-to-r from-green-500 to-green-600"
        >
          Generate Final Report
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
