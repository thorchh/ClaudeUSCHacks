import { NextRequest, NextResponse } from 'next/server';

// Mock data structure that matches the backend output
const sampleReportData = {
  feature_ideation: {
    must_have_features: [
      "Universal feedback inbox that aggregates from multiple sources (email, Slack, etc.)",
      "Automatic categorization and prioritization of feedback",
      "Simple dashboard with actionable insights",
      "Basic notification system for urgent feedback",
    ],
    nice_to_have_features: [
      "AI-powered sentiment analysis",
      "Integration with project management tools",
      "Custom tagging and filtering system",
      "Collaborative feedback review with team members",
      "Historical feedback trends and analytics",
    ],
    feasibility_notes:
      "The core feedback aggregation is technically feasible using existing APIs from major platforms. The main challenge will be maintaining reliable connections across multiple services and handling authentication securely.",
    technical_complexity:
      "Medium-high complexity due to the number of integrations required. Each platform has its own API quirks and authentication methods. The AI prioritization adds another layer of complexity.",
    cost_time_estimates:
      "MVP development: 3-4 months with a small team (2-3 developers). Estimated cost: $80,000-120,000 for initial development.",
    feature_pivots: [
      "Start with fewer integrations (just email and Slack) to validate core concept",
      "Consider a browser extension approach instead of full platform integration",
      "Focus on manual organization tools first, add AI features later",
    ],
  },
  competitive_analysis: {
    direct_competitors: [
      "Front (customer communication platform)",
      "Intercom (customer messaging platform)",
      "Uservoice (feedback management software)",
    ],
    indirect_competitors: [
      "Notion (for manual feedback organization)",
      "Trello/Asana (for feedback tracking)",
      "Email clients with advanced filtering",
    ],
    blue_ocean_gaps: [
      "No solution currently focuses on personal feedback management across platforms",
      "Existing solutions are team/company focused rather than individual focused",
      "AI-powered prioritization is underutilized in current feedback tools",
    ],
    swot_profiles: [
      "Strengths: Novel approach to personal feedback management, cross-platform integration",
      "Weaknesses: Complex integration requirements, potential privacy concerns",
      "Opportunities: Growing remote work trend increases digital feedback channels",
      "Threats: Platform API changes could break integrations, enterprise solutions moving downmarket",
    ],
    underserved_segments: [
      "Freelancers managing multiple clients",
      "Small business owners without dedicated support teams",
      "Content creators receiving feedback across multiple platforms",
    ],
    emerging_players: [
      "Superhuman (email client with AI features)",
      "Coda (document platform with automation)",
      "Notion AI (emerging AI capabilities in knowledge management)",
    ],
    patent_overlaps: [
      "Several patents exist for enterprise feedback management systems",
      "AI-based prioritization algorithms have some patent coverage",
      "Integration methods are generally not patent-encumbered",
    ],
  },
  mvp_roadmap: {
    mvp_architecture:
      "Cloud-based SaaS application with secure API connectors to major platforms (Gmail, Slack, etc.). Frontend web application with responsive design. Backend services for integration management, data processing, and basic AI analysis.",
    implementation_plan:
      "Phase 1 (Month 1): Core architecture and authentication system\nPhase 2 (Month 2): Email and Slack integrations\nPhase 3 (Month 3): Basic dashboard and organization features\nPhase 4 (Month 4): Prioritization algorithm and notification system",
    technical_validation:
      "Proof of concept needed for cross-platform authentication and data synchronization. Early user testing required for prioritization algorithm effectiveness. Performance testing needed for handling large volumes of feedback data.",
    collaboration_notes:
      "Feature Agent suggests focusing on reliable data synchronization before adding AI features. Market Agent emphasizes importance of seamless onboarding experience. Contrarian Agent highlights potential privacy concerns that need addressing.",
  },
};

export async function POST(req: NextRequest) {
  const data = await req.json();
  // TODO: Process report input and update progress
  return NextResponse.json({ message: 'Report input received', data });
}

export async function GET() {
  return NextResponse.json(sampleReportData);
}
