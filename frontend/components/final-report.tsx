"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, FileText, RotateCcw, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import PoweredByBadge from "@/components/powered-by-badge"
import ReactMarkdown from 'react-markdown' // Import react-markdown
import remarkGfm from 'remark-gfm' // Import remark-gfm for GitHub Flavored Markdown support

interface FinalReportProps {
  idea: string // Keep idea if needed for display, but context is primary
  onRestart: () => void
  combinedContext: any // Expect context including research_summary, debate_log, etc.
}

// API Helper - Updated for full report generation
const callReportApi = async (action: 'generate_full_report', payload: { combinedContext: any }) => {
  try {
    // Use the Next.js API route as the proxy
    const response = await fetch('/api/brainstorm/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // The body structure matches what the Next.js route expects
      body: JSON.stringify({ action, payload }),
    });

    const data = await response.json(); // Always parse JSON first

    if (!response.ok) {
      // Use error details from the parsed JSON if available
      throw new Error(data.details || data.error || `API request failed with status ${response.status}`);
    }

    // The Next.js route forwards the backend's { phase, step, data/error } structure
    return data; // Return the full response object

  } catch (error: any) {
    console.error(`Error calling report API action ${action}:`, error);
    // Return an error structure consistent with successful responses
    return { phase: 'report', step: 'api_error', error: error.message };
  }
};

// API helpers for required endpoints
const callFeatureIdeation = async (combinedContext: any, debateResults: any) => {
  const response = await fetch('/api/brainstorm/feature_ideation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ combined_context: combinedContext, debate_results: debateResults })
  });
  return response.ok ? (await response.json()).data : null;
};

const callCompetitiveAnalysis = async (combinedContext: any, debateResults: any, featureIdeation: any) => {
  const response = await fetch('/api/brainstorm/competitive_analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ combined_context: combinedContext, debate_results: debateResults, feature_ideation: featureIdeation })
  });
  return response.ok ? (await response.json()).data : null;
};

const callMVPRoadmap = async (combinedContext: any, debateResults: any, featureIdeation: any, competitiveAnalysis: any) => {
  const response = await fetch('/api/brainstorm/mvp_roadmap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ combined_context: combinedContext, debate_results: debateResults, feature_ideation: featureIdeation, competitive_analysis: competitiveAnalysis })
  });
  return response.ok ? (await response.json()).data : null;
};

export default function FinalReport({ idea, onRestart, combinedContext }: FinalReportProps) {
  const [fullReportContent, setFullReportContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function generateFullReport() {
      // Basic validation
      if (!combinedContext || Object.keys(combinedContext).length === 0) {
        console.warn("FinalReport: Waiting for combinedContext.");
        // Don't set error here, wait for user interaction or context update
        return;
      }

      setLoading(true)
      setError(null)
      setFullReportContent(null) // Clear previous report

      let context = { ...combinedContext };
      const debateResults = context.debate_summary;

      let featureIdeation = null;
      try {
        featureIdeation = await callFeatureIdeation(context, debateResults);
        if (featureIdeation) context.feature_ideation = featureIdeation;
      } catch (e) {
        console.error("Feature ideation fetch failed:", e);
      }

      let competitiveAnalysis = null;
      try {
        competitiveAnalysis = await callCompetitiveAnalysis(context, debateResults, featureIdeation);
        if (competitiveAnalysis) context.competitive_analysis = competitiveAnalysis;
      } catch (e) {
        console.error("Competitive analysis fetch failed:", e);
      }

      let mvpRoadmap = null;
      try {
        mvpRoadmap = await callMVPRoadmap(context, debateResults, featureIdeation, competitiveAnalysis);
        if (mvpRoadmap) context.mvp_roadmap = mvpRoadmap;
      } catch (e) {
        console.error("MVP roadmap fetch failed:", e);
      }

      // --- Now call the report API, retry up to 5 times ---
      const payload = { combinedContext: context }; // <-- Fix: Use camelCase here
      let reportResult = null;
      let tries = 0;
      let success = false;
      while (tries < 5 && !success) {
        tries++;
        try {
          reportResult = await callReportApi('generate_full_report', payload);
          if (reportResult && reportResult.data && !reportResult.error) {
            success = true;
            setFullReportContent(reportResult.data);
            toast({
              title: "Report Generated",
              description: "The final brainstorm report has been successfully generated.",
            });
          } else {
            const errorMsg = reportResult?.error || "Failed to generate the full report.";
            console.error(`Attempt ${tries}: Error generating full report:`, errorMsg);
            if (tries === 5) {
              // Show the raw context as fallback
              setFullReportContent(
                'Report generation failed after 5 attempts.\n\nRaw context:\n' + JSON.stringify(context, null, 2)
              );
              toast({
                title: "Report Generation Failed",
                description: "Showing raw context as fallback.",
                variant: "destructive",
              });
            }
          }
        } catch (err) {
          console.error(`Attempt ${tries}: Exception generating full report:`, err);
          if (tries === 5) {
            setFullReportContent(
              'Report generation failed after 5 attempts.\n\nRaw context:\n' + JSON.stringify(context, null, 2)
            );
            toast({
              title: "Report Generation Failed",
              description: "Showing raw context as fallback.",
              variant: "destructive",
            });
          }
        }
      }
      setLoading(false);
    }

    generateFullReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combinedContext]); // Rerun only when combinedContext changes significantly

  return (
    <Card className="w-full shadow-xl border-t-4 border-t-green-500 animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-2 mr-2">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <span>Final Brainstorm Report</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="px-2 py-1 text-xs">
              Phase 4 of 4
            </Badge>
            <PoweredByBadge type="claude" size="sm" />
          </div>
        </CardTitle>
        <CardDescription>
          A comprehensive summary based on the idea refinement, research, and debate phases.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading && (
          <div className="flex flex-col items-center justify-center p-10 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-green-500" />
            <p className="text-muted-foreground">Generating your comprehensive report...</p>
            <p className="text-xs text-muted-foreground">(This may take a moment)</p>
          </div>
        )}
        {error && (
          <div className="p-4 border rounded-md bg-red-50 border-red-200 text-red-700">
            <h3 className="font-semibold mb-2 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Report Generation Issue
            </h3>
            <p>{error}</p>
          </div>
        )}
        {!loading && !error && !fullReportContent && (
           <div className="text-center p-10 text-muted-foreground">
             Report generation will begin shortly or requires context.
           </div>
        )}
        {/* Render the full report content using ReactMarkdown */}
        {!loading && !error && fullReportContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="p-6 border rounded-lg bg-white shadow-sm prose max-w-none dark:prose-invert" // Changed prose-sm to prose
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {fullReportContent}
            </ReactMarkdown>
          </motion.div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end pt-6">
        <Button onClick={onRestart} variant="outline" disabled={loading}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Start New Brainstorm
        </Button>
      </CardFooter>
    </Card>
  )
}
