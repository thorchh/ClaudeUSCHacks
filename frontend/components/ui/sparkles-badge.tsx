import type React from "react"
import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"

interface SparklesBadgeProps {
  children: React.ReactNode
  className?: string
}

export function SparklesBadge({ children, className = "" }: SparklesBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={`px-3 py-1 rounded-full border-primary/20 bg-primary/10 text-primary shadow-sm ${className}`}
    >
      <Sparkles className="h-3.5 w-3.5 mr-1" />
      <span>{children}</span>
    </Badge>
  )
}
