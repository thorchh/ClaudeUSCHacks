"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Brain, CheckCircle2, Lightbulb, Search, Zap, BarChart3, Users, Database } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import PoweredByBadge from "@/components/powered-by-badge"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

interface ResearchPhaseProps {
  idea: string
  onComplete: () => void
}

interface ResearchArea {
  id: string
  name: string
  description: string
  progress: number
  complete: boolean
  insights: ResearchInsight[]
  icon: React.ReactNode
  color: string
  sources: number
}

interface ResearchAgent {
  id: string
  name: string
  avatar: string
  color: string
  specialization: string
  currentArea: string | null
  status: "searching" | "analyzing" | "idle"
  currentQuery?: string
}

interface ResearchInsight {
  id: string
  areaId: string
  content: string
  importance: number
  source: string
  timestamp: Date
  agentId: string
  tags: string[]
}

interface ResearchStream {
  id: string
  areaId: string
  agentId: string
  query: string
  status: "active" | "complete"
  startTime: Date
  endTime?: Date
  resultCount: number
}

export default function ResearchPhase({ idea, onComplete }: ResearchPhaseProps) {
  const streamEndRef = useRef<HTMLDivElement>(null)

  const [researchAreas, setResearchAreas] = useState<ResearchArea[]>([
    {
      id: "psychology",
      name: "Psychology",
      description: "Analyzing psychological factors and user behavior",
      progress: 0,
      complete: false,
      insights: [],
      icon: <Lightbulb className="h-5 w-5 text-purple-600" />,
      color: "purple",
      sources: 0,
    },
    {
      id: "economics",
      name: "Economics",
      description: "Evaluating economic viability and market potential",
      progress: 0,
      complete: false,
      insights: [],
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 text-blue-600"
        >
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      color: "blue",
      sources: 0,
    },
    {
      id: "market",
      name: "Market Research",
      description: "Identifying target audience and competitive landscape",
      progress: 0,
      complete: false,
      insights: [],
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 text-green-600"
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      ),
      color: "green",
      sources: 0,
    },
    {
      id: "technology",
      name: "Technology",
      description: "Assessing technical feasibility and implementation",
      progress: 0,
      complete: false,
      insights: [],
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 text-indigo-600"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
      color: "indigo",
      sources: 0,
    },
    {
      id: "trends",
      name: "Trends & Future",
      description: "Analyzing future trends and long-term potential",
      progress: 0,
      complete: false,
      insights: [],
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 text-amber-600"
        >
          <path d="M12 20v-6M6 20V10M18 20V4" />
        </svg>
      ),
      color: "amber",
      sources: 0,
    },
  ])

  const [researchAgents] = useState<ResearchAgent[]>([
    {
      id: "agent1",
      name: "DataMiner",
      avatar: "DM",
      color: "blue",
      specialization: "Data Analysis",
      currentArea: "economics",
      status: "searching",
      currentQuery: "Subscription model analysis",
    },
    {
      id: "agent2",
      name: "TechScout",
      avatar: "TS",
      color: "indigo",
      specialization: "Technology Assessment",
      currentArea: "technology",
      status: "analyzing",
      currentQuery: "Multi-agent architecture",
    },
    {
      id: "agent3",
      name: "MarketSense",
      avatar: "MS",
      color: "green",
      specialization: "Market Analysis",
      currentArea: "market",
      status: "searching",
      currentQuery: "Competitor analysis",
    },
    {
      id: "agent4",
      name: "PsychProbe",
      avatar: "PP",
      color: "purple",
      specialization: "Behavioral Insights",
      currentArea: "psychology",
      status: "analyzing",
      currentQuery: "User motivation patterns",
    },
    {
      id: "agent5",
      name: "TrendWatcher",
      avatar: "TW",
      color: "amber",
      specialization: "Future Forecasting",
      currentArea: "trends",
      status: "searching",
      currentQuery: "AI innovation trajectory",
    },
    {
      id: "agent6",
      name: "CompScanner",
      avatar: "CS",
      color: "green",
      specialization: "Competitive Intelligence",
      currentArea: "market",
      status: "searching",
      currentQuery: "Market size estimation",
    },
    {
      id: "agent7",
      name: "PsychAnalyst",
      avatar: "PA",
      color: "purple",
      specialization: "Cognitive Analysis",
      currentArea: "psychology",
      status: "analyzing",
      currentQuery: "Cognitive biases in ideation",
    },
    {
      id: "agent8",
      name: "TechArchitect",
      avatar: "TA",
      color: "indigo",
      specialization: "System Design",
      currentArea: "technology",
      status: "searching",
      currentQuery: "Frontend visualization techniques",
    },
    {
      id: "agent9",
      name: "MarketDemog",
      avatar: "MD",
      color: "green",
      specialization: "Demographics",
      currentArea: "market",
      status: "analyzing",
      currentQuery: "User demographics",
    },
  ])

  const [researchStreams, setResearchStreams] = useState<ResearchStream[]>([])
  const [streamActivity, setStreamActivity] = useState<
    {
      id: string
      areaId: string
      agentId: string
      message: string
      timestamp: Date
    }[]
  >([])

  const [overallProgress, setOverallProgress] = useState(0)
  const [researchComplete, setResearchComplete] = useState(false)
  const [selectedArea, setSelectedArea] = useState<string | null>(null)
  const [discoveryCount, setDiscoveryCount] = useState(0)
  const [totalSources, setTotalSources] = useState(0)
  const [activeAgents, setActiveAgents] = useState(researchAgents.length)

  // Auto-scroll to bottom of stream activity
  useEffect(() => {
    streamEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [streamActivity])

  // Canvas setup and animation
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null)
  const animationRef = useRef<number>(0)
  const particlesRef = useRef<any[]>([])
  const lastUpdateRef = useRef<number>(0)

  const [researchNodes, setResearchNodes] = useState<any[]>([])
  const [connections, setConnections] = useState<any[]>([])
  const [activeInsight, setActiveInsight] = useState<string | null>(null)
  const [latestDiscoveries, setLatestDiscoveries] = useState<
    {
      areaId: string
      content: string
      timestamp: Date
    }[]
  >([])

  // Generate initial research nodes
  useEffect(() => {
    // Canvas setup and animation
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")

      if (ctx) {
        // Set canvas dimensions
        canvas.width = canvas.offsetWidth
        canvas.height = canvas.offsetHeight

        setContext(ctx)

        // Initialize particles
        initParticles()

        // Start animation loop
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [])

  // Simulate research progress
  useEffect(() => {
    const interval = setInterval(() => {
      if (researchComplete) {
        clearInterval(interval)
        return
      }

      // Update research areas progress
      setResearchAreas((prev) => {
        const updated = [...prev]
        let allComplete = true

        updated.forEach((area) => {
          if (!area.complete) {
            // Simulate different research speeds for different areas
            const increment = Math.random() * 5 + 3
            area.progress = Math.min(100, area.progress + increment)

            // Check if this area is complete
            if (area.progress >= 100 && !area.complete) {
              area.complete = true
              area.progress = 100
            }
          }

          if (!area.complete) {
            allComplete = false
          }
        })

        // Calculate overall progress
        const totalProgress = updated.reduce((sum, area) => sum + area.progress, 0)
        const avgProgress = totalProgress / updated.length
        setOverallProgress(avgProgress)

        if (allComplete && !researchComplete) {
          setResearchComplete(true)
        }

        return updated
      })

      // Randomly add new research streams
      if (Math.random() < 0.15) {
        addNewResearchStream()
      }

      // Randomly complete existing streams
      const activeStreams = researchStreams.filter((s) => s.status === "active")
      if (activeStreams.length > 0 && Math.random() < 0.2) {
        const streamToComplete = activeStreams[Math.floor(Math.random() * activeStreams.length)]
        completeResearchStream(streamToComplete.id)
      }

      // Randomly add stream activity
      if (Math.random() < 0.3) {
        addStreamActivity()
      }

      // Randomly discover insights
      if (Math.random() < 0.2) {
        discoverInsight()
      }
    }, 500)

    return () => clearInterval(interval)
  }, [researchStreams, researchComplete])

  // Add a new research stream
  const addNewResearchStream = () => {
    // Find available agents
    const availableAgents = researchAgents.filter(
      (agent) => !researchStreams.some((stream) => stream.status === "active" && stream.agentId === agent.id),
    )

    if (availableAgents.length === 0) return

    const agent = availableAgents[Math.floor(Math.random() * availableAgents.length)]
    const areaId = agent.currentArea || researchAreas[Math.floor(Math.random() * researchAreas.length)].id

    // Get search queries for this area
    const queries = getSearchQueries(areaId)
    const query = queries[Math.floor(Math.random() * queries.length)]

    const newStream: ResearchStream = {
      id: `stream-${Date.now()}`,
      areaId,
      agentId: agent.id,
      query,
      status: "active",
      startTime: new Date(),
      resultCount: 0,
    }

    setResearchStreams((prev) => [...prev, newStream])

    // Add stream start activity
    setStreamActivity((prev) => [
      ...prev,
      {
        id: `activity-${Date.now()}`,
        areaId,
        agentId: agent.id,
        message: `Started researching: "${query}"`,
        timestamp: new Date(),
      },
    ])
  }

  // Complete a research stream
  const completeResearchStream = (streamId: string) => {
    setResearchStreams((prev) => {
      return prev.map((stream) => {
        if (stream.id === streamId) {
          const resultCount = Math.floor(Math.random() * 10) + 1

          // Update sources count for this area
          setResearchAreas((areas) => {
            return areas.map((area) => {
              if (area.id === stream.areaId) {
                return {
                  ...area,
                  sources: area.sources + resultCount,
                }
              }
              return area
            })
          })

          // Update total sources
          setTotalSources((prev) => prev + resultCount)

          // Add stream completion activity
          setStreamActivity((prev) => [
            ...prev,
            {
              id: `activity-${Date.now()}`,
              areaId: stream.areaId,
              agentId: stream.agentId,
              message: `Found ${resultCount} sources for "${stream.query}"`,
              timestamp: new Date(),
            },
          ])

          return {
            ...stream,
            status: "complete",
            endTime: new Date(),
            resultCount,
          }
        }
        return stream
      })
    })
  }

  // Add stream activity
  const addStreamActivity = () => {
    const activeStreams = researchStreams.filter((s) => s.status === "active")
    if (activeStreams.length === 0) return

    const stream = activeStreams[Math.floor(Math.random() * activeStreams.length)]
    const activities = [
      `Analyzing data for "${stream.query}"`,
      `Processing information from source #${Math.floor(Math.random() * 100) + 1}`,
      `Cross-referencing findings with existing research`,
      `Evaluating relevance of new information`,
      `Filtering results for "${stream.query}"`,
      `Extracting key insights from source material`,
      `Categorizing findings by relevance`,
      `Comparing with previous research data`,
      `Validating information from multiple sources`,
      `Identifying patterns in research data`,
    ]

    const message = activities[Math.floor(Math.random() * activities.length)]

    setStreamActivity((prev) => [
      ...prev,
      {
        id: `activity-${Date.now()}`,
        areaId: stream.areaId,
        agentId: stream.agentId,
        message,
        timestamp: new Date(),
      },
    ])
  }

  // Discover a new insight
  const discoverInsight = () => {
    // Pick a random area
    const areaIndex = Math.floor(Math.random() * researchAreas.length)
    const area = researchAreas[areaIndex]

    // Pick a random agent specializing in this area
    const areaAgents = researchAgents.filter((agent) => agent.currentArea === area.id)
    const agent =
      areaAgents.length > 0
        ? areaAgents[Math.floor(Math.random() * areaAgents.length)]
        : researchAgents[Math.floor(Math.random() * researchAgents.length)]

    // Get insights for this area
    const possibleInsights = getAreaInsights(area.id)

    // Check if we've already discovered all insights for this area
    const existingInsights = researchAreas[areaIndex].insights.map((i) => i.content)
    const availableInsights = possibleInsights.filter((insight) => !existingInsights.includes(insight))

    if (availableInsights.length === 0) return

    // Pick a random insight
    const insightContent = availableInsights[Math.floor(Math.random() * availableInsights.length)]

    // Create the insight
    const newInsight: ResearchInsight = {
      id: `insight-${Date.now()}`,
      areaId: area.id,
      content: insightContent,
      importance: Math.floor(Math.random() * 10) + 1,
      source: `Source #${Math.floor(Math.random() * 100) + 1}`,
      timestamp: new Date(),
      agentId: agent.id,
      tags: generateTags(area.id),
    }

    // Add the insight to the area
    setResearchAreas((prev) => {
      return prev.map((a) => {
        if (a.id === area.id) {
          return {
            ...a,
            insights: [...a.insights, newInsight],
          }
        }
        return a
      })
    })

    // Add insight discovery activity
    setStreamActivity((prev) => [
      ...prev,
      {
        id: `activity-${Date.now()}`,
        areaId: area.id,
        agentId: agent.id,
        message: `🔍 Discovered insight: "${insightContent.substring(0, 60)}${insightContent.length > 60 ? "..." : ""}"`,
        timestamp: new Date(),
      },
    ])

    // Update discovery count
    setDiscoveryCount((prev) => prev + 1)
  }

  // Generate tags for insights
  const generateTags = (areaId: string) => {
    const commonTags = ["research", "analysis", "insight"]

    const areaTags: { [key: string]: string[] } = {
      psychology: ["behavior", "motivation", "cognition", "user experience", "engagement"],
      economics: ["pricing", "revenue", "cost", "market", "value"],
      market: ["competition", "audience", "segment", "positioning", "demand"],
      technology: ["implementation", "architecture", "development", "integration", "performance"],
      trends: ["future", "growth", "innovation", "emerging", "forecast"],
    }

    const tags = [...commonTags]

    // Add 1-3 area-specific tags
    const specificTags = areaTags[areaId] || []
    const numTags = Math.floor(Math.random() * 3) + 1

    for (let i = 0; i < numTags && i < specificTags.length; i++) {
      const randomIndex = Math.floor(Math.random() * specificTags.length)
      const tag = specificTags[randomIndex]

      if (!tags.includes(tag)) {
        tags.push(tag)
      }

      // Remove the tag so we don't pick it again
      specificTags.splice(randomIndex, 1)
    }

    return tags
  }

  // Initialize particles for canvas animation
  const initParticles = () => {
    const particles = []

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * (canvasRef.current?.width || 800),
        y: Math.random() * (canvasRef.current?.height || 600),
        radius: Math.random() * 2 + 1,
        color: getRandomColor(),
        speedX: Math.random() * 2 - 1,
        speedY: Math.random() * 2 - 1,
        opacity: 0.3 + Math.random() * 0.3,
      })
    }

    particlesRef.current = particles
  }

  // Animation loop for canvas
  const animate = (timestamp: number) => {
    if (!context || !canvasRef.current) {
      animationRef.current = requestAnimationFrame(animate)
      return
    }

    // Limit updates to improve performance
    if (timestamp - lastUpdateRef.current < 30) {
      animationRef.current = requestAnimationFrame(animate)
      return
    }

    lastUpdateRef.current = timestamp

    // Clear canvas
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    // Draw connections between nodes
    drawConnections()

    // Draw particles
    updateAndDrawParticles()

    // Schedule next frame
    animationRef.current = requestAnimationFrame(animate)
  }

  // Draw connections between nodes
  const drawConnections = () => {
    if (!context) return

    connections.forEach((conn) => {
      const sourceNode = researchNodes.find((node) => node.id === conn.source)
      const targetNode = researchNodes.find((node) => node.id === conn.target)

      if (sourceNode && targetNode && (sourceNode.discovered || targetNode.discovered)) {
        // Only draw connections for discovered nodes
        if (sourceNode.discovered && targetNode.discovered) {
          context.beginPath()
          context.moveTo(sourceNode.position.x, sourceNode.position.y)
          context.lineTo(targetNode.position.x, targetNode.position.y)

          if (conn.active) {
            context.strokeStyle = "rgba(132, 90, 223, 0.7)"
            context.lineWidth = 2
          } else {
            context.strokeStyle = "rgba(200, 200, 200, 0.3)"
            context.lineWidth = 1
          }

          context.stroke()
        }
      }
    })
  }

  // Update and draw particles
  const updateAndDrawParticles = () => {
    if (!context || !canvasRef.current) return

    particlesRef.current.forEach((particle) => {
      // Update position
      particle.x += particle.speedX
      particle.y += particle.speedY

      // Wrap around canvas
      if (particle.x < 0) particle.x = canvasRef.current!.width
      if (particle.x > canvasRef.current!.width) particle.x = 0
      if (particle.y < 0) particle.y = canvasRef.current!.height
      if (particle.y > canvasRef.current!.height) particle.y = 0

      // Draw particle
      context.beginPath()
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
      context.fillStyle = `${particle.color}${Math.floor(particle.opacity * 255)
        .toString(16)
        .padStart(2, "0")}`
      context.fill()
    })
  }

  // Get random color for particles
  const getRandomColor = () => {
    const colors = ["#8257FC", "#3B82F6", "#10B981", "#F59E0B", "#EF4444"]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  // Get search terms for each research area
  const getSearchQueries = (areaId: string) => {
    switch (areaId) {
      case "psychology":
        return [
          "User motivation patterns",
          "Cognitive biases in ideation",
          "Decision-making frameworks",
          "Engagement psychology research",
          "Visual processing optimization",
          "Mental model formation",
          "Creative thinking patterns",
          "Psychological flow states",
          "User feedback interpretation",
          "Attention span optimization",
        ]
      case "economics":
        return [
          "Subscription model analysis",
          "Pricing strategy comparison",
          "Customer lifetime value",
          "Market entry cost analysis",
          "ROI forecasting models",
          "Competitive pricing intelligence",
          "Cost structure optimization",
          "Revenue projection scenarios",
          "Break-even analysis",
          "Value perception research",
        ]
      case "market":
        return [
          "Competitor analysis",
          "User demographics",
          "Market size estimation",
          "Segmentation analysis",
          "Competitive positioning map",
          "Customer journey mapping",
          "Feature comparison matrix",
          "Market penetration strategies",
          "User need categorization",
          "Brand perception analysis",
        ]
      case "technology":
        return [
          "Multi-agent architecture",
          "Frontend visualization techniques",
          "API integration strategies",
          "Data persistence solutions",
          "Performance optimization methodologies",
          "Scalability testing protocols",
          "UI component architecture",
          "State management patterns",
          "Security implementation review",
          "Cross-platform compatibility",
        ]
      case "trends":
        return [
          "AI innovation trajectory",
          "Future collaboration models",
          "Industry adoption forecasting",
          "Regulatory environment scanning",
          "Competitive technology roadmaps",
          "User experience evolution",
          "Integration ecosystem development",
          "Emerging market opportunities",
          "Platform expansion strategies",
          "Next-generation interfaces",
        ]
      default:
        return ["Generic search term", "Another search term"]
    }
  }

  // Update active searches for an area
  const updateActiveSearches = (areaId: string) => {
    const searchTerms = getSearchTerms(areaId)

    setResearchAreas((prev) => {
      return prev.map((area) => {
        if (area.id === areaId) {
          const activeCount = 1 + Math.floor(Math.random() * area.agentCount)
          const newSearches = []

          for (let i = 0; i < activeCount; i++) {
            const randomIndex = Math.floor(Math.random() * searchTerms.length)
            newSearches.push(searchTerms[randomIndex])
          }

          return {
            ...area,
            activeSearches: newSearches,
          }
        }
        return area
      })
    })
  }

  // Get predefined insights for each research area
  const getAreaInsights = (areaId: string) => {
    switch (areaId) {
      case "psychology":
        return [
          "Users prefer interactive brainstorming over passive consumption",
          "Visual progress indicators increase engagement by 37%",
          "Multiple perspectives reduce confirmation bias by 42%",
          "Decision fatigue sets in after 25 minutes of continuous ideation",
          "Color psychology affects perception of AI-generated ideas",
          "Users report 68% higher satisfaction with multi-stage processes",
          "Trust in AI recommendations increases with transparent reasoning",
          "Gamification elements improve sustained engagement by 52%",
          "Cognitive load optimizations increase retention of insights",
          "Social validation increases idea adoption by 43%",
        ]
      case "economics":
        return [
          "Subscription model offers 3.2x better LTV than one-time purchases",
          "Tiered pricing can increase revenue by 47% for creative tools",
          "ROI for AI brainstorming tools shows 27% improvement in innovation",
          "Average willingness to pay: $29/month for professional users",
          "Enterprise pricing should target 5x individual subscription rate",
          "Customer acquisition cost optimizations through referral programs",
          "Variable pricing based on usage metrics shows 34% higher conversion",
          "Competitive price point analysis suggests $19-39 monthly range",
          "Freemium conversion rates average 12% for productivity tools",
          "Cost structure favors cloud computing horizontal scaling",
        ]
      case "market":
        return [
          "Primary competitors focus on single-perspective solutions",
          "Market gap exists for multi-perspective AI brainstorming tools",
          "Target audience: product managers (37%), entrepreneurs (28%), researchers (18%)",
          "Market size: $3.2B growing at 24% CAGR",
          "Competitor analysis reveals weak visualization capabilities",
          "Differentiation opportunity in collaborative multi-agent systems",
          "User survey shows 72% dissatisfaction with existing solutions",
          "Enterprise adoption requires SOC2 compliance and data security",
          "Customer journey mapping reveals decision points at research phase",
          "Brand positioning opportunity as 'premium insight generation tool'",
        ]
      case "technology":
        return [
          "Multi-agent architecture requires custom orchestration layer",
          "Real-time debate visualization presents technical challenges",
          "Modular design allows for future expansion of capabilities",
          "Vector embeddings enable semantic connections between insights",
          "Technical stack comparison favors Next.js for frontend implementation",
          "API rate limits require efficient prompt management",
          "Data persistence strategies for multi-session brainstorming",
          "Performance optimization through asynchronous agent processing",
          "Frontend rendering optimizations for complex visualizations",
          "Mobile-responsive design considerations for cross-device usage",
        ]
      case "trends":
        return [
          "AI-assisted ideation market growing at 32% annually",
          "Integration with project management tools represents future opportunity",
          "Voice-based interaction could enhance accessibility",
          "Emerging trend: hybrid human-AI collaborative teams",
          "Regulatory considerations for AI-generated intellectual property",
          "Future expansion into vertical-specific knowledge domains",
          "Growing demand for explainable AI in decision support tools",
          "Cross-platform ecosystem development potential",
          "Opportunities in educational and research institutions",
          "Future integration with AR/VR for spatial brainstorming",
        ]
      default:
        return ["Generic insight 1", "Generic insight 2", "Generic insight 3"]
    }
  }

  // Get search terms for each research area
  const getSearchTerms = (areaId: string) => {
    switch (areaId) {
      case "psychology":
        return [
          "User motivation patterns",
          "Cognitive biases in ideation",
          "Decision-making frameworks",
          "Engagement psychology research",
          "Visual processing optimization",
          "Mental model formation",
          "Creative thinking patterns",
          "Psychological flow states",
          "User feedback interpretation",
          "Attention span optimization",
        ]
      case "economics":
        return [
          "Subscription model analysis",
          "Pricing strategy comparison",
          "Customer lifetime value",
          "Market entry cost analysis",
          "ROI forecasting models",
          "Competitive pricing intelligence",
          "Cost structure optimization",
          "Revenue projection scenarios",
          "Break-even analysis",
          "Value perception research",
        ]
      case "market":
        return [
          "Competitor analysis",
          "User demographics",
          "Market size estimation",
          "Segmentation analysis",
          "Competitive positioning map",
          "Customer journey mapping",
          "Feature comparison matrix",
          "Market penetration strategies",
          "User need categorization",
          "Brand perception analysis",
        ]
      case "technology":
        return [
          "Multi-agent architecture",
          "Frontend visualization techniques",
          "API integration strategies",
          "Data persistence solutions",
          "Performance optimization methodologies",
          "Scalability testing protocols",
          "UI component architecture",
          "State management patterns",
          "Security implementation review",
          "Cross-platform compatibility",
        ]
      case "trends":
        return [
          "AI innovation trajectory",
          "Future collaboration models",
          "Industry adoption forecasting",
          "Regulatory environment scanning",
          "Competitive technology roadmaps",
          "User experience evolution",
          "Integration ecosystem development",
          "Emerging market opportunities",
          "Platform expansion strategies",
          "Next-generation interfaces",
        ]
      default:
        return ["Generic search term", "Another search term"]
    }
  }

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
      default:
        return "border-l-gray-500"
    }
  }

  const getAgentCardClass = (agentId: string) => {
    const agent = researchAgents.find((a) => a.id === agentId)
    if (!agent) return ""

    switch (agent.color) {
      case "blue":
        return "bg-blue-50 border-blue-200 text-blue-700"
      case "indigo":
        return "bg-indigo-50 border-indigo-200 text-indigo-700"
      case "green":
        return "bg-green-50 border-green-200 text-green-700"
      case "purple":
        return "bg-purple-50 border-purple-200 text-purple-700"
      case "amber":
        return "bg-amber-50 border-amber-200 text-amber-700"
      default:
        return "bg-gray-50 border-gray-200 text-gray-700"
    }
  }

  const getAgentStatusIcon = (status: string) => {
    switch (status) {
      case "searching":
        return <Search className="h-3 w-3 animate-pulse" />
      case "analyzing":
        return <BarChart3 className="h-3 w-3 animate-pulse" />
      default:
        return <Zap className="h-3 w-3" />
    }
  }

  const getAreaColor = (areaId: string) => {
    const area = researchAreas.find((a) => a.id === areaId)
    return area ? area.color : "gray"
  }

  const getAgentById = (agentId: string) => {
    return researchAgents.find((a) => a.id === agentId) || researchAgents[0]
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
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-500">{activeAgents} Agents</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Database className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-500">{totalSources} Sources</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Lightbulb className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-500">{discoveryCount} Insights</span>
                </div>
              </div>
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
              {researchAreas.map((area) => (
                <Card
                  key={area.id}
                  className={`overflow-hidden border-l-4 transition-all duration-300 hover:shadow-md ${getCardColorClass(area.color)} ${area.complete ? "animate-float" : ""} ${selectedArea === area.id ? `ring-2 ring-${area.color}-400 ring-offset-2` : ""}`}
                  onClick={() => setSelectedArea(area.id === selectedArea ? null : area.id)}
                >
                  <CardHeader className="p-3 pb-2">
                    <CardTitle className="text-base flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`rounded-full bg-${area.color}-100 p-1 mr-2`}>{area.icon}</div>
                        <span>{area.name}</span>
                      </div>
                      {area.complete && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <p className="text-sm text-gray-500 mb-2">{area.description}</p>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progress</span>
                      <span>{Math.round(area.progress)}%</span>
                    </div>
                    <Progress
                      value={area.progress}
                      className="h-1.5 mb-3"
                      indicatorClassName={`bg-${area.color}-500`}
                    />

                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <div className="flex items-center">
                        <Database className="h-3 w-3 mr-1" />
                        <span>{area.sources} Sources</span>
                      </div>
                      <div className="flex items-center">
                        <Lightbulb className="h-3 w-3 mr-1" />
                        <span>{area.insights.length} Insights</span>
                      </div>
                    </div>

                    {area.insights.length > 0 && (
                      <div className="mt-2 pt-2 border-t">
                        <h4 className="text-xs font-medium mb-1 text-gray-500">Top Insights:</h4>
                        <ul className="text-sm space-y-1">
                          {area.insights.slice(0, 2).map((insight, index) => (
                            <li key={index} className="flex items-start">
                              <span className={`text-${area.color}-500 mr-2`}>•</span>
                              <span className="text-xs">{insight.content}</span>
                            </li>
                          ))}
                          {area.insights.length > 2 && (
                            <li className="text-xs text-blue-600 cursor-pointer hover:underline">
                              + {area.insights.length - 2} more insights
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Active agents in this area */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {researchAgents
                        .filter((agent) => agent.currentArea === area.id)
                        .map((agent) => (
                          <Badge
                            key={agent.id}
                            variant="outline"
                            className={`text-xs bg-${agent.color}-50 text-${agent.color}-700 border-${agent.color}-200`}
                          >
                            {agent.avatar}
                          </Badge>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border shadow-md overflow-hidden">
                <div className="p-3 bg-gray-50 border-b">
                  <h3 className="text-sm font-medium flex items-center">
                    <Users className="h-4 w-4 mr-1.5 text-blue-600" />
                    Research Agents
                  </h3>
                </div>
                <div className="p-3 max-h-60 overflow-y-auto custom-scrollbar">
                  <div className="space-y-2">
                    {researchAgents.map((agent) => {
                      const area = researchAreas.find((a) => a.id === agent.currentArea)
                      return (
                        <div
                          key={agent.id}
                          className={cn(
                            "p-2 rounded-lg border text-sm flex items-center justify-between",
                            getAgentCardClass(agent.id),
                            agent.status !== "idle" ? "border-l-4" : "",
                          )}
                        >
                          <div className="flex items-center">
                            <div
                              className={`h-6 w-6 rounded-full flex items-center justify-center bg-${agent.color}-200 text-${agent.color}-700 text-xs mr-2`}
                            >
                              {agent.avatar}
                            </div>
                            <div>
                              <span className="font-medium">{agent.name}</span>
                              <p className="text-xs opacity-70">{agent.specialization}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            {area && (
                              <Badge
                                variant="outline"
                                className={`text-xs mr-2 bg-${area.color}-50 text-${area.color}-700 border-${area.color}-200`}
                              >
                                {area.name}
                              </Badge>
                            )}
                            <div
                              className={`rounded-full p-1 ${agent.status === "searching" ? "bg-green-100 text-green-700" : agent.status === "analyzing" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}
                            >
                              {getAgentStatusIcon(agent.status)}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border shadow-md overflow-hidden">
                <div className="p-3 bg-gray-50 border-b">
                  <h3 className="text-sm font-medium flex items-center">
                    <Search className="h-4 w-4 mr-1.5 text-blue-600" />
                    Latest Research Results
                  </h3>
                </div>
                <div className="p-3 max-h-60 overflow-y-auto custom-scrollbar">
                  <div className="space-y-2">
                    {researchStreams
                      .filter((stream) => stream.status === "complete")
                      .slice(0, 5) // Show only the 5 most recent results
                      .map((stream) => {
                        const agent = getAgentById(stream.agentId)
                        const areaColor = getAreaColor(stream.areaId)

                        return (
                          <div
                            key={stream.id}
                            className={`p-2 rounded-lg border-l-4 border-${areaColor}-400 bg-${areaColor}-50 text-sm`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div
                                  className={`h-5 w-5 rounded-full flex items-center justify-center bg-${agent.color}-200 text-${agent.color}-700 text-xs mr-2`}
                                >
                                  {agent.avatar}
                                </div>
                                <span className="font-medium">{agent.name}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Complete
                              </Badge>
                            </div>
                            <div className="mt-1 flex items-center">
                              <Search className="h-3 w-3 mr-1 text-gray-500" />
                              <p className="text-xs">{stream.query}</p>
                            </div>
                            <div className="mt-1 flex items-center text-xs text-gray-500">
                              <Database className="h-3 w-3 mr-1" />
                              <span>{stream.resultCount} sources found</span>
                            </div>
                          </div>
                        )
                      })}

                    {researchStreams.filter((stream) => stream.status === "complete").length === 0 && (
                      <div className="text-sm text-gray-500 py-4 text-center">No completed research yet</div>
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
          onClick={onComplete}
          disabled={!researchComplete}
          className="w-full shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 bg-gradient-to-r from-blue-500 to-blue-600"
        >
          Move to Multi-Agent Debate Phase
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
