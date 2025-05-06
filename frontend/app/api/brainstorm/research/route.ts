import { NextRequest, NextResponse } from 'next/server';

// Define the base URL for the Python backend
const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://127.0.0.1:5000/api/brainstorm";

// Define expected request body structure
interface ResearchRequestBody {
    action: 'run_agent' | 'get_summary';
    payload: any; // Define more specific types based on action if needed
}

export async function POST(req: NextRequest) {
    try {
        const body: ResearchRequestBody = await req.json();
        const { action, payload } = body;

        let endpoint = '';
        let backendPayload: any = {};

        // Map frontend actions to backend endpoints and payloads
        switch (action) {
            case 'run_agent':
                endpoint = '/research/agent';
                // Payload for run_agent should contain: selected_idea, agent_name, combined_context, round_num
                backendPayload = payload; // Forward the payload directly
                break;
            case 'get_summary':
                endpoint = '/research/summary';
                 // Payload for get_summary should contain: research_results, selected_idea
                backendPayload = payload; // Forward the payload directly
                break;
            default:
                // Assert exhaustive check (optional, for type safety)
                const _: never = action;
                return NextResponse.json({ error: 'Invalid research action specified' }, { status: 400 });
        }

        const backendUrl = `${PYTHON_BACKEND_URL}${endpoint}`;

        console.log(`Forwarding research request (${action}) to: ${backendUrl}`); // Debug logging

        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(backendPayload),
        });

        console.log(`Backend response status for ${action}: ${response.status}`); // Debug logging

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Backend error for ${action}: ${response.status} - ${errorText}`); // Debug logging
            // Try to parse error details if backend sends JSON error
            let errorDetails = errorText;
            try {
                const errorJson = JSON.parse(errorText);
                errorDetails = errorJson.error || errorJson.details || errorText;
            } catch (parseError) {
                // Ignore if error text is not JSON
            }
            // Return a JSON error response
            return NextResponse.json({ error: `Backend request failed for ${action}`, details: errorDetails }, { status: response.status });
        }

        const data = await response.json();
        console.log(`Backend response data for ${action}:`, data); // Debug logging

        // IMPORTANT: The Python backend wraps results in a 'data' key.
        // We return the entire response object from the Next.js route,
        // and the frontend's callResearchApi function will access `response.data`.
        return NextResponse.json(data); // Return the full backend response

    } catch (error: any) {
        console.error("Error in main research API route:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        // Check for fetch errors (e.g., connection refused)
        if (error.cause && error.cause.code === 'ECONNREFUSED') {
            errorMessage = `Connection refused when trying to reach backend at ${PYTHON_BACKEND_URL}. Is the backend running?`;
        }
        return NextResponse.json({ error: 'Failed to process research request', details: errorMessage }, { status: 500 });
    }
}

// Optional: Add a GET handler if needed for testing or info
export async function GET() {
  return NextResponse.json({ message: "This is the main research endpoint. Use POST with 'action' and 'payload'." });
}