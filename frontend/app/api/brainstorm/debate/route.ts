import { NextRequest, NextResponse } from 'next/server';

// Mock debate data for GET
const agents = [
  {
    id: "market",
    name: "Market Agent",
    role: "Analyzes market and adoption perspectives",
    color: "green",
    avatar: "MA",
    bgColor: "bg-green-100",
    textColor: "text-green-600",
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
    sentiment: "positive",
  },
];

const topics = [
  { id: "viability", name: "Business Viability", color: "blue", messages: [] },
  { id: "technical", name: "Technical Feasibility", color: "purple", messages: [] },
  { id: "market", name: "Market Potential", color: "green", messages: [] },
  { id: "risks", name: "Risks & Challenges", color: "red", messages: [] },
  { id: "innovation", name: "Innovation Potential", color: "amber", messages: [] },
];

// Only include round 1 for brevity; add more as needed
const debateScript = {
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
      content: `While the market need exists, we must consider integration complexity. Each platform has unique APIs and data structures. Users may resist adding \"yet another tool\" to their workflow unless the value proposition is immediately clear.`,
      timestamp: new Date(),
      replyTo: "1-1",
      keywords: ["integration", "complexity", "APIs", "resistance"],
      sentiment: "negative",
      importance: 7,
      vote: 6,
      empiricalWeight: 0.8,
    },
    // ...add more messages as needed...
  ],
};

export async function POST(req: NextRequest) {
  const data = await req.json();
  // TODO: Process debate input and update progress
  return NextResponse.json({ message: 'Debate input received', data });
}

export async function GET() {
  return NextResponse.json({ agents, topics, debateScript });
}
