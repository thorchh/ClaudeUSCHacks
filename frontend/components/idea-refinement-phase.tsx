"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowRight, Lightbulb, ThumbsDown, Brain, MessageSquare, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import PoweredByBadge from "@/components/powered-by-badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface IdeaRefinementPhaseProps {
  idea: string
  onComplete: (selectedIdea: string, combinedContext: any) => void // Updated prop type
}

type WorkflowStep = "intake" | "pushback" | "creativity" | "variants" | "selection"

interface IdeaVariant {
  id: string
  content: string
  pushback: string
  feasibility: {
    technical: number
    market: number
    novelty: number
  }
  risks: string
  tags: string[]
  framework: string
}

interface ThemeItem {
  name: string
  color: string
}

// --- API Helper ---
const callRefinementApi = async (action: string, payload: any) => {
  try {
    const response = await fetch('/api/brainstorm/idea-refinement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details || errorData.error || `API request failed with status ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error(`Error calling refinement API action ${action}:`, error);
    return null;
  }
};

export default function IdeaRefinementPhase({ idea, onComplete }: IdeaRefinementPhaseProps) {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>("intake")
  const [initialIdea, setInitialIdea] = useState(idea)
  const [initialPushback, setInitialPushback] = useState("")
  const [userResponse, setUserResponse] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [typingMessage, setTypingMessage] = useState("")
  const [workflowComplete, setWorkflowComplete] = useState(false)
  const [ideaVariants, setIdeaVariants] = useState<IdeaVariant[]>([])
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [isGeneratingVariants, setIsGeneratingVariants] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [extractedThemes, setExtractedThemes] = useState<ThemeItem[]>([])
  const [isExtractingThemes, setIsExtractingThemes] = useState(false)
  const [intakeProgress, setIntakeProgress] = useState(0)
  const [variantGenerationProgress, setVariantGenerationProgress] = useState(0)
  const [currentFramework, setCurrentFramework] = useState<string | null>(null)
  const [frameworkProgress, setFrameworkProgress] = useState(0)
  const [curiosityQuestion, setCuriosityQuestion] = useState("")
  const [showThemeAnimation, setShowThemeAnimation] = useState(false)
  const [combinedContext, setCombinedContext] = useState<any>(null)
  const [coreProblem, setCoreProblem] = useState<any>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [typingMessage, currentStep])

  // Initialize the workflow when component mounts
  useEffect(() => {
    if (idea.trim()) {
      setInitialIdea(idea)
    }
  }, [idea])

  // --- Workflow Steps ---
  // Step 1: Intake (Themes, Context, Clarification)
  const runIntake = async () => {
    setIsExtractingThemes(true);
    setIntakeProgress(10);
    // 1a: Get Themes
    const themesData = await callRefinementApi('get_themes', { freewriting: idea });
    console.log("Themes data received:", themesData);
    if (!themesData) return;
    const themeColors = ["blue", "green", "amber", "purple", "indigo", "pink", "teal"];
    const themesWithColors: ThemeItem[] = (themesData.themes || []).map((themeName: string, index: number) => ({
      name: themeName,
      color: themeColors[index % themeColors.length]
    }));
    setExtractedThemes(themesWithColors);
    setIntakeProgress(30);
    // 1b: Get Context
    const contextData = await callRefinementApi('get_context', { freewriting: idea });
    console.log("Context data received:", contextData);
    if (!contextData) return;
    setIntakeProgress(50);
    // 1c: Get Clarification
    const clarificationData = await callRefinementApi('get_clarification', { context_input: contextData });
    console.log("Clarification data received:", clarificationData);
    if (!clarificationData) return;
    setIntakeProgress(70);
    // 1d: Default detail answer if needed
    let detailAnswer = "";
    if (clarificationData?.need_more_detail) {
      detailAnswer = "Use sender role, keywords, and explicit deadline dates to determine urgency.";
    }
    // Store context for later steps
    setCombinedContext({
      context: contextData,
      clarification: clarificationData,
      detail_answer: detailAnswer
    });
    console.log("Combined context set:", {
      context: contextData,
      clarification: clarificationData,
      detail_answer: detailAnswer
    });
    setIntakeProgress(100);
    setIsExtractingThemes(false);
    setShowThemeAnimation(true);
    setTimeout(() => setCurrentStep("pushback"), 1000);
  };

  // Step 2: Pushback & Core Problem
  const runPushbackAndCoreProblem = async () => {
    console.log("Running Pushback and Core Problem step...");
    setTypingMessage("");
    setIsTyping(true);
    // 2a: Get Pushback
    const pushbackData = await callRefinementApi('get_pushback', { context_input: combinedContext.context, themes: extractedThemes.map(t => t.name) });
    console.log("Pushback data received:", pushbackData);
    if (!pushbackData) return;
    setInitialPushback(pushbackData.summary_of_pushback);
    setCuriosityQuestion(pushbackData.curiosity_question);
    setIsTyping(false);
    // 2b: Get Core Problem
    const coreProblemData = await callRefinementApi('get_core_problem', { context_input: combinedContext.context, clarification: combinedContext.clarification });
    console.log("Core Problem data received:", coreProblemData);
    if (!coreProblemData) return;
    setCurrentStep("creativity");
    setCoreProblem(coreProblemData);
    setCombinedContext(prev => ({ ...prev, pushback_summary: pushbackData.summary_of_pushback, curiosity_question: pushbackData.curiosity_question, core_problem: coreProblemData }));
  };

  // Step 3 & 4: Creativity & Variants
  const runCreativityAndVariants = async () => {
    setIsGeneratingVariants(true);
    setVariantGenerationProgress(10);
    console.log("Starting Creativity & Variants step..."); 

    // 3a: Creative Expansion
    console.log("Calling get_creative_expansion..."); 
    const creativeData = await callRefinementApi('get_creative_expansion', { core_problem: combinedContext.core_problem, combined_context: combinedContext });
    console.log("Creative Expansion data received:", creativeData); 
    if (!creativeData) {
      console.error("Failed to get creative expansion data."); 
      setIsGeneratingVariants(false); // Ensure loading stops on error
      return;
    }
    // Defensive: ensure we only spread arrays, and if it's a string, treat as a single variant
    const creativeVariantsRaw = Array.isArray(creativeData.scamper_variants)
      ? creativeData.scamper_variants
      : typeof creativeData.scamper_variants === 'string' && creativeData.scamper_variants.trim() !== ''
        ? [creativeData.scamper_variants]
        : [];
    console.log("Creative Expansion data received:", creativeVariantsRaw); // Added log
    setVariantGenerationProgress(30);

    // 3b: Cross-Analogs
    console.log("Calling get_cross_analogs..."); // Added log
    const crossData = await callRefinementApi('get_cross_analogs', { core_problem: combinedContext.core_problem, combined_context: combinedContext });
    console.log("Cross Analogs data received:", crossData);
    if (!crossData) {
      console.error("Failed to get cross analogs data."); // Added log
      setIsGeneratingVariants(false); // Ensure loading stops on error
      return;
    }
    // Defensive: ensure we only spread arrays, and if it's a string, treat as a single variant
    const crossVariantsRaw = Array.isArray(crossData.cross_industry_analogies)
      ? crossData.cross_industry_analogies
      : typeof crossData.cross_industry_analogies === 'string' && crossData.cross_industry_analogies.trim() !== ''
        ? [crossData.cross_industry_analogies]
        : [];
    console.log("Cross Analogs data received:", crossVariantsRaw); // Added log
    setVariantGenerationProgress(50);

    // Limit the number of variants to a maximum of 6
    const allVariantsRaw = [...creativeVariantsRaw, ...crossVariantsRaw].slice(0, 6);
    console.log(`Processing ${allVariantsRaw.length} total raw variants...`); // Added log

    // 4: For each variant, get pushback & feasibility
    console.log("Starting to process each variant...");
    const processedVariants: IdeaVariant[] = [];
    for (let i = 0; i < allVariantsRaw.length; i++) {
      const ideaContent = allVariantsRaw[i];
      console.log(`--- Processing variant ${i + 1}/${allVariantsRaw.length}: "${ideaContent}" ---`); // Added log
      setVariantGenerationProgress(50 + Math.round(((i + 1) / allVariantsRaw.length) * 50));

      // 4a: Variant Pushback
      console.log(`Calling get_variant_pushback for variant ${i + 1}...`); // Added log
      const variantPushbackData = await callRefinementApi('get_variant_pushback', { idea_variant: ideaContent });
      console.log(`Variant pushback data for variant ${i + 1}:`, variantPushbackData); 
      if (!variantPushbackData) {
        console.warn(`Skipping variant ${i + 1} due to pushback API failure.`); // Added log
        continue;
      }
      console.log(`Pushback data for variant ${i + 1}:`, variantPushbackData); // Added log

      console.log("variant feasibility starting now");
      // 4b: Variant Feasibility
      const variantContextPayload = {
        context: combinedContext.context,
        clarification: combinedContext.clarification,
        detail_answer: combinedContext.detail_answer,
        idea_variant: ideaContent
      };
      console.log(`Calling get_variant_feasibility for variant ${i + 1}...`); // Added log
      const variantFeasibilityData = await callRefinementApi('get_variant_feasibility', { idea_variant: ideaContent, variant_context: variantContextPayload });
      console.log(`Variant feasibility data for variant ${i + 1}:`, variantFeasibilityData);
      if (!variantFeasibilityData) {
        console.warn(`Skipping variant ${i + 1} due to feasibility API failure.`); // Added log
        continue;
      }
      console.log(`Feasibility data for variant ${i + 1}:`, variantFeasibilityData); // Added log

      // --- Framework badge diversity ---
      let framework = "Innovative";
      const creativeCount = creativeData?.scamper_variations?.length || 0;
      if (i < creativeCount) {
        const creativeFrameworks = ["Innovative", "Practical", "Collaborative"];
        framework = creativeFrameworks[i % creativeFrameworks.length];
      } else {
        const crossFrameworks = ["Inspired", "Systematic", "Experimental"];
        framework = crossFrameworks[(i - creativeCount) % crossFrameworks.length];
      }

      // --- Feasibility as percentage ---
      processedVariants.push({
        id: `variant-${i + 1}`,
        content: ideaContent,
        pushback: variantPushbackData.summary_of_pushback || "No specific pushback generated.",
        feasibility: {
          technical: Math.round((variantFeasibilityData.technical_feasibility || 0) * 10),
          market: Math.round((variantFeasibilityData.market_feasibility || 0) * 10),
          novelty: Math.round((variantFeasibilityData.novelty || 0) * 10),
        },
        risks: variantFeasibilityData.execution_risks || "N/A",
        tags: ["AI", "Feedback", `Variant ${i + 1}`],
        framework,
      });
      console.log(`Successfully processed variant ${i + 1}. Total processed: ${processedVariants.length}`); // Added log
    }

    console.log("Finished processing all variants. Processed variants:", processedVariants); // Added log
    setIdeaVariants(processedVariants);
    setIsGeneratingVariants(false);
    console.log("Setting current step to 'variants'"); // Added log
    setCurrentStep("variants");
  };

  const handleUserResponseSubmit = () => {
    if (userResponse.trim() === "") {
      setUserResponse(
        "I appreciate the pushback. I think the most critical integrations would be email, Slack, and project management tools like Asana. For urgency, we could use a combination of sender role, explicit deadlines mentioned, and keyword analysis. I'd want to make sure users can always override the AI's priority assessment.",
      )
    }
    setCurrentStep("creativity")
    setTimeout(() => {
      runCreativityAndVariants()
    }, 1000)
  }

  const handleSelectVariant = (variantId: string) => {
    setSelectedVariant(variantId)
    const selected = ideaVariants.find((v) => v.id === variantId)
    if (selected) {
      setWorkflowComplete(true)
      setCurrentStep("selection")
    }
  }

  const handleContinue = () => {
    const selected = ideaVariants.find((v) => v.id === selectedVariant)
    if (selected) {
      onComplete(selected.content, combinedContext) // Pass combinedContext here
    }
  }

  const getStepProgress = () => {
    const steps: Record<WorkflowStep, number> = {
      intake: 20,
      pushback: 40,
      creativity: 60,
      variants: 80,
      selection: 100,
    }
    return steps[currentStep]
  }

  const getFrameworkColor = (framework: string) => {
    switch (framework) {
      case "Innovative":
        return "text-blue-600 bg-blue-50 border-blue-200"
      case "Practical":
        return "text-green-600 bg-green-50 border-green-200"
      case "Collaborative":
        return "text-amber-600 bg-amber-50 border-amber-200"
      case "Inspired":
        return "text-purple-600 bg-purple-50 border-purple-200"
      case "Systematic":
        return "text-indigo-600 bg-indigo-50 border-indigo-200"
      case "Experimental":
        return "text-pink-600 bg-pink-50 border-pink-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getThemeColor = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "green":
        return "bg-green-100 text-green-800 border-green-200"
      case "amber":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "purple":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "indigo":
        return "bg-indigo-100 text-indigo-800 border-indigo-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getFeasibilityColor = (score: number) => {
    if (score >= 85) return "bg-green-500"
    if (score >= 70) return "bg-amber-500"
    return "bg-red-500"
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case "intake":
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-primary/5 to-blue-500/5 p-6 rounded-lg border border-primary/10 shadow-sm">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <Brain className="h-5 w-5 mr-2 text-primary" />
                Analyzing Your Idea
              </h3>

              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border shadow-sm mb-6">
                <p className="text-gray-700">{initialIdea}</p>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">Processing your concept</span>
                    <span>{intakeProgress}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary via-purple-500 to-blue-500 transition-all duration-300 ease-out"
                      style={{ width: `${intakeProgress}%` }}
                    ></div>
                  </div>
                </div>

                {showThemeAnimation && (
                  <div className="animate-fade-in">
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <Sparkles className="h-4 w-4 mr-1.5 text-primary" />
                      Key Concepts Identified
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {extractedThemes.map((theme, index) => (
                        <div
                          key={theme.name}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium border ${getThemeColor(theme.color)} animate-fade-in shadow-sm`}
                          style={{ animationDelay: `${index * 0.15}s` }}
                        >
                          {theme.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isExtractingThemes && !showThemeAnimation && (
                  <div className="flex flex-col items-center py-8">
                    <div className="relative w-20 h-20 mb-4">
                      <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-75"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                          <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-spin"></div>
                          <Brain className="h-8 w-8 text-primary relative z-10" />
                        </div>
                      </div>
                    </div>
                    <p className="text-center text-gray-700 font-medium mb-2">Extracting insights from your idea</p>
                    <p className="text-center text-gray-500 max-w-md text-sm">
                      Our AI is analyzing your concept from multiple perspectives to identify key themes and
                      opportunities
                    </p>
                    <div className="flex space-x-2 mt-4">
                      <div
                        className="h-2 w-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="h-2 w-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="h-2 w-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case "pushback":
        return (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center mb-4">
                <div className="p-2 rounded-full bg-primary/10 mr-3">
                  <Lightbulb className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Core Problem Definition</h3>
                  <p className="text-sm text-gray-500">Understanding the fundamental challenge</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary/5 to-blue-500/5 p-4 rounded-lg border border-primary/10 mb-4">
                <h4 className="text-sm font-medium mb-2">Your Initial Idea</h4>
                <p className="text-gray-700">{initialIdea}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-10 w-10 border-2 border-blue-200">
                    <AvatarFallback className="bg-blue-100 text-blue-600">AI</AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg p-4 bg-blue-50 border border-blue-100 text-blue-900 shadow-sm flex-1">
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <ThumbsDown className="h-4 w-4 mr-1.5 text-blue-600" />
                      Key Challenges to Address
                    </h4>
                    <p className="text-sm leading-relaxed">{isTyping ? typingMessage : initialPushback}</p>
                    {isTyping && (
                      <span className="inline-block h-4">
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                      </span>
                    )}

                    {!isTyping && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <p className="text-sm font-medium text-blue-700 flex items-center">
                          <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                          Critical Question:
                        </p>
                        <p className="text-sm mt-1">{curiosityQuestion}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <h4 className="text-sm font-medium w-full mb-1">Key Themes:</h4>
                  {extractedThemes.map((theme) => (
                    <div
                      key={theme.name}
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${getThemeColor(theme.color)}`}
                    >
                      {theme.name}
                    </div>
                  ))}
                </div>
              </div>

              {!isTyping && (
                <div className="mt-6 space-y-3 animate-fade-in">
                  <Button
                    onClick={handleUserResponseSubmit}
                    className="w-full shadow-sm transition-all hover:shadow-md bg-gradient-to-r from-primary to-blue-600"
                  >
                    Continue to Idea Expansion
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )

      case "creativity":
        return (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center mb-4">
                <div className="p-2 rounded-full bg-primary/10 mr-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Generating Solution Variants</h3>
                  <p className="text-sm text-gray-500">Exploring different approaches to your idea</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">Overall Progress</span>
                    <span>{variantGenerationProgress}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary via-purple-500 to-blue-500 transition-all duration-300 ease-out"
                      style={{ width: `${variantGenerationProgress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 p-6 rounded-lg border border-primary/10 mt-4">
                  <div className="flex flex-col items-center">
                    <div className="relative h-24 w-24 mb-6">
                      <div
                        className="absolute inset-0 rounded-full border-4 border-primary/20 border-dashed animate-spin"
                        style={{ animationDuration: "8s" }}
                      ></div>
                      <div
                        className="absolute inset-0 rounded-full border-4 border-blue-500/20 border-dashed animate-spin"
                        style={{ animationDuration: "6s", animationDirection: "reverse" }}
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                          <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-full blur-md animate-pulse"></div>
                          <Brain className="h-10 w-10 text-primary relative z-10" />
                        </div>
                      </div>
                    </div>

                    <h4 className="text-lg font-medium mb-2">Creative AI</h4>
                    <p className="text-center text-gray-500 max-w-md mb-4">
                      Exploring multiple creative perspectives and generating diverse solution approaches for your idea
                    </p>

                    <div className="flex items-center space-x-3 mt-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse"></div>
                      <div
                        className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse"
                        style={{ animationDelay: "0.3s" }}
                      ></div>
                      <div
                        className="h-2.5 w-2.5 rounded-full bg-purple-500 animate-pulse"
                        style={{ animationDelay: "0.6s" }}
                      ></div>
                      <div
                        className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"
                        style={{ animationDelay: "0.9s" }}
                      ></div>
                      <div
                        className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse"
                        style={{ animationDelay: "1.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case "variants":
      case "selection":
        console.log("Rendering Variants/Selection step with variants:", ideaVariants); // Added log
        return (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-primary/10 mr-3">
                    <Lightbulb className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Solution Variants</h3>
                    <p className="text-sm text-gray-500">Select the most promising approach</p>
                  </div>
                </div>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                  <TabsList className="h-8 w-auto">
                    <TabsTrigger value="all" className="text-xs h-7">
                      All
                    </TabsTrigger>
                    <TabsTrigger value="high" className="text-xs h-7">
                      High Feasibility
                    </TabsTrigger>
                    <TabsTrigger value="framework" className="text-xs h-7">
                      By Framework
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {ideaVariants
                  .filter((variant) => {
                    if (activeTab === "high")
                      return (variant.feasibility.technical + variant.feasibility.market) / 2 >= 85
                    if (activeTab === "framework") return true
                    return true
                  })
                  .map((variant, index) => (
                    <div
                      key={variant.id}
                      className={cn(
                        "border rounded-lg transition-all animate-fade-in hover:shadow-md overflow-hidden",
                        selectedVariant === variant.id
                          ? "border-primary shadow-md"
                          : "hover:border-primary/30 hover:bg-primary/5 bg-white",
                      )}
                      style={{ animationDelay: `${index * 0.1}s` }}
                      onClick={() => handleSelectVariant(variant.id)}
                    >
                      <div
                        className={cn(
                          "h-1.5 w-full",
                          selectedVariant === variant.id
                            ? "bg-gradient-to-r from-primary via-purple-500 to-blue-500"
                            : getFrameworkColor(variant.framework).includes("blue")
                              ? "bg-blue-500"
                              : getFrameworkColor(variant.framework).includes("green")
                                ? "bg-green-500"
                                : getFrameworkColor(variant.framework).includes("amber")
                                  ? "bg-amber-500"
                                  : getFrameworkColor(variant.framework).includes("purple")
                                    ? "bg-purple-500"
                                    : getFrameworkColor(variant.framework).includes("pink")
                                      ? "bg-pink-500"
                                      : "bg-indigo-500",
                        )}
                      ></div>
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center">
                            <Badge
                              className={cn(
                                "text-xs px-2.5 py-0.5 rounded-full font-medium",
                                getFrameworkColor(variant.framework),
                              )}
                            >
                              {variant.framework} Approach
                            </Badge>
                          </div>
                          {selectedVariant === variant.id && <Badge className="bg-primary text-white">Selected</Badge>}
                        </div>

                        <h4 className="text-base font-medium mb-4 leading-snug">{variant.content}</h4>

                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {variant.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs bg-gray-50">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="bg-amber-50 border border-amber-100 rounded-md p-3 text-sm text-amber-800 mb-5">
                          <div className="flex items-center mb-1">
                            <ThumbsDown className="h-3.5 w-3.5 mr-1.5 text-amber-600" />
                            <span className="font-medium">Key Challenge:</span>
                          </div>
                          {variant.pushback}
                        </div>

                        <div className="space-y-4">
                          <h5 className="text-sm font-medium flex items-center">
                            <span className="inline-block w-3 h-3 rounded-full bg-gray-200 mr-2"></span>
                            Feasibility Assessment
                          </h5>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <div className="flex justify-between text-xs mb-1.5">
                                <span>Technical</span>
                                <span className="font-medium">{variant.feasibility.technical}%</span>
                              </div>
                              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                <div
                                  className={`h-full ${getFeasibilityColor(variant.feasibility.technical)}`}
                                  style={{ width: `${variant.feasibility.technical}%` }}
                                ></div>
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-xs mb-1.5">
                                <span>Market</span>
                                <span className="font-medium">{variant.feasibility.market}%</span>
                              </div>
                              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                <div
                                  className={`h-full ${getFeasibilityColor(variant.feasibility.market)}`}
                                  style={{ width: `${variant.feasibility.market}%` }}
                                ></div>
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-xs mb-1.5">
                                <span>Novelty</span>
                                <span className="font-medium">{variant.feasibility.novelty}%</span>
                              </div>
                              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                <div
                                  className={`h-full ${getFeasibilityColor(variant.feasibility.novelty)}`}
                                  style={{ width: `${variant.feasibility.novelty}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border">
                <div className="text-sm">
                  <span className="font-medium">Selection Tip:</span> Choose the variant that best balances technical
                  feasibility, market potential, and innovation.
                </div>
                {currentStep === "variants" && (
                  <Button
                    onClick={() => setCurrentStep("selection")}
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                  >
                    Continue to Selection
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div ref={messagesEndRef} />
          </div>
        )

      default:
        return null
    }
  }

  // useEffect to trigger steps
  useEffect(() => {
    if (currentStep === "intake" && idea.trim()) {
      runIntake();
    } else if (currentStep === "pushback") {
      runPushbackAndCoreProblem();
    } else if (currentStep === "creativity") {
      runCreativityAndVariants();
    }
  }, [currentStep, idea]);

  return (
    <Card className="w-full shadow-xl border-t-4 border-t-primary animate-fade-in relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>

      <CardHeader className="pb-4 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-blue-500 opacity-30"></div>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="rounded-full bg-primary/10 p-2 mr-2">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span>Idea Refinement</span>
              <p className="text-sm font-normal text-muted-foreground">Exploring and improving your concept</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="px-2 py-1 text-xs">
              Phase 1 of 4
            </Badge>
            <PoweredByBadge type="claude" size="sm" />
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                {["intake", "pushback", "creativity", "variants", "selection"].map((step, index) => (
                  <div
                    key={step}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      currentStep === step
                        ? "bg-primary scale-125"
                        : ["intake", "pushback", "creativity", "variants", "selection"].indexOf(
                              currentStep as WorkflowStep,
                            ) > index
                          ? "bg-primary/50"
                          : "bg-gray-200",
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                {currentStep === "intake" && "Analyzing idea"}
                {currentStep === "pushback" && "Constructive feedback"}
                {currentStep === "creativity" && "Generating variants"}
                {currentStep === "variants" && "Reviewing options"}
                {currentStep === "selection" && "Making selection"}
              </span>
            </div>
            <Progress value={getStepProgress()} className="h-1" />
          </div>

          {renderStepContent()}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col space-y-4 pt-2">
        {workflowComplete && (
          <Button
            onClick={handleContinue}
            className="w-full shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 bg-gradient-to-r from-primary to-blue-600"
          >
            Continue to Deep Research Phase
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
