import { NextRequest, NextResponse } from 'next/server';

// Define the base URL for the Python backend
const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://127.0.0.1:5000/api/brainstorm";

// Define expected request body structures
interface ReportRequestBody {
    action: 'generate_section' | 'generate_full_report'; // Updated actions
    payload: {
        combinedContext: any; // The full context object
        section_title?: string; // Optional for section generation
    };
}

export async function POST(request: NextRequest) {
    try {
        const body: ReportRequestBody = await request.json();
        const { action, payload } = body;

        console.log('Received payload in report API route:', payload); // <-- Add logging here

        let endpoint = '';
        let backendPayload: any = {};

        // Map frontend actions to backend endpoints and payloads
        switch (action) {
            case 'generate_section':
                endpoint = '/report/generate_section'; // Matches the updated backend endpoint
                backendPayload = {
                    combinedContext: payload.combinedContext,
                    section_title: payload.section_title,
                };
                break;
            case 'generate_full_report':
                endpoint = '/report/generate_full';
                // Convert camelCase to snake_case for backend
                backendPayload = {
                    combined_context: payload.combinedContext
                };
                break;
            default:
                // Type safety: If action is not valid, it's an error
                const exhaustiveCheck: never = action;
                return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
        }

        const backendUrl = `${PYTHON_BACKEND_URL}${endpoint}`;

        console.log(`Forwarding request to: ${backendUrl} for action: ${action}`); // Debug logging

        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(backendPayload),
        });

        console.log(`Backend response status for action ${action}: ${response.status}`); // Debug logging

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Backend error for action ${action}: ${response.status} - ${errorText}`); // Debug logging
            let errorDetails = errorText;
            try {
                const errorJson = JSON.parse(errorText);
                errorDetails = errorJson.error || errorJson.details || errorText;
            } catch (parseError) {
                // Ignore if it's not JSON
            }
            throw new Error(`Backend request failed for action "${action}" with status ${response.status}: ${errorDetails}`);
        }

        const data = await response.json();
        console.log(`Backend response data for action ${action}:`, data); // Debug logging

        // The Python backend returns { phase, step, title, data/error }
        // We just forward this structure
        return NextResponse.json(data);

    } catch (error) {
        console.error("Error in report API route:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        // Ensure a consistent error response structure
        return NextResponse.json({ phase: 'report', step: 'api_error', error: 'Failed to process report request', details: errorMessage }, { status: 500 });
    }
}

// Optional: Add a GET handler if needed for testing or fetching static report info
export async function GET() {
  // Example: Return available section titles or status
  return NextResponse.json({ message: "Report API endpoint is active. Use POST to generate sections or full reports." });
}
