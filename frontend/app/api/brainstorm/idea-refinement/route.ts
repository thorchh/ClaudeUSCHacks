import { NextRequest, NextResponse } from 'next/server';

// Define the base URL for the Python backend
const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://127.0.0.1:5000/api/brainstorm";

// Define expected request body structures (optional but good practice)
interface RefinementRequestBody {
    action: 'get_themes' | 'get_context' | 'get_clarification' | 'get_pushback' | 'get_core_problem' | 'get_creative_expansion' | 'get_cross_analogs' | 'get_variant_pushback' | 'get_variant_feasibility';
    payload: any; // Define more specific types based on action if needed
}

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

export async function POST(request: Request) {
    try {
        const body: RefinementRequestBody = await request.json();
        const { action, payload } = body;

        let endpoint = '';
        let backendPayload: any = {};

        // Map frontend actions to backend endpoints and payloads
        switch (action) {
            case 'get_themes':
                endpoint = '/refine/themes';
                backendPayload = { freewriting: payload.freewriting };
                break;
            case 'get_context':
                endpoint = '/refine/context';
                backendPayload = { freewriting: payload.freewriting };
                break;
            case 'get_clarification':
                endpoint = '/refine/clarification';
                backendPayload = { context_input: payload.context_input };
                break;
            case 'get_pushback':
                endpoint = '/refine/pushback';
                backendPayload = { context_input: payload.context_input, themes: payload.themes };
                break;
            case 'get_core_problem':
                endpoint = '/refine/core_problem';
                 backendPayload = { context_input: payload.context_input, clarification: payload.clarification };
                break;
            case 'get_creative_expansion':
                endpoint = '/refine/creative_expansion';
                backendPayload = { core_problem: payload.core_problem, combined_context: payload.combined_context };
                break;
            case 'get_cross_analogs':
                endpoint = '/refine/cross_analogs';
                backendPayload = { core_problem: payload.core_problem, combined_context: payload.combined_context };
                break;
            case 'get_variant_pushback':
                endpoint = '/refine/variant_pushback';
                backendPayload = { idea_variant: payload.idea_variant };
                break;
            case 'get_variant_feasibility':
                endpoint = '/refine/variant_feasibility';
                backendPayload = { idea_variant: payload.idea_variant, variant_context: payload.variant_context };
                break;
            default:
                return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
        }

        const backendUrl = `${PYTHON_BACKEND_URL}${endpoint}`;

        // console.log(`Forwarding request to: ${backendUrl} with payload:`, JSON.stringify(backendPayload)); // Debug logging

        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(backendPayload),
        });

        // console.log(`Backend response status: ${response.status}`); // Debug logging

        if (!response.ok) {
            const errorText = await response.text();
            // console.error(`Backend error: ${response.status} - ${errorText}`); // Debug logging
            throw new Error(`Backend request failed with status ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        // console.log("Backend response data:", data); // Debug logging

        // The Python backend wraps results in a 'data' key
        return NextResponse.json(data.data || data); // Return data directly, or the full response if 'data' is missing

    } catch (error) {
        console.error("Error in idea-refinement API route:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: 'Failed to process refinement request', details: errorMessage }, { status: 500 });
    }
}

export async function GET() {
  return NextResponse.json({ coreProblem, keyThemes, ideaVariants });
}
