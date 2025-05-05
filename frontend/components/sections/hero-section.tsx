import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Brain, CheckCircle2, Lightbulb, Star, Users } from "lucide-react"
import { SparklesBadge } from "@/components/ui/sparkles-badge"
import { GradientButton } from "@/components/ui/gradient-button"

export default function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-accent/50 to-background"></div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute top-40 right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl"></div>

      {/* Floating shapes */}
      <div
        className="absolute top-1/4 left-1/4 w-8 h-8 border-2 border-primary/20 rounded-lg rotate-12 animate-float"
        style={{ animationDelay: "0.5s", animationDuration: "4s" }}
      ></div>
      <div
        className="absolute top-1/3 right-1/3 w-6 h-6 border-2 border-blue-500/20 rounded-full animate-float"
        style={{ animationDelay: "1.2s", animationDuration: "3.5s" }}
      ></div>
      <div
        className="absolute bottom-1/4 right-1/4 w-10 h-10 border-2 border-purple-500/20 rounded-md rotate-45 animate-float"
        style={{ animationDelay: "0.8s", animationDuration: "4.5s" }}
      ></div>

      <div className="container px-4 md:px-6 relative z-10">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="flex flex-col justify-center space-y-4 animate-fade-in">
            <div className="space-y-2">
              <SparklesBadge className="backdrop-blur-sm">AI-Powered Brainstorming</SparklesBadge>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Unlock Your{" "}
                <span className="gradient-text relative inline-block">
                  Best Ideas
                  <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-blue-500/50 rounded-full"></span>
                </span>{" "}
                with deepBrainstormAI
              </h1>
              <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                Multi-stage AI-powered brainstorming that explores every angle, challenges assumptions, and delivers
                comprehensive insights.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/brainstorm">
                <GradientButton size="lg" className="px-8">
                  Start Brainstorming
                  <ArrowRight className="ml-2 h-4 w-4" />
                </GradientButton>
              </Link>
              <Button size="lg" variant="outline" className="transition-all hover:bg-accent/20">
                See Examples
              </Button>
            </div>

            {/* Social proof */}
            <div className="flex items-center space-x-4 mt-6">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full border-2 border-background bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center text-xs font-medium text-gray-600`}
                  >
                    {["JD", "MK", "TS", "AR"][i - 1]}
                  </div>
                ))}
              </div>
              <div className="text-sm text-gray-500">
                <span className="font-medium">4.9/5</span> from over 2,000 users
                <div className="flex text-amber-400 mt-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-3 w-3 fill-current" />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <AppPreview />
        </div>
      </div>
    </section>
  )
}

function AppPreview() {
  return (
    <div className="mx-auto lg:mr-0 animate-fade-in" style={{ animationDelay: "0.2s" }}>
      <div className="relative rounded-xl border bg-card shadow-xl overflow-hidden backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>

        {/* App bar */}
        <div className="p-2 border-b bg-muted/30">
          <div className="flex items-center space-x-1.5 px-3 py-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
            <div className="ml-2 text-xs text-muted-foreground font-medium">deepBrainstormAI</div>
          </div>
        </div>

        <div className="p-6">
          {/* Preview content */}
          <div className="space-y-6 relative z-10">
            {/* Idea input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-medium flex items-center">
                  <Brain className="h-4 w-4 mr-1.5 text-primary" />
                  <span>Enter Your Idea</span>
                </h3>
                <Badge variant="outline" className="text-xs">
                  Phase 1/4
                </Badge>
              </div>
              <div className="relative rounded-lg border overflow-hidden shadow-sm">
                <div className="p-3 bg-white">
                  <div className="text-sm">
                    A subscription service for eco-friendly products with personalized recommendations
                  </div>
                </div>
                <div className="h-1 w-full bg-gradient-to-r from-primary via-blue-500 to-green-500 opacity-50"></div>
              </div>
            </div>

            {/* Agent responses - animated */}
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-medium flex items-center">
                  <Users className="h-4 w-4 mr-1.5 text-green-600" />
                  <span>Multi-Agent Analysis</span>
                </h3>
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>

              <div className="flex gap-2 items-start">
                <div className="w-8 h-8 rounded-full bg-green-100 flex-shrink-0 flex items-center justify-center text-xs font-medium text-green-700">
                  OP
                </div>
                <div className="rounded-lg border-l-4 border-l-green-500 bg-green-50 p-2 text-xs shadow-sm flex-1">
                  This concept has strong market potential. Eco-friendly products are growing at 25% annually, and
                  personalization increases retention by 40%.
                </div>
              </div>

              <div className="flex gap-2 items-start">
                <div className="w-8 h-8 rounded-full bg-red-100 flex-shrink-0 flex items-center justify-center text-xs font-medium text-red-700">
                  CR
                </div>
                <div className="rounded-lg border-l-4 border-l-red-500 bg-red-50 p-2 text-xs shadow-sm flex-1">
                  Consider supply chain challenges. Sourcing consistent eco-friendly products at scale may impact
                  profitability and delivery timelines.
                </div>
              </div>

              <div className="flex gap-2 items-start animate-pulse">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-xs font-medium text-blue-700">
                  AN
                </div>
                <div className="rounded-lg border-l-4 border-l-blue-500 bg-blue-50 p-2 text-xs shadow-sm flex-1">
                  <div className="flex items-center space-x-1">
                    <span className="inline-block h-1 w-1 bg-blue-500 rounded-full"></span>
                    <span className="inline-block h-1 w-1 bg-blue-500 rounded-full"></span>
                    <span className="inline-block h-1 w-1 bg-blue-500 rounded-full"></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Insights summary */}
            <div className="bg-muted/20 rounded-lg p-3 border shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium flex items-center">
                  <Lightbulb className="h-4 w-4 mr-1.5 text-amber-600" />
                  <span>Key Insights</span>
                </h3>
                <Badge className="text-xs bg-gradient-to-r from-blue-600 to-primary">New</Badge>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-start gap-1.5">
                  <div className="h-4 w-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="h-2.5 w-2.5 text-green-600" />
                  </div>
                  <span>Personalization algorithms increase customer retention by 40%</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <div className="h-4 w-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="h-2.5 w-2.5 text-green-600" />
                  </div>
                  <span>Target market growth of 25% annually in eco-friendly sector</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <div className="h-4 w-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="h-2.5 w-2.5 text-green-600" />
                  </div>
                  <span>Implement regional sourcing to reduce supply chain challenges</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reflection effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent pointer-events-none"></div>
      </div>
    </div>
  )
}
