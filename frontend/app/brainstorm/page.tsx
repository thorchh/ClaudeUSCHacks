"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Brain, Sparkles, ArrowDown, Lightbulb, Zap } from "lucide-react"
import Link from "next/link"
import IdeaRefinementPhase from "@/components/idea-refinement-phase"
import ResearchPhase from "@/components/research-phase"
import AgentDebate from "@/components/agent-debate"
import FinalReport from "@/components/final-report"
import PhaseIndicator from "@/components/phase-indicator"
import PoweredByBadge from "@/components/powered-by-badge"

// --- TEMPORARY CONTEXT FOR TESTING ---
const tempContext = {
  context: {
    known_constraints:
      "The solution would need to integrate with multiple platforms (email, Slack, Google Drive, Figma, etc.). The user doesn't want just another to-do app. The solution should be able to distinguish between urgent/important feedback and non-urgent items. There are technical challenges in connecting to and extracting data from so many different sources.",
    target_users:
      "Professionals who receive feedback across multiple platforms and communication channels, likely freelancers, consultants, or creative professionals working with clients.",
    user_goal:
      "Create a solution that centralizes and organizes feedback from various sources (DMs, docs, Figma comments, voicemails, etc.) into a single view to prevent missing important client feedback.",
  },
  clarification: {
    assumptions: [
      "Users receive feedback across multiple digital platforms",
      "The solution is not meant to be a simple to-do list app",
      "The solution must be able to prioritize feedback based on urgency/importance",
      "Users are likely freelancers, consultants or creative professionals",
      "Integration with diverse platforms is technically challenging but necessary",
      "Users are currently missing important feedback due to fragmentation across platforms",
    ],
    keywords: [
      "centralize feedback",
      "multiple platforms",
      "integration",
      "single view",
      "client feedback",
      "professionals",
      "freelancers",
      "consultants",
      "urgent/important prioritization",
      "email",
      "Slack",
      "Google Drive",
      "Figma",
      "DMs",
      "docs",
      "voicemails",
    ],
    missing_detail_question:
      "What specific actions should users be able to take with the feedback once it's consolidated (e.g., respond directly, categorize, delegate, archive)? Also, are there any specific user experience preferences or accessibility requirements that should be considered?",
    need_more_detail: true,
    objectives:
      "Create a centralized solution that collects, organizes, and prioritizes client feedback from multiple digital platforms and communication channels into a unified view for professionals who work with clients across various mediums.",
  },
  detail_answer: "Use sender role, keywords, and explicit deadline dates to determine urgency.",
  pushback_summary:
    "A significant risk is that integrating with multiple platforms (email, Slack, Google Drive, Figma, etc.) could create technical complexity that delays launch and increases maintenance costs, while potentially overlooking the emotional aspects of receiving feedback that users might struggle with beyond just organization.",
  curiosity_question:
    "How might we balance building enough platform integrations to create value while maintaining a focused MVP, and have you considered how the tool might help users process feedback emotionally, not just organizationally?",
  core_problem:
    "Professionals receive feedback across multiple disconnected platforms (email, Slack, DMs, docs, Figma, voicemail) and struggle to effectively track, organize, and prioritize this feedback due to its volume and dispersion. They need a specialized feedback aggregator that integrates with various communication tools, centralizes feedback from all sources, and intelligently prioritizes items based on importance and urgency—not just another to-do app. The solution must connect to multiple platforms (email, Slack, Google Drive, etc.) and provide a structured system for collecting, organizing, and acting on feedback that's scattered across their digital ecosystem. While prioritization is a key feature, specific criteria for determining importance and urgency still need to be defined.",
  research_summary:
    "## Financial Feedback Aggregator: Research Summary\n\n### Key User Psychology Insights\n1. Anxiety and Mental Burden: Professionals experience significant anxiety about missing important client feedback, spending 3.8-7 hours weekly searching for feedback across platforms and developing workarounds like forwarding emails to themselves.\n2. Cognitive Overload: Users suffer from constant context-switching between platforms, prioritizing based on recency rather than importance, leading to both professional and emotional stress.\n3. Professional Reputation Concerns: Missing feedback damages client relationships, with professionals fearing negative impacts on their reputation and business opportunities.\n4. Control Desire: Users strongly desire better organization systems but resist solutions requiring significant behavior change or adding more work.\n5. Emotional Impact: The emotional toll of scattered feedback is a significant driver (40%) of potential adoption but is rarely addressed in current solutions.\n\n### Business Value & Market Opportunity\n1. Significant Time Savings: Centralizing feedback could save professionals 5-10 hours weekly, translating to $250-500 in billable time for freelancers.\n2. Client Retention Impact: Reducing missed feedback could improve client retention by 20-30% and decrease project revision cycles by up to 20%.\n3. Market Size: The productivity tools segment for freelancers is valued at $4.5 billion, with feedback management representing an $850 million segment growing at 15% annually.\n4. Monetization Potential: A tiered subscription model ($60-100/month) could generate $720-$1,200 annually per professional user.\n5. Behavioral Evidence: Professionals who centralize feedback report 22% higher project completion rates and 32% lower work-related stress levels.\n\n### Technical Considerations\n1. Integration Complexity: API availability varies significantly across platforms, with frequent changes that could break integrations (35-45% of integrations break annually).\n2. Architecture Requirements: A microservices architecture with dedicated connectors for each platform would provide flexibility when APIs change.\n3. NLP Necessity: Natural Language Processing is essential for extracting, categorizing, and prioritizing feedback from unstructured sources.\n4. Security Concerns: OAuth token management across multiple services creates significant security considerations that must be addressed.\n5. Maintenance Challenge: Ongoing maintenance for API changes represents a major cost risk and potential point of failure.\n\n### Competitive Landscape\n1. Market Gap: Most existing feedback aggregators focus on customer reviews rather than professional feedback management across platforms.\n2. Underdeveloped Area: AI-driven prioritization of feedback remains underdeveloped across existing solutions.\n3. Integration Weakness: No competitor effectively combines communication platforms (Slack, email) with design tools (Figma, Adobe).\n4. Indirect Competition: Current solutions include project management tools (Asana, Trello), communication platforms (Slack), and design feedback tools (InVision), but none offer comprehensive cross-platform aggregation.\n5. Vertical Focus: Solutions specifically targeting freelancers and consultants for client feedback management represent an underserved market segment.\n\n### Contrarian Considerations & Risks\n1. Integration Fatigue: 30-40% of users may abandon the solution within 3 months due to maintenance complexity and broken connections.\n2. Client-Side Resistance: 78% of clients prefer giving feedback in their native platforms rather than adapting to a new system.\n3. Security Resistance: Freelancers report concern about granting third-party access to client communications, while IT departments increasingly block OAuth permissions.\n4. Prioritization Challenges: Users show significant resistance to automatic prioritization algorithms making decisions about what feedback is \"important.\"\n5. Big Tech Threat: Large enterprises like Microsoft and Google may quickly replicate this functionality in existing products.\n\n### Future Opportunities\n1. AI Enhancement: AI-powered sentiment analysis will become essential for feedback prioritization and emotional intelligence.\n2. Multi-Modal Processing: Voice and visual feedback processing represents the next frontier beyond text-based feedback.\n3. Blockchain Verification: Blockchain could enable verified feedback tracking across platforms, creating trust differentiators.\n4. Personal Feedback AI: AI assistants could provide coaching on receiving criticism and responding appropriately.\n5. Cross-Platform Identity: Resolution to connect feedback from the same client across different channels represents a significant opportunity.",
  debate_summary:
    "The debate centered on evaluating a Financial Feedback Aggregator model that would consolidate feedback from various platforms, automatically categorize it, and flag important items requiring attention.\n\nThe Market Agent opened with a positive assessment (7/10), highlighting strong market demand based on professionals spending 3.8-7 hours weekly searching for feedback across platforms. They identified a substantial market opportunity within the $850 million feedback management segment (growing at 15% annually) and potential monetization through $60-100 monthly subscriptions. The agent noted the competitive advantage in addressing an underserved market gap between customer review aggregators and professional feedback management tools. However, they acknowledged significant risks including integration fatigue (30-40% abandonment within 3 months), client-side resistance (78% preferring native platforms), security concerns, and the threat of Big Tech replication.\n\nThe Feature Agent offered a more cautious view (6/10), focusing on technical implementation challenges while acknowledging the solution's value proposition. They emphasized the complexity of required integrations across diverse platforms and highlighted technical obstacles including API instability (35-45% breaking annually), security concerns with OAuth token management, and substantial ongoing maintenance requirements. While recognizing the potential time savings (5-10 hours weekly) and improved client relationships, they stressed that these benefits must be balanced against significant technical hurdles.\n\nThe Synthesis Agent attempted to find middle ground (6.5/10) by integrating both perspectives. They acknowledged both the psychological benefits (reduced anxiety, improved client relationships) and clear business value (saving $250-500 in billable time weekly, improving client retention by 20-30%) while recognizing the substantial technical challenges. They proposed a balanced approach focusing on reliable core integrations with stable platforms first, transparent prioritization algorithms, and clear security protocols to build trust.\n\nThe Contrarian Agent presented the most negative assessment (3/10), arguing that the opportunity overlooks fundamental integration and user adoption barriers. They emphasized that the high API breakage rate creates an unsustainable technical maintenance burden, while client resistance to feedback aggregation and security concerns create a \"three-headed monster\" of adoption barriers. They argued that these challenges don't merely add difficulties but multiply them exponentially, creating an insurmountable obstacle to success.\n\nThe Fusion Agent provided a moderate assessment (5.5/10), suggesting innovative approaches could mitigate the identified challenges. They proposed a hybrid approach combining automated aggregation with selective human curation to address both technical integration challenges and user trust concerns. They advocated reimagining the solution as an adaptive ecosystem that creates value at intersection points between platforms rather than simply combining them.\n\nAreas of agreement included:\n- A clear market need exists, with professionals spending significant time searching for feedback\n- The solution offers potential time savings and improved client relationships\n- Technical integration challenges and client-side resistance present significant obstacles\n\nKey points of disagreement centered around:\n- The severity and inevitability of the technical challenges (especially API instability)\n- Whether the business value outweighs the adoption barriers\n- The threat posed by potential Big Tech competitors\n\nThe final consensus suggests qualified optimism, acknowledging both significant market opportunity and substantial implementation challenges. Most agents recognized that success would require careful design decisions and implementation strategies to overcome the identified obstacles. The unresolved tension remains whether technical integration challenges can be sufficiently mitigated to deliver the promised value in a sustainable way that overcomes client resistance.",
}
// --- END TEMPORARY CONTEXT ---

