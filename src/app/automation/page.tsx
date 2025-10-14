"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Sparkles,
  Settings,
  Zap,
  Clock,
  RefreshCw,
  BarChart3
} from "lucide-react";
import Link from "next/link";

export default function AutomationHub() {

  const automationStats = [
    {
      title: "Jobs Executed Today",
      value: "128",
      icon: Zap,
    },
    {
      title: "Last Run",
      value: "3 minutes ago",
      icon: Clock,
    },
    {
      title: "Success Rate",
      value: "99.2%",
      icon: BarChart3,
    },
    {
      title: "Next Run",
      value: "in 57 minutes",
      icon: RefreshCw,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-flame-gradient rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">FoundersForge</span>
          </motion.div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="outline" size="sm" asChild>
              <Link href="/settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
            <Button asChild size="sm">
                <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Automation Hub</h1>
          <p className="text-muted-foreground">
            Monitor the performance of your autonomous product empire.
          </p>
        </motion.div>

        {/* Automation Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {automationStats.map((stat, index) => (
            <StatCard
              key={stat.title}
              {...stat}
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* Job Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Automation Job Status</CardTitle>
            </CardHeader>
            <CardContent>
              {/* This is where you'd map over your job statuses and display them */}
              <p className="text-muted-foreground">Live job status monitoring coming soon...</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Strategy Reports */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>AI Strategy Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {/* This is where you'd map over your AI reports and display them */}
              <p className="text-muted-foreground">Daily AI-generated reports coming soon...</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
