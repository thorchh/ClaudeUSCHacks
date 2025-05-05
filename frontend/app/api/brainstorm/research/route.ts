import { NextRequest, NextResponse } from 'next/server';

// Mock research data for initial GET
const researchAreas = [
  {
    id: "psychology",
    name: "Psychology",
    description: "Analyzing psychological factors and user behavior",
    progress: 0,
    complete: false,
    insights: [],
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
    color: "amber",
    sources: 0,
  },
];

const researchAgents = [
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
];

export async function GET() {
  return NextResponse.json({ researchAreas, researchAgents });
}

// Handles user input for the research phase
export async function POST(req: NextRequest) {
  const data = await req.json();
  // TODO: Process research input and update progress
  return NextResponse.json({ message: 'Research input received', data });
}