export default function BrainstormPage() {
  const [activePhase, setActivePhase] = useState<string>("chat")
  const [progress, setProgress] = useState<number>(0)
  const [idea, setIdea] = useState<string>("")
  const [refinedIdea, setRefinedIdea] = useState<string>("")
  const [combinedContextFromRefinement, setCombinedContextFromRefinement] = useState<any>(null)
  const [isStarted, setIsStarted] = useState<boolean>(false)
  const [showPlaceholder, setShowPlaceholder] = useState<boolean>(true)

  // --- TEMPORARY HANDLER FOR TESTING ---
  const skipToReport = () => {
    setIsStarted(true)
    setCombinedContextFromRefinement(tempContext)
    setActivePhase("report")
    setProgress(100)
  }
  // --- END TEMPORARY HANDLER ---

  const startBrainstorming = () => {
    if (idea.trim().length > 0) {
      setIsStarted(true)
      setProgress(5)
    }
  }

  const moveToNextPhase = (selectedIdea: string, context: any) => {
    setRefinedIdea(selectedIdea)
    setCombinedContextFromRefinement(context)
    setActivePhase("research")
    setProgress(50)
  }

  const moveToDebatePhase = (researchSummary: string) => {
    setCombinedContextFromRefinement((prev: any) => ({
      ...prev,
      research_summary: researchSummary,
    }))
    setTimeout(() => {
      setActivePhase("debate")
      setProgress(75)
    }, 0)
  }

  const moveToReportPhase = (debateSummary: string) => {
    setCombinedContextFromRefinement((prev: any) => ({
      ...prev,
      debate_summary: debateSummary,
    }))
    setActivePhase("report")
    setProgress(100)
  }

  const handleTextareaFocus = () => {
    setShowPlaceholder(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background to-accent/5">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative w-8 h-8 flex items-center justify-center">
                <div className="absolute inset-0 bg-primary rounded-full opacity-20 animate-pulse-slow"></div>
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <span className="font-bold text-xl">deepBrainstormAI</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center space-x-4">
            {isStarted && (
              <div className="w-full max-w-md">
                <Progress value={progress} className="h-2 progress-bar-animated" />
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {isStarted && (
              <div className="hidden md:flex items-center space-x-2">
                <PhaseIndicator
                  phase="chat"
                  label="Idea Refinement"
                  number={1}
                  isActive={activePhase === "chat"}
                  icon={<Lightbulb className="h-3.5 w-3.5" />}
                />
                <PhaseIndicator phase="research" label="Research" number={2} isActive={activePhase === "research"} />
                <PhaseIndicator phase="debate" label="Debate" number={3} isActive={activePhase === "debate"} />
                <PhaseIndicator phase="report" label="Report" number={4} isActive={activePhase === "report"} />
              </div>
            )}
            <Button variant="ghost" size="icon">
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6">
        {!isStarted ? (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="text-center mb-8 space-y-3">
              <Badge
                variant="outline"
                className="px-3 py-1 rounded-full border-primary/20 bg-primary/10 text-primary mx-auto"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                <span>AI-Powered Brainstorming</span>
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Transform Your <span className="gradient-text">Ideas</span> into{" "}
                <span className="gradient-text">Insights</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Let our AI orchestrate a deep exploration of your concept through multiple perspectives and disciplines
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/10 rounded-3xl blur-3xl opacity-30"></div>

              <Card className="shadow-2xl border-0 bg-gradient-to-b from-background to-background/80 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 via-purple-500/40 to-blue-500/40"></div>

                <CardHeader className="space-y-1 pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded-full bg-primary/10">
                        <Lightbulb className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-2xl">Begin Your Deep Brainstorm</CardTitle>
                    </div>
                    <PoweredByBadge type="claude" />
                  </div>
                  <CardDescription className="text-base">
                    Share your concept and watch as our AI orchestrates a comprehensive exploration
                  </CardDescription>
                </CardHeader>

                <CardContent className="pb-2">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-xl overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 animate-gradient-flow"></div>
                    </div>

                    <div className="relative rounded-xl border border-primary/10 shadow-lg overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-blue-500 opacity-30"></div>

                      <div className="p-1 bg-black/5">
                        <div className="flex space-x-1.5 px-2 py-1">
                          <div className="w-3 h-3 rounded-full bg-red-500/30"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500/30"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500/30"></div>
                        </div>
                      </div>

                      <div className="relative">
                        {showPlaceholder && (
                          <div className="absolute inset-0 flex flex-col justify-center px-6 py-4 pointer-events-none">
                            <div className="flex items-center text-muted-foreground mb-2">
                              <Zap className="h-4 w-4 mr-2 text-primary" />
                              <span className="text-sm font-medium">Start typing your idea...</span>
                            </div>
                            <p className="text-muted-foreground/70 text-sm">
                              This is a freewriting space. Share any idea that comes to mind, no matter how rough or
                              unpolished.
                            </p>
                          </div>
                        )}

                        <Textarea
                          placeholder=""
                          className="min-h-[200px] resize-none transition-all focus:shadow-md border-0 rounded-none bg-transparent focus:ring-0 text-lg"
                          value={idea}
                          onChange={(e) => setIdea(e.target.value)}
                          onFocus={handleTextareaFocus}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center mt-6">
                    <div className="animate-bounce">
                      <ArrowDown className="h-6 w-6 text-primary/50" />
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-2 flex flex-col space-y-2">
                  <Button
                    onClick={startBrainstorming}
                    disabled={idea.trim().length === 0}
                    className="w-full py-6 text-lg shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 bg-gradient-to-r from-primary to-primary/90"
                  >
                    Begin Deep Exploration
                    <Brain className="ml-2 h-5 w-5" />
                  </Button>

                  <Button onClick={skipToReport} variant="outline" className="w-full">
                    (TEMP) Skip Directly to Report
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="mt-8 text-center">
              <div className="inline-flex items-center space-x-2 text-sm text-muted-foreground">
                <span>Powered by advanced multi-agent AI technology</span>
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <Tabs value={activePhase} className="w-full">
              <TabsContent value="chat" className="mt-0">
                <IdeaRefinementPhase idea={idea} onComplete={moveToNextPhase} />
              </TabsContent>
              <TabsContent value="research" className="mt-0">
                <ResearchPhase
                  idea={refinedIdea || idea}
                  onCompleteAction={moveToDebatePhase}
                  combinedContext={combinedContextFromRefinement}
                />
              </TabsContent>
              <TabsContent value="debate" className="mt-0">
                <AgentDebate
                  idea={refinedIdea || idea}
                  onCompleteAction={moveToReportPhase}
                  combinedContext={combinedContextFromRefinement}
                />
              </TabsContent>
              <TabsContent value="report" className="mt-0">
                <FinalReport
                  idea={refinedIdea || idea}
                  combinedContext={combinedContextFromRefinement}
                  onRestart={() => {
                    setIdea("")
                    setRefinedIdea("")
                    setCombinedContextFromRefinement(null)
                    setIsStarted(false)
                    setActivePhase("chat")
                    setProgress(0)
                    setShowPlaceholder(true)
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>

      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="relative w-6 h-6 flex items-center justify-center">
              <div className="absolute inset-0 bg-primary rounded-full opacity-20"></div>
              <Brain className="h-4 w-4 text-primary" />
            </div>
            <p className="text-center text-sm leading-loose text-gray-500 md:text-left">
              © 2025 deepBrainstormAI. All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Made with</span>
            <PoweredByBadge type="claude-3.7" size="sm" />
          </div>
        </div>
      </footer>
    </div>
  )
}
