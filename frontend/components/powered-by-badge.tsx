import { cn } from "@/lib/utils"

interface PoweredByBadgeProps {
  type?: "claude" | "claude-3.7"
  size?: "sm" | "md" | "lg"
}

export default function PoweredByBadge({ type = "claude-3.7", size = "md" }: PoweredByBadgeProps) {
  const getBadgeContent = () => {
    switch (type) {
      case "claude":
        return {
          text: "Claude",
          bgColor: "bg-gradient-to-r from-purple-50 to-purple-100",
          textColor: "text-purple-700",
          borderColor: "border-purple-200",
          icon: (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mr-1"
            >
              <path d="M12 2L6.5 11H17.5L12 2Z" fill="#7C3AED" fillOpacity="0.5" />
              <path d="M12 22L17.5 13H6.5L12 22Z" fill="#7C3AED" fillOpacity="0.5" />
            </svg>
          ),
        }
      case "claude-3.7":
      default:
        return {
          text: "Claude 3.7",
          bgColor: "bg-gradient-to-r from-purple-50 to-purple-100",
          textColor: "text-purple-700",
          borderColor: "border-purple-200",
          icon: (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mr-1"
            >
              <path d="M12 2L6.5 11H17.5L12 2Z" fill="#7C3AED" fillOpacity="0.5" />
              <path d="M12 22L17.5 13H6.5L12 22Z" fill="#7C3AED" fillOpacity="0.5" />
            </svg>
          ),
        }
    }
  }

  const badge = getBadgeContent()

  const sizeClasses = {
    sm: "text-xs py-0.5 px-1.5",
    md: "text-sm py-1 px-2",
    lg: "text-base py-1.5 px-3",
  }

  return (
    <div
      className={cn(
        "rounded-full border flex items-center font-medium",
        badge.bgColor,
        badge.textColor,
        badge.borderColor,
        sizeClasses[size],
      )}
    >
      {badge.icon}
      <span>Powered by {badge.text}</span>
    </div>
  )
}
