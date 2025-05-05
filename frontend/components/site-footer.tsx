import { Button } from "@/components/ui/button"
import { Brain } from "lucide-react"

export default function SiteFooter() {
  return (
    <footer className="border-t py-6 md:py-0 relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent"></div>
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row relative z-10">
        <div className="flex items-center gap-2">
          <div className="relative w-6 h-6 flex items-center justify-center">
            <div className="absolute inset-0 bg-primary rounded-full opacity-20"></div>
            <Brain className="h-4 w-4 text-primary" />
          </div>
          <p className="text-center text-sm leading-loose text-gray-500 md:text-left">
            © 2025 deepBrainstormAI. All rights reserved.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="hover:bg-primary/5 transition-colors">
            Terms
          </Button>
          <Button variant="ghost" size="sm" className="hover:bg-primary/5 transition-colors">
            Privacy
          </Button>
          <Button variant="ghost" size="sm" className="hover:bg-primary/5 transition-colors">
            Contact
          </Button>
        </div>
      </div>
    </footer>
  )
}
