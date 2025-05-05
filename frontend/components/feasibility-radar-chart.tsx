"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"

interface FeasibilityRadarChartProps {
  data: { category: string; value: number }[]
}

export function FeasibilityRadarChart({ data }: FeasibilityRadarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set chart center and radius
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 20

    // Draw radar background
    drawRadarBackground(ctx, centerX, centerY, radius, data)

    // Draw data
    drawData(ctx, centerX, centerY, radius, data)
  }, [data])

  const drawRadarBackground = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number,
    data: { category: string; value: number }[],
  ) => {
    const numSegments = data.length
    const angleSlice = (Math.PI * 2) / numSegments

    // Draw axis lines
    for (let i = 0; i < numSegments; i++) {
      const angle = angleSlice * i - Math.PI / 2
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle))
      ctx.strokeStyle = "rgba(200, 200, 200, 0.5)"
      ctx.stroke()
    }

    // Draw connecting lines
    ctx.beginPath()
    for (let i = 0; i < numSegments; i++) {
      const angle = angleSlice * i - Math.PI / 2
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.closePath()
    ctx.strokeStyle = "rgba(200, 200, 200, 0.5)"
    ctx.stroke()

    // Draw labels
    ctx.font = "12px sans-serif"
    ctx.fillStyle = "rgba(50, 50, 50, 0.9)"
    ctx.textAlign = "center"
    for (let i = 0; i < numSegments; i++) {
      const angle = angleSlice * i - Math.PI / 2
      const x = centerX + (radius + 20) * Math.cos(angle)
      const y = centerY + (radius + 20) * Math.sin(angle)
      ctx.fillText(data[i].category, x, y)
    }
  }

  const drawData = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number,
    data: { category: string; value: number }[],
  ) => {
    const numSegments = data.length
    const angleSlice = (Math.PI * 2) / numSegments

    ctx.beginPath()
    for (let i = 0; i < numSegments; i++) {
      const angle = angleSlice * i - Math.PI / 2
      const value = data[i].value
      const x = centerX + radius * value * Math.cos(angle)
      const y = centerY + radius * value * Math.sin(angle)
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.closePath()
    ctx.fillStyle = "rgba(139, 92, 246, 0.5)"
    ctx.fill()
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center">
          <BarChart3 className="h-4 w-4 mr-2 text-primary" />
          Feasibility Assessment
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <canvas ref={canvasRef} className="w-full h-full" />
      </CardContent>
    </Card>
  )
}

export default FeasibilityRadarChart
