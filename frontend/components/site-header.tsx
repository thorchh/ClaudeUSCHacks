import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Brain } from "lucide-react"

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <div className="absolute inset-0 bg-primary rounded-full opacity-20 animate-pulse-slow"></div>
              <div
                className="absolute inset-0 bg-primary/30 rounded-full blur-md animate-pulse"
                style={{ animationDelay: "0.5s" }}
              ></div>
              <Brain className="h-5 w-5 text-primary relative z-10" />
            </div>
            <span className="font-bold text-xl">deepBrainstormAI</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-4">
            <Button variant="ghost" className="text-sm font-medium">
              How It Works
            </Button>
            <Button variant="ghost" className="text-sm font-medium">
              Pricing
            </Button>
            <Button variant="ghost" className="text-sm font-medium">
              About
            </Button>
            <Button variant="outline" className="text-sm font-medium">
              Sign In
            </Button>
            <Button className="text-sm font-medium">Get Started</Button>
          </nav>
        </div>
      </div>
    </header>
  )
}
