import { SparklesBadge } from "@/components/ui/sparkles-badge"

interface ProcessStepProps {
  number: number
  title: string
  description: string
  tag: string
  color: "primary" | "blue" | "green" | "amber"
}

export default function ProcessSection() {
  return (
    <section className="w-full py-12 md:py-16 bg-gradient-to-b from-background to-accent/10 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>

      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
          <div className="space-y-2 animate-fade-in">
            <SparklesBadge>Our Process</SparklesBadge>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How deepBrainstormAI Works</h2>
            <p className="max-w-[700px] text-gray-500 mx-auto">
              Our multi-stage AI process helps you explore ideas more thoroughly than ever before.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <ProcessStep
            number={1}
            title="Initial Conversation"
            description="Clarify your idea through an interactive dialogue with our AI to explore your concept in depth."
            tag="Interactive"
            color="primary"
          />
          <ProcessStep
            number={2}
            title="Deep Research"
            description="Our AI explores your idea from multiple disciplines, gathering insights from various fields of knowledge."
            tag="Data-driven"
            color="blue"
          />
          <ProcessStep
            number={3}
            title="Multi-Agent Debate"
            description="AI agents challenge and validate your idea from different angles, identifying blind spots."
            tag="Critical Analysis"
            color="green"
          />
          <ProcessStep
            number={4}
            title="Comprehensive Report"
            description="Receive a detailed analysis with actionable insights that you can implement immediately."
            tag="Actionable"
            color="amber"
          />
        </div>
      </div>
    </section>
  )
}

function ProcessStep({ number, title, description, tag, color }: ProcessStepProps) {
  const colorClasses = {
    primary: {
      accent: "bg-primary",
      border: "bg-primary/20 group-hover:bg-primary/40",
      tag: "bg-primary/10 text-primary",
    },
    blue: {
      accent: "bg-blue-500",
      border: "bg-blue-200 group-hover:bg-blue-300",
      tag: "bg-blue-50 text-blue-600",
    },
    green: {
      accent: "bg-green-500",
      border: "bg-green-200 group-hover:bg-green-300",
      tag: "bg-green-50 text-green-600",
    },
    amber: {
      accent: "bg-amber-500",
      border: "bg-amber-200 group-hover:bg-amber-300",
      tag: "bg-amber-50 text-amber-600",
    },
  }

  return (
    <div className="group relative p-4 rounded-xl border bg-card shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div
        className={`absolute right-0 top-0 h-full w-1.5 ${colorClasses[color].border} transition-colors duration-300`}
      ></div>
      <div className="flex items-center mb-3">
        <div
          className={`w-8 h-8 rounded-full ${colorClasses[color].accent} flex items-center justify-center text-white font-bold mr-2 shrink-0`}
        >
          {number}
        </div>
        <h3 className="text-lg font-bold">{title}</h3>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      <div className="mt-3 flex flex-wrap gap-1">
        <span className={`px-2 py-0.5 ${colorClasses[color].tag} rounded-full text-xs font-medium`}>{tag}</span>
      </div>
    </div>
  )
}
