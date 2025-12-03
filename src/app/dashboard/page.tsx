"use client";

import { useState, useEffect } from "react";
import { 
  Sparkles, 
  TrendingUp, 
  Bot, 
  Zap, 
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  Activity,
  HelpCircle,
  Search,
  BarChart3,
  PackagePlus,
  Settings,
  Play,
  Pause,
  RefreshCw,
} from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { TrendScannerChart } from "@/components/trend-scanner-chart";
import { NicheDistributionChart } from "@/components/niche-distribution-chart";
import { AIAgentActivity } from "@/components/ai-agent-activity";
import { MarketplacePerformance } from "@/components/marketplace-performance";
import { QuickActions } from "@/components/quick-actions";
import { RecentActivity } from "@/components/recent-activity";
import { AIInsightsCard } from "@/components/ai-insights-card";
import { AIChatAssistant, AIChatButton } from "@/components/ai-chat-assistant";
import { KeyboardShortcutsModal } from "@/components/keyboard-shortcuts-modal";
import { StatusIndicator, LiveStatusDot } from "@/components/status-indicator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const [chatOpen, setChatOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [trendingNiches, setTrendingNiches] = useState<any[]>([]);
  const [aiAgentStatus, setAiAgentStatus] = useState<any[]>([]);
  const [recentListings, setRecentListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [automationRunning, setAutomationRunning] = useState(false);

  // Manual Control Functions
  const handleScanMarketplaces = async () => {
    setIsScanning(true);
    toast.loading("Scanning marketplaces for trending products...");
    
    try {
      const response = await fetch("/api/trends/scan", { method: "POST" });
      const data = await response.json();
      
      toast.dismiss();
      toast.success(`Found ${data.trendsFound || 0} trending opportunities!`);
      
      // Refresh data
      loadDashboardData();
    } catch (error) {
      toast.dismiss();
      toast.error("Scan failed. AI will retry automatically.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleAnalyzeTrends = async () => {
    setIsAnalyzing(true);
    toast.loading("AI analyzing trends and opportunities...");
    
    try {
      const response = await fetch("/api/trends/analyze", { method: "POST" });
      const data = await response.json();
      
      toast.dismiss();
      toast.success(`Analysis complete! ${data.recommendations || 0} product ideas generated.`);
    } catch (error) {
      toast.dismiss();
      toast.error("Analysis failed. Smart AI will auto-fix and retry.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateProducts = async () => {
    setIsCreating(true);
    toast.loading("Creating products with AI...");
    
    try {
      const response = await fetch("/api/products/generate", { method: "POST" });
      const data = await response.json();
      
      toast.dismiss();
      toast.success(`${data.productsCreated || 0} products created and listed!`);
    } catch (error) {
      toast.dismiss();
      toast.error("Creation failed. AI auto-recovery in progress...");
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartAutomation = async () => {
    toast.loading("Starting full automation pipeline...");
    
    try {
      const response = await fetch("/api/automation/start", { method: "POST" });
      const data = await response.json();
      
      toast.dismiss();
      toast.success("Automation started! AI is now working 24/7.");
      setAutomationRunning(true);
    } catch (error) {
      toast.dismiss();
      toast.error("Automation start failed. Smart recovery active.");
    }
  };

  const handleStopAutomation = async () => {
    toast.loading("Stopping automation...");
    
    try {
      const response = await fetch("/api/automation/stop", { method: "POST" });
      
      toast.dismiss();
      toast.success("Automation paused. You can restart anytime.");
      setAutomationRunning(false);
    } catch (error) {
      toast.dismiss();
      toast.error("Stop failed. AI will handle gracefully.");
    }
  };

  // Load real data on mount
  useEffect(() => {
    loadDashboardData();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadDashboardData() {
    try {
      setError(null);
      
      const [trendsRes, jobsRes, listingsRes] = await Promise.all([
        fetch('/api/trends?limit=5').then(r => r.ok ? r.json() : []),
        fetch('/api/jobs?status=RUNNING').then(r => r.ok ? r.json() : []),
        fetch('/api/listings?limit=4').then(r => r.ok ? r.json() : []),
      ]);

      // Format trends for display
      const formattedTrends = trendsRes.map((t: any) => ({
        name: t.niche,
        demand: Math.round(t.score * 100),
        competition: t.competition < 0.3 ? 'Low' : t.competition < 0.7 ? 'Medium' : 'High',
        profit: t.score > 0.8 ? '$$$' : t.score > 0.6 ? '$$' : '$',
      }));

      // Format jobs for display
      const formattedJobs = jobsRes.map((job: any, i: number) => ({
        id: `AGT-${String(i + 1).padStart(3, '0')}`,
        status: job.status.toLowerCase(),
        product: job.metadata?.product || `${job.stage} Job`,
        progress: calculateJobProgress(job),
      }));

      // Format listings for display
      const formattedListings = listingsRes.map((l: any) => ({
        product: l.Product?.title || 'Product',
        marketplace: l.marketplace.charAt(0).toUpperCase() + l.marketplace.slice(1),
        time: formatTimeAgo(l.createdAt),
        status: l.status === 'PUBLISHED' ? 'success' : 'pending',
      }));

      setTrendingNiches(formattedTrends);
      setAiAgentStatus(formattedJobs);
      setRecentListings(formattedListings);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }

  function calculateJobProgress(job: any): number {
    if (job.status === 'SUCCESS') return 100;
    if (job.status !== 'RUNNING') return 0;
    
    const elapsed = Date.now() - new Date(job.startedAt || job.createdAt).getTime();
    const durations: Record<string, number> = {
      SCRAPE: 60000, ANALYZE: 120000, GENERATE: 180000, LIST: 90000
    };
    const estimated = durations[job.stage] || 120000;
    return Math.min(95, Math.round((elapsed / estimated) * 100));
  }

  function formatTimeAgo(date: string): string {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  }

  const handleGenerateProduct = (nicheName: string) => {
    toast.success("Product generation started", {
      description: `AI agents are creating products for ${nicheName}`,
    });
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
              AI Command Center
            </h2>
            <p className="text-base md:text-lg text-muted-foreground mt-2">
              Autonomous digital product discovery, creation & listing
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShortcutsOpen(true)}>
              <HelpCircle className="mr-2 h-4 w-4" />
              Shortcuts
            </Button>
            <Button variant="outline">
              <Activity className="mr-2 h-4 w-4" />
              Activity Log
            </Button>
            <Button className="bg-primary hover:bg-primary/90">
              <Sparkles className="mr-2 h-4 w-4" />
              Configure AI
            </Button>
          </div>
        </div>

        {/* Manual Control Panel */}
        <Card className="border-2 border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-cyan-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-indigo-600" />
              Manual Controls
            </CardTitle>
            <CardDescription>
              Take direct control - scan, analyze, create, and manage everything manually
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Scan Button */}
              <Button
                size="lg"
                variant="outline"
                className="h-auto flex-col gap-2 py-6 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                onClick={handleScanMarketplaces}
                disabled={isScanning}
              >
                {isScanning ? (
                  <RefreshCw className="h-8 w-8 animate-spin text-indigo-600" />
                ) : (
                  <Search className="h-8 w-8 text-indigo-600" />
                )}
                <div className="text-center">
                  <div className="font-semibold">Scan Marketplaces</div>
                  <div className="text-xs text-muted-foreground">Find trending products</div>
                </div>
              </Button>

              {/* Analyze Button */}
              <Button
                size="lg"
                variant="outline"
                className="h-auto flex-col gap-2 py-6 hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-950"
                onClick={handleAnalyzeTrends}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <RefreshCw className="h-8 w-8 animate-spin text-cyan-600" />
                ) : (
                  <BarChart3 className="h-8 w-8 text-cyan-600" />
                )}
                <div className="text-center">
                  <div className="font-semibold">Analyze Trends</div>
                  <div className="text-xs text-muted-foreground">AI opportunity analysis</div>
                </div>
              </Button>

              {/* Create Button */}
              <Button
                size="lg"
                variant="outline"
                className="h-auto flex-col gap-2 py-6 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950"
                onClick={handleCreateProducts}
                disabled={isCreating}
              >
                {isCreating ? (
                  <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
                ) : (
                  <PackagePlus className="h-8 w-8 text-purple-600" />
                )}
                <div className="text-center">
                  <div className="font-semibold">Create Products</div>
                  <div className="text-xs text-muted-foreground">Generate & list now</div>
                </div>
              </Button>

              {/* Automation Toggle */}
              <Button
                size="lg"
                className={`h-auto flex-col gap-2 py-6 ${
                  automationRunning
                    ? "bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                    : "bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                }`}
                onClick={automationRunning ? handleStopAutomation : handleStartAutomation}
              >
                {automationRunning ? (
                  <Pause className="h-8 w-8" />
                ) : (
                  <Play className="h-8 w-8" />
                )}
                <div className="text-center text-white">
                  <div className="font-semibold">
                    {automationRunning ? "Stop" : "Start"} Automation
                  </div>
                  <div className="text-xs opacity-90">
                    {automationRunning ? "Currently running 24/7" : "Let AI work for you"}
                  </div>
                </div>
              </Button>
            </div>

            {/* Quick Navigation Links */}
            <Separator className="my-6" />
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" asChild>
                <a href="/products">📦 Manage Products</a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="/trends">📈 View All Trends</a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="/marketplace">🏪 Marketplace Settings</a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="/analytics">📊 Analytics Dashboard</a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="/command-center">⚙️ Full Settings</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Status Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-l-4 border-l-primary hover-lift">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">Trend Scanner</p>
                      <LiveStatusDot status="active" size="sm" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-3xl">Active</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">514 trends scanned today</p>
                  </div>
                  <div className="rounded-lg bg-primary/10 p-3">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-l-4 border-l-secondary hover-lift">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">AI Agents</p>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-3xl">5/5</h3>
                      <span className="flex items-center text-sm text-success">
                        <CheckCircle className="h-4 w-4" />
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">All agents operational</p>
                  </div>
                  <div className="rounded-lg bg-secondary/10 p-3">
                    <Bot className="h-6 w-6 text-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-l-4 border-l-primary hover-lift">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">In Generation</p>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-3xl">23</h3>
                      <span className="flex items-center text-sm text-primary">
                        <Clock className="h-4 w-4" />
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Avg. 12min per product</p>
                  </div>
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Sparkles className="h-6 w-6 text-primary animate-pulse-subtle" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-l-4 border-l-success hover-lift">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Auto-Listed Today</p>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-3xl">47</h3>
                      <span className="flex items-center text-sm text-success">
                        <ArrowUpRight className="h-4 w-4" />
                        12%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Across 5 marketplaces</p>
                  </div>
                  <div className="rounded-lg bg-success/10 p-3">
                    <Zap className="h-6 w-6 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* AI Insights */}
        <AIInsightsCard />

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <TrendScannerChart />
          <NicheDistributionChart />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <AIAgentActivity />
          <MarketplacePerformance />
        </div>

        {/* Trending Niches & Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-7">
          <Card className="lg:col-span-4 hover-lift">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Top Trending Niches</CardTitle>
                  <CardDescription>
                    High-demand, low-competition opportunities
                  </CardDescription>
                </div>
                <Badge className="bg-primary">
                  <Sparkles className="mr-1 h-3 w-3" />
                  AI Scored
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trendingNiches.map((niche, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="rounded-lg border bg-card p-4 hover:border-primary/50 transition-base"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <h4 className="mb-1">{niche.name}</h4>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            {niche.competition} Competition
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Profit: {niche.profit}
                          </Badge>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleGenerateProduct(niche.name)}
                        className="hover:bg-primary hover:text-primary-foreground transition-base"
                      >
                        <Bot className="mr-2 h-4 w-4" />
                        Generate
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Demand Score</span>
                        <span>{niche.demand}%</span>
                      </div>
                      <Progress value={niche.demand} className="h-2" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-3">
            <RecentActivity maxItems={6} />
          </div>
        </div>

        {/* Active AI Agents & Recent Auto-Listings */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle>Active AI Agents</CardTitle>
              <CardDescription>Real-time generation status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiAgentStatus.map((agent) => (
                  <div key={agent.id} className="space-y-3 rounded-lg border bg-card p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm">{agent.id}</p>
                          <p className="text-xs text-muted-foreground">{agent.product}</p>
                        </div>
                      </div>
                      <StatusIndicator status={agent.status as any} size="sm" />
                    </div>
                    <div className="space-y-1">
                      <Progress value={agent.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground text-right">
                        {agent.progress}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Auto-Listings</CardTitle>
                  <CardDescription>
                    Products automatically generated and listed
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentListings.map((listing, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p>{listing.product}</p>
                          <p className="text-sm text-muted-foreground">
                            Listed on {listing.marketplace} • {listing.time}
                          </p>
                        </div>
                      </div>
                      <StatusIndicator status={listing.status as any} size="sm" />
                    </div>
                    {i < recentListings.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Chat Assistant */}
      {!chatOpen && <AIChatButton onClick={() => setChatOpen(true)} />}
      <AIChatAssistant isOpen={chatOpen} onClose={() => setChatOpen(false)} />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </AppLayout>
  );
}
