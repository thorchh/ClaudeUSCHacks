"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ArrowLeftRight, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Feasibility {
  technical: number
  market: number
  novelty: number
}

interface IdeaVariant {
  id: string
  content: string
  pushback: string
  feasibility: Feasibility
  risks: string
  tags: string[]
  framework: string
}

interface VariantComparisonCardProps {
  variants: IdeaVariant[]
  selectedVariant: string | null
  onSelectVariant: (id: string) => void
}

export default function VariantComparisonCard({
  variants,
  selectedVariant,
  onSelectVariant,
}: VariantComparisonCardProps) {
  const [compareMode, setCompareMode] = useState(false)
  const [compareVariants, setCompareVariants] = useState<string[]>([])

  const toggleCompareMode = () => {
    setCompareMode(!compareMode)
    setCompareVariants([])
  }

  const toggleVariantForComparison = (id: string) => {
    if (compareVariants.includes(id)) {
      setCompareVariants(compareVariants.filter((v) => v !== id))
    } else {
      if (compareVariants.length < 2) {
        setCompareVariants([...compareVariants, id])
      }
    }
  }

  const getFeasibilityColor = (score: number) => {
    if (score >= 85) return "bg-green-500"
    if (score >= 70) return "bg-amber-500"
    return "bg-red-500"
  }

  const getFrameworkColor = (framework: string) => {
    switch (framework) {
      case "SCAMPER":
        return "text-blue-600 bg-blue-50 border-blue-200"
      case "First Principles":
        return "text-green-600 bg-green-50 border-green-200"
      case "Six Thinking Hats":
        return "text-amber-600 bg-amber-50 border-amber-200"
      case "Cross-Industry Analogies":
        return "text-purple-600 bg-purple-50 border-purple-200"
      case "Hybrid Concepts":
        return "text-indigo-600 bg-indigo-50 border-indigo-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getAverageFeasibility = (variant: IdeaVariant) => {
    return Math.round((variant.feasibility.technical + variant.feasibility.market + variant.feasibility.novelty) / 3)
  }

  if (compareMode && compareVariants.length === 2) {
    const variant1 = variants.find((v) => v.id === compareVariants[0])
    const variant2 = variants.find((v) => v.id === compareVariants[1])

    if (!variant1 || !variant2) return null

    return (
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base flex items-center">
              <BarChart3 className="h-4 w-4 mr-2 text-primary" />
              Variant Comparison
            </CardTitle>
            <Button variant="outline" size="sm" onClick={toggleCompareMode} className="h-8">
              Exit Comparison
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1 font-medium text-sm"></div>
            <div className="col-span-1 text-center">
              <Badge variant="outline" className={cn("text-xs mb-1", getFrameworkColor(variant1.framework))}>
                {variant1.framework}
              </Badge>
              <div className="text-sm font-medium truncate max-w-[180px] mx-auto">
                {variant1.content.substring(0, 40)}...
              </div>
            </div>
            <div className="col-span-1 text-center">
              <Badge variant="outline" className={cn("text-xs mb-1", getFrameworkColor(variant2.framework))}>
                {variant2.framework}
              </Badge>
              <div className="text-sm font-medium truncate max-w-[180px] mx-auto">
                {variant2.content.substring(0, 40)}...
              </div>
            </div>

            <div className="col-span-1 text-sm">Technical Feasibility</div>
            <div className="col-span-1">
              <div className="flex justify-center items-center space-x-2">
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getFeasibilityColor(variant1.feasibility.technical)}`}
                    style={{ width: `${variant1.feasibility.technical}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium">{variant1.feasibility.technical}%</span>
              </div>
            </div>
            <div className="col-span-1">
              <div className="flex justify-center items-center space-x-2">
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getFeasibilityColor(variant2.feasibility.technical)}`}
                    style={{ width: `${variant2.feasibility.technical}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium">{variant2.feasibility.technical}%</span>
              </div>
            </div>

            <div className="col-span-1 text-sm">Market Potential</div>
            <div className="col-span-1">
              <div className="flex justify-center items-center space-x-2">
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getFeasibilityColor(variant1.feasibility.market)}`}
                    style={{ width: `${variant1.feasibility.market}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium">{variant1.feasibility.market}%</span>
              </div>
            </div>
            <div className="col-span-1">
              <div className="flex justify-center items-center space-x-2">
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getFeasibilityColor(variant2.feasibility.market)}`}
                    style={{ width: `${variant2.feasibility.market}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium">{variant2.feasibility.market}%</span>
              </div>
            </div>

            <div className="col-span-1 text-sm">Innovation Factor</div>
            <div className="col-span-1">
              <div className="flex justify-center items-center space-x-2">
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getFeasibilityColor(variant1.feasibility.novelty)}`}
                    style={{ width: `${variant1.feasibility.novelty}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium">{variant1.feasibility.novelty}%</span>
              </div>
            </div>
            <div className="col-span-1">
              <div className="flex justify-center items-center space-x-2">
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getFeasibilityColor(variant2.feasibility.novelty)}`}
                    style={{ width: `${variant2.feasibility.novelty}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium">{variant2.feasibility.novelty}%</span>
              </div>
            </div>

            <div className="col-span-1 text-sm">Overall Score</div>
            <div className="col-span-1">
              <div className="text-center font-medium">{getAverageFeasibility(variant1)}%</div>
            </div>
            <div className="col-span-1">
              <div className="text-center font-medium">{getAverageFeasibility(variant2)}%</div>
            </div>

            <div className="col-span-1 text-sm">Key Challenge</div>
            <div className="col-span-1">
              <div className="text-xs p-2 bg-amber-50 border border-amber-100 rounded-md">{variant1.pushback}</div>
            </div>
            <div className="col-span-1">
              <div className="text-xs p-2 bg-amber-50 border border-amber-100 rounded-md">{variant2.pushback}</div>
            </div>

            <div className="col-span-3 mt-2">
              <div className="flex justify-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onSelectVariant(variant1.id)
                    toggleCompareMode()
                  }}
                  className={cn("h-8", selectedVariant === variant1.id ? "border-primary text-primary" : "")}
                >
                  Select Variant 1
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onSelectVariant(variant2.id)
                    toggleCompareMode()
                  }}
                  className={cn("h-8", selectedVariant === variant2.id ? "border-primary text-primary" : "")}
                >
                  Select Variant 2
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base flex items-center">
            <BarChart3 className="h-4 w-4 mr-2 text-primary" />
            Variant Overview
          </CardTitle>
          <Button variant="outline" size="sm" onClick={toggleCompareMode} className="h-8">
            {compareMode ? "Cancel Compare" : "Compare Variants"}
            <ArrowLeftRight className="ml-2 h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-3">
          {variants.map((variant) => {
            const avgFeasibility = getAverageFeasibility(variant)

            return (
              <div
                key={variant.id}
                className={cn(
                  "p-3 border rounded-lg flex items-center justify-between transition-all",
                  selectedVariant === variant.id ? "border-primary bg-primary/5" : "hover:border-primary/30",
                  compareMode && "cursor-pointer hover:bg-gray-50",
                )}
                onClick={() => compareMode && toggleVariantForComparison(variant.id)}
              >
                <div className="flex items-center space-x-3">
                  {compareMode && (
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full border flex items-center justify-center",
                        compareVariants.includes(variant.id)
                          ? "bg-primary border-primary text-white"
                          : "border-gray-300",
                      )}
                    >
                      {compareVariants.includes(variant.id) && <CheckCircle2 className="h-4 w-4" />}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant="outline" className={cn("text-xs", getFrameworkColor(variant.framework))}>
                        {variant.framework}
                      </Badge>
                      <div className="text-xs text-gray-500 truncate max-w-[300px]">
                        {variant.content.substring(0, 60)}...
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <div className="h-1.5 w-16 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getFeasibilityColor(avgFeasibility)}`}
                            style={{ width: `${avgFeasibility}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium">{avgFeasibility}%</span>
                      </div>
                      <span className="text-xs text-gray-500">overall score</span>
                    </div>
                  </div>
                </div>

                {!compareMode && (
                  <Button
                    size="sm"
                    variant={selectedVariant === variant.id ? "default" : "outline"}
                    className="h-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectVariant(variant.id)
                    }}
                  >
                    {selectedVariant === variant.id ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                        Selected
                      </>
                    ) : (
                      "Select"
                    )}
                  </Button>
                )}
              </div>
            )
          })}
        </div>

        {compareMode && (
          <div className="mt-4 text-center text-sm text-gray-500">
            {compareVariants.length === 0
              ? "Select two variants to compare"
              : compareVariants.length === 1
                ? "Select one more variant to compare"
                : ""}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
