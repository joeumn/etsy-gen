"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface RevenueChartProps {
  data: Array<{
    month: string
    revenue: number
    sales: number
  }>
  className?: string
}

export function RevenueChart({ data, className }: RevenueChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={cn("w-full", className)}
    >
      <Card className="border-0 bg-gradient-to-br from-card to-card/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2D9CDB" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2D9CDB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B22" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF6B22" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                className="text-xs text-muted-foreground"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                className="text-xs text-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#2D9CDB"
                strokeWidth={2}
                fill="url(#revenueGradient)"
                name="Revenue"
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#FF6B22"
                strokeWidth={2}
                fill="url(#salesGradient)"
                name="Sales"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  )
}