import SiteHeader from "@/components/site-header"
import SiteFooter from "@/components/site-footer"
import HeroSection from "@/components/sections/hero-section"
import ProcessSection from "@/components/sections/process-section"
import FeaturesSection from "@/components/sections/features-section"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <ProcessSection />
        <FeaturesSection />
      </main>
      <SiteFooter />
    </div>
  )
}
