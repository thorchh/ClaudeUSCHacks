import type React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface PhaseIndicatorProps {
  phase: string
  label: string
  number: number
  isActive: boolean
  icon?: React.ReactNode
}

export default function PhaseIndicator({ phase, label, number, isActive, icon }: PhaseIndicatorProps) {
  return (
    <Badge
      variant={isActive ? "default" : "outline"}
      className={cn("phase-indicator transition-all duration-300 ease-in-out", isActive && "active shadow-md")}
    >
      {icon ? <span className="mr-1">{icon}</span> : <span className="mr-1">{number}</span>}
      {label}
    </Badge>
  )
}
