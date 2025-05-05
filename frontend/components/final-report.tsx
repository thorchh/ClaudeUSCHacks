"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star, AlertTriangle, Zap, BarChart3, Layers, Rocket, Target, Lightbulb } from "lucide-react"
import { FeasibilityRadarChart } from "./feasibility-radar-chart"

// Mock data structure that matches the backend output
interface FeatureIdeation {
  must_have_features: string[]
  nice_to_have_features: string[]
  feasibility_notes: string
  technical_complexity: string
  cost_time_estimates: string
  feature_pivots: string[]
}

interface CompetitiveAnalysis {
  direct_competitors: string[]
  indirect_competitors: string[]
  blue_ocean_gaps: string[]
  swot_profiles: string[]
  underserved_segments: string[]
  emerging_players: string[]
  patent_overlaps: string[]
}

interface MVPRoadmap {
  mvp_architecture: string
  implementation_plan: string
  technical_validation: string
  collaboration_notes: string
}

interface FinalReportData {
  feature_ideation: FeatureIdeation
  competitive_analysis: CompetitiveAnalysis
  mvp_roadmap: MVPRoadmap
}

// Sample data structure (this would come from your backend)
const sampleReportData: FinalReportData = {
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
}

const FinalReport = () => {
  const [reportData, setReportData] = useState<FinalReportData>(sampleReportData)

  return (
    <div className="w-full">
      <Tabs defaultValue="features" className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            <span>Features</span>
          </TabsTrigger>
          <TabsTrigger value="competitive" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>Competitive Analysis</span>
          </TabsTrigger>
          <TabsTrigger value="mvp" className="flex items-center gap-2">
            <Rocket className="h-4 w-4" />
            <span>MVP Blueprint</span>
          </TabsTrigger>
        </TabsList>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-emerald-500" />
                    Must-Have Features
                  </CardTitle>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    Core Functionality
                  </Badge>
                </div>
                <CardDescription>Essential features required for the minimum viable product</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {reportData.feature_ideation.must_have_features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-500" />
                    Nice-to-Have Features
                  </CardTitle>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    Future Enhancements
                  </Badge>
                </div>
                <CardDescription>
                  Features that would enhance the product but aren't essential for launch
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {reportData.feature_ideation.nice_to_have_features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Star className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Feasibility & Complexity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-1">Feasibility Notes</h4>
                    <p className="text-sm text-muted-foreground">{reportData.feature_ideation.feasibility_notes}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Technical Complexity</h4>
                    <p className="text-sm text-muted-foreground">{reportData.feature_ideation.technical_complexity}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-purple-500" />
                    Potential Pivots
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <h4 className="font-medium mb-1">Cost & Time Estimates</h4>
                    <p className="text-sm text-muted-foreground">{reportData.feature_ideation.cost_time_estimates}</p>
                  </div>
                  <h4 className="font-medium mb-1">Feature Pivots</h4>
                  <ul className="space-y-2">
                    {reportData.feature_ideation.feature_pivots.map((pivot, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Zap className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{pivot}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* Competitive Analysis Tab */}
        <TabsContent value="competitive" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-red-500" />
                    Direct Competitors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {reportData.competitive_analysis.direct_competitors.map((competitor, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Target className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <span>{competitor}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-blue-500" />
                    Indirect Competitors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {reportData.competitive_analysis.indirect_competitors.map((competitor, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Layers className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>{competitor}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-cyan-500" />
                  Blue Ocean Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {reportData.competitive_analysis.blue_ocean_gaps.map((gap, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Lightbulb className="h-5 w-5 text-cyan-500 mt-0.5 flex-shrink-0" />
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-emerald-500" />
                    SWOT Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {reportData.competitive_analysis.swot_profiles.map((profile, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <BarChart3 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{profile}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-500" />
                    Underserved Segments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {reportData.competitive_analysis.underserved_segments.map((segment, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Target className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{segment}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* MVP Blueprint Tab */}
        <TabsContent value="mvp" className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-blue-500" />
                  MVP Architecture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{reportData.mvp_roadmap.mvp_architecture}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-emerald-500" />
                  Implementation Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-line text-sm">{reportData.mvp_roadmap.implementation_plan}</div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Technical Validation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{reportData.mvp_roadmap.technical_validation}</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-purple-500" />
                    Collaboration Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{reportData.mvp_roadmap.collaboration_notes}</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Feasibility Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <FeasibilityRadarChart
                    data={[
                      { category: "Technical", value: 0.75 },
                      { category: "Market", value: 0.85 },
                      { category: "Financial", value: 0.65 },
                      { category: "Operational", value: 0.7 },
                      { category: "Regulatory", value: 0.9 },
                    ]}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default FinalReport
