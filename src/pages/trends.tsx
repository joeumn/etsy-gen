import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { 
  TrendingUp, 
  Sparkles, 
  Bot,
  ArrowUpRight,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Target
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

const trendingNiches = [
  {
    name: "Wedding Planning Suite",
    category: "Planners & Templates",
    demandScore: 94,
    competition: "Low",
    profitPotential: "$$$$",
    estimatedRevenue: "$8,500",
    marketplaces: ["Etsy", "Creative Market"],
    keywords: ["wedding planner", "bridal organizer", "wedding checklist"],
    insights: "Peak season approaching (May-June). 340% historical increase.",
  },
  {
    name: "Fitness & Meal Prep Bundle",
    category: "Health & Wellness",
    demandScore: 87,
    competition: "Medium",
    profitPotential: "$$$",
    estimatedRevenue: "$4,200",
    marketplaces: ["Gumroad", "Etsy"],
    keywords: ["fitness tracker", "meal prep", "workout planner"],
    insights: "New Year resolution traffic spike expected in January.",
  },
  {
    name: "Budget & Finance Tracker",
    category: "Productivity",
    demandScore: 82,
    competition: "Low",
    profitPotential: "$$$",
    estimatedRevenue: "$3,800",
    marketplaces: ["Etsy", "Gumroad", "Creative Market"],
    keywords: ["budget planner", "expense tracker", "financial planner"],
    insights: "Consistent year-round demand. Low competition opportunity.",
  },
  {
    name: "Social Media Templates",
    category: "Marketing",
    demandScore: 79,
    competition: "High",
    profitPotential: "$$",
    estimatedRevenue: "$2,100",
    marketplaces: ["Creative Market", "Etsy"],
    keywords: ["social media templates", "instagram templates", "content calendar"],
    insights: "High competition but massive market size. Focus on niche angles.",
  },
  {
    name: "Resume & CV Templates",
    category: "Career",
    demandScore: 76,
    competition: "High",
    profitPotential: "$$",
    estimatedRevenue: "$1,900",
    marketplaces: ["Etsy", "Creative Market"],
    keywords: ["resume template", "cv design", "professional resume"],
    insights: "Steady demand. Differentiate with ATS-friendly designs.",
  },
];

const emergingTrends = [
  { trend: "AI Prompt Templates", growth: "+340%", time: "Last 7 days" },
  { trend: "Digital Notion Templates", growth: "+215%", time: "Last 14 days" },
  { trend: "Canva Template Bundles", growth: "+180%", time: "Last 30 days" },
  { trend: "PLR Digital Products", growth: "+165%", time: "Last 14 days" },
];

export function TrendsPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Trend Intelligence
            </h2>
            <p className="text-muted-foreground">
              AI-discovered opportunities in real-time
            </p>
          </div>
          <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
            <Sparkles className="mr-2 h-4 w-4" />
            Scan Now
          </Button>
        </div>

        {/* Scanner Status */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-gradient-to-br from-primary to-accent p-3 animate-pulse">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4>AI Scanner Active</h4>
                  <p className="text-sm text-muted-foreground">
                    Currently analyzing 3 marketplaces • 579 trends discovered today
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge className="mb-2 bg-success">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Operational
                </Badge>
                <p className="text-xs text-muted-foreground">Next scan: 2 min</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <p className="text-sm text-muted-foreground">Opportunities Found</p>
                </div>
                <h3 className="text-3xl">127</h3>
                <p className="text-xs text-success">+23 since yesterday</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-secondary" />
                  <p className="text-sm text-muted-foreground">High-Value Niches</p>
                </div>
                <h3 className="text-3xl">18</h3>
                <p className="text-xs text-muted-foreground">Low competition</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-accent" />
                  <p className="text-sm text-muted-foreground">Est. Revenue Potential</p>
                </div>
                <h3 className="text-3xl">$89K</h3>
                <p className="text-xs text-muted-foreground">Next 30 days</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-success" />
                  <p className="text-sm text-muted-foreground">Ready to Generate</p>
                </div>
                <h3 className="text-3xl">42</h3>
                <p className="text-xs text-muted-foreground">Validated opportunities</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="top-niches" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="top-niches">Top Niches</TabsTrigger>
            <TabsTrigger value="emerging">Emerging Trends</TabsTrigger>
            <TabsTrigger value="marketplace">By Marketplace</TabsTrigger>
          </TabsList>

          <TabsContent value="top-niches" className="space-y-6">
            <div className="space-y-4">
              {trendingNiches.map((niche, i) => (
                <Card key={i} className="overflow-hidden transition-all hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <CardTitle>{niche.name}</CardTitle>
                          <Badge variant="outline">{niche.category}</Badge>
                        </div>
                        <CardDescription className="mt-2">
                          {niche.insights}
                        </CardDescription>
                      </div>
                      <Badge className="bg-gradient-to-r from-primary to-accent text-lg">
                        {niche.demandScore}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="mb-1 text-xs text-muted-foreground">Competition</p>
                        <p className="font-semibold">{niche.competition}</p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="mb-1 text-xs text-muted-foreground">Profit Potential</p>
                        <p className="font-semibold">{niche.profitPotential}</p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="mb-1 text-xs text-muted-foreground">Est. Revenue</p>
                        <p className="font-semibold text-success">{niche.estimatedRevenue}</p>
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-sm text-muted-foreground">Target Marketplaces:</p>
                      <div className="flex flex-wrap gap-2">
                        {niche.marketplaces.map((marketplace) => (
                          <Badge key={marketplace} variant="outline">
                            {marketplace}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-sm text-muted-foreground">Top Keywords:</p>
                      <div className="flex flex-wrap gap-2">
                        {niche.keywords.map((keyword) => (
                          <Badge key={keyword} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Demand Score</span>
                        <span>{niche.demandScore}%</span>
                      </div>
                      <Progress value={niche.demandScore} className="h-2" />
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                        <Bot className="mr-2 h-4 w-4" />
                        Generate Product
                      </Button>
                      <Button variant="outline" className="flex-1">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="emerging" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                  <CardTitle>Emerging Trends</CardTitle>
                </div>
                <CardDescription>
                  Rapidly growing opportunities detected by AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {emergingTrends.map((trend, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border bg-card p-4"
                    >
                      <div>
                        <h4>{trend.trend}</h4>
                        <p className="text-sm text-muted-foreground">{trend.time}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className="bg-success text-lg">
                          <ArrowUpRight className="mr-1 h-4 w-4" />
                          {trend.growth}
                        </Badge>
                        <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                          <Bot className="mr-2 h-4 w-4" />
                          Generate
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="marketplace" className="space-y-6">
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                Marketplace-specific trend analysis coming soon
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
