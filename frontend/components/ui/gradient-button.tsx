import { Button } from "@/components/ui/button"
import type { ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface GradientButtonProps extends ButtonProps {
  gradientClassName?: string
}

export function GradientButton({
  children,
  className,
  gradientClassName = "bg-gradient-to-r from-blue-600 to-primary",
  ...props
}: GradientButtonProps) {
  return (
    <Button
      className={cn(
        "shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 hover:scale-105 border-0",
        gradientClassName,
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  )
}
