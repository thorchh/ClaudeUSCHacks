import { NextRequest, NextResponse } from 'next/server';

// Mock idea refinement data for GET
const coreProblem = "Users need a centralized system to collect, organize, and prioritize feedback from multiple channels to ensure important insights aren't missed and can be acted upon efficiently.";
const keyThemes = ["Centralization", "Prioritization", "Integration", "Automation", "User Experience"];
const ideaVariants = [
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
];

// Handles user input for the idea refinement phase
export async function POST(req: NextRequest) {
  const data = await req.json();
  // TODO: Process idea refinement input and update progress
  return NextResponse.json({ message: 'Idea refinement received', data });
}

export async function GET() {
  return NextResponse.json({ coreProblem, keyThemes, ideaVariants });
}
