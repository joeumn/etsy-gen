import { useState } from "react";
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
} from "lucide-react";
import { AppLayout } from "../components/layout/app-layout";
import { TrendScannerChart } from "../components/trend-scanner-chart";
import { NicheDistributionChart } from "../components/niche-distribution-chart";
import { AIAgentActivity } from "../components/ai-agent-activity";
import { MarketplacePerformance } from "../components/marketplace-performance";
import { QuickActions } from "../components/quick-actions";
import { RecentActivity } from "../components/recent-activity";
import { AIInsightsCard } from "../components/ai-insights-card";
import { AIChatAssistant, AIChatButton } from "../components/ai-chat-assistant";
import { KeyboardShortcutsModal } from "../components/keyboard-shortcuts-modal";
import { StatusIndicator, LiveStatusDot } from "../components/status-indicator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Separator } from "../components/ui/separator";
import { toast } from "sonner";
import { motion } from "motion/react";

const trendingNiches = [
  { name: "Wedding Planners", demand: 94, competition: "Low", profit: "$$$" },
  { name: "Fitness Trackers", demand: 87, competition: "Medium", profit: "$$" },
  { name: "Budget Templates", demand: 82, competition: "Low", profit: "$$$" },
  { name: "Resume Templates", demand: 79, competition: "High", profit: "$$" },
  { name: "Social Media Kits", demand: 76, competition: "Medium", profit: "$$$" },
];

const aiAgentStatus = [
  { id: "AGT-001", status: "processing", product: "Wedding Planner Bundle", progress: 67 },
  { id: "AGT-002", status: "processing", product: "Fitness Tracker Template", progress: 90 },
  { id: "AGT-003", status: "processing", product: "Budget Spreadsheet Pack", progress: 45 },
  { id: "AGT-004", status: "success", product: "Resume Template Set", progress: 100 },
];

const recentListings = [
  { product: "Ultimate Wedding Planner", marketplace: "Etsy", time: "5 min ago", status: "success" },
  { product: "Fitness Goal Tracker", marketplace: "Gumroad", time: "12 min ago", status: "success" },
  { product: "Monthly Budget Template", marketplace: "Creative Market", time: "28 min ago", status: "success" },
  { product: "Professional Resume Pack", marketplace: "Etsy", time: "1 hr ago", status: "success" },
];

export function DashboardPage() {
  const [chatOpen, setChatOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

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
            <h2 className="text-primary">
              AI Command Center
            </h2>
            <p className="text-muted-foreground">
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
