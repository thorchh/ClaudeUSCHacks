import { NextRequest, NextResponse } from 'next/server';

// Define the base URL for the Python backend
const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://127.0.0.1:5000/api/brainstorm";

// Define expected request body structures
interface DebateRequestBody {
    action: 'get_available_roles' | 'run_debate_round' | 'summarize_debate';
    payload?: any; // Define more specific types based on action if needed
}

// Define expected payload for run_debate_round
interface RunDebateRoundPayload {
    selected_idea: string;
    research_summary: string;
    agent_role: string;
    other_feedback?: any[];
    round_num: number;
}

export async function POST(request: NextRequest) {
    try {
        const body: DebateRequestBody = await request.json();
        const { action, payload } = body;

        let endpoint = '';
        let backendPayload: any = {};

        // Map frontend actions to backend endpoints and payloads
        switch (action) {
            case 'get_available_roles':
                // This action is handled by the GET request below,
                // but we keep the case here for potential future POST-based role fetching.
                // For now, we'll just fetch using GET.
                const rolesResponse = await fetch(`${PYTHON_BACKEND_URL}/debate/available_roles`);
                 if (!rolesResponse.ok) {
                    const errorText = await rolesResponse.text();
                    console.error(`Backend error fetching roles: ${rolesResponse.status} - ${errorText}`);
                    throw new Error(`Backend request failed with status ${rolesResponse.status}: ${errorText}`);
                }
                const rolesData = await rolesResponse.json();
                return NextResponse.json(rolesData); // Return roles data directly

            case 'run_debate_round':
                endpoint = '/debate/round';
                // Validate payload structure for run_debate_round
                const debatePayload = payload as RunDebateRoundPayload;
                if (!debatePayload || !debatePayload.selected_idea || !debatePayload.research_summary || !debatePayload.agent_role || debatePayload.round_num === undefined) {
                     return NextResponse.json({ error: 'Invalid payload for run_debate_round action' }, { status: 400 });
                }
                backendPayload = debatePayload;
                break;

            case 'summarize_debate':
                endpoint = '/debate/summarize';
                if (!payload || !payload.debate_log) {
                    return NextResponse.json({ error: 'Invalid payload for summarize_debate action' }, { status: 400 });
                }
                backendPayload = payload;
                break;

            default:
                // Assert exhaustive check (optional, for type safety)
                const _exhaustiveCheck: never = action;
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

        // The Python backend might wrap results in a 'data' key or return directly
        return NextResponse.json(data); // Return the full response structure from the backend

    } catch (error) {
        console.error("Error in debate API route:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: 'Failed to process debate request', details: errorMessage }, { status: 500 });
    }
}

// Keep GET for fetching available roles as it's a simple read operation
export async function GET() {
  try {
    const backendUrl = `${PYTHON_BACKEND_URL}/debate/available_roles`;
    const response = await fetch(backendUrl);

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Backend error fetching roles: ${response.status} - ${errorText}`);
        throw new Error(`Backend request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data); // Return the full response structure

  } catch (error) {
    console.error("Error fetching available debate roles:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch available roles', details: errorMessage }, { status: 500 });
  }
}
