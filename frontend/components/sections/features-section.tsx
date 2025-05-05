import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react"
import { GradientButton } from "@/components/ui/gradient-button"

interface FeatureItemProps {
  children: React.ReactNode
}

export default function FeaturesSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-accent/10 to-background relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>

      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>

      <div className="container px-4 md:px-6 relative z-10">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="space-y-4 animate-fade-in">
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary shadow-sm">
              <Sparkles className="h-3.5 w-3.5 inline-block mr-1" />
              <span>Why Choose Us</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Transform How You Generate Ideas
            </h2>
            <p className="text-gray-500 md:text-xl dark:text-gray-400">
              Our platform combines the latest in AI technology with proven brainstorming methodologies to help you
              generate better ideas, faster.
            </p>
            <ul className="space-y-2 stagger-animate">
              <FeatureItem>Reduce cognitive biases with multi-perspective analysis</FeatureItem>
              <FeatureItem>Save hours of research with AI-powered deep analysis</FeatureItem>
              <FeatureItem>Discover blind spots with our multi-agent debate system</FeatureItem>
              <FeatureItem>Get actionable insights with comprehensive reports</FeatureItem>
            </ul>
            <div className="pt-4">
              <Link href="/brainstorm">
                <GradientButton>
                  Try It Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </GradientButton>
              </Link>
            </div>
          </div>
          <VideoPreview />
        </div>
      </div>
    </section>
  )
}

function FeatureItem({ children }: FeatureItemProps) {
  return (
    <li className="flex items-center space-x-2 animate-slide-in-up">
      <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center shadow-sm">
        <CheckCircle2 className="h-3 w-3 text-green-600" />
      </div>
      <span>{children}</span>
    </li>
  )
}

function VideoPreview() {
  return (
    <div className="mx-auto lg:ml-0 animate-fade-in" style={{ animationDelay: "0.2s" }}>
      <div className="aspect-video overflow-hidden rounded-xl border shadow-xl relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
        <div className="h-full w-full bg-gradient-to-br from-primary/20 via-purple-100 to-blue-100 flex items-center justify-center relative">
          {/* Decorative elements */}
          <div className="absolute top-5 left-5 w-20 h-20 bg-primary/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-5 right-5 w-24 h-24 bg-blue-500/10 rounded-full blur-xl"></div>

          <div className="text-center p-6 relative z-10 backdrop-blur-sm bg-white/30 rounded-xl border border-white/20 shadow-lg">
            <div className="inline-block rounded-full bg-primary/10 p-3 mb-4 shadow-inner">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-primary"
              >
                <path d="M14.752 11.168l-3.197-2.132A1 1 0 0 0 10 9.87v4.263a1 1 0 0 0 1.555.832l3.197-2.132a1 1 0 0 0 0-1.664z" />
                <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">See It In Action</h3>
            <p className="text-gray-600 mb-4">Watch how deepBrainstormAI transforms ideas into actionable insights</p>
            <Button variant="outline" className="rounded-full bg-white/50 hover:bg-white/70 transition-all">
              Watch Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
