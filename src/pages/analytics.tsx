import { Eye, TrendingUp, Sparkles, ArrowUpRight, DollarSign, Package, Zap } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart
} from "recharts";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";

const topProducts = [
  { name: "Wedding Planner Bundle", marketplace: "Etsy", sales: 234, revenue: 7020, growth: 23 },
  { name: "Fitness Tracker Pro", marketplace: "Gumroad", sales: 189, revenue: 5292, growth: 18 },
  { name: "Budget Spreadsheet Pack", marketplace: "Creative Market", sales: 156, revenue: 4680, growth: 12 },
  { name: "Resume Template Set", marketplace: "Etsy", sales: 143, revenue: 4004, growth: 31 },
  { name: "Social Media Calendar", marketplace: "Gumroad", sales: 128, revenue: 3584, growth: 15 },
];

const revenueData = [
  { day: "Mon", revenue: 2400, products: 45, aiGenerated: 12 },
  { day: "Tue", revenue: 3200, products: 52, aiGenerated: 15 },
  { day: "Wed", revenue: 2800, products: 38, aiGenerated: 10 },
  { day: "Thu", revenue: 3600, products: 61, aiGenerated: 18 },
  { day: "Fri", revenue: 4200, products: 73, aiGenerated: 22 },
  { day: "Sat", revenue: 3900, products: 68, aiGenerated: 19 },
  { day: "Sun", revenue: 4500, products: 82, aiGenerated: 25 },
];

const categoryPerformance = [
  { category: "Planners", revenue: 12450, percentage: 32 },
  { category: "Templates", revenue: 9800, percentage: 25 },
  { category: "Digital Art", revenue: 7650, percentage: 20 },
  { category: "Printables", revenue: 5890, percentage: 15 },
  { category: "Others", revenue: 3210, percentage: 8 },
];

const aiInsights = [
  {
    priority: "High",
    insight: "Wedding season (May-June) approaching. Historical data shows 340% increase in wedding planner sales. Recommend generating 15+ new wedding-related products.",
    action: "Generate Products",
    impact: "+$8,500 potential revenue"
  },
  {
    priority: "High",
    insight: "Fitness trackers see 78% sales spike in January. Current inventory of 12 products insufficient. Competitor analysis suggests opportunity for meal prep planners.",
    action: "Expand Category",
    impact: "+$3,200 potential revenue"
  },
  {
    priority: "Medium",
    insight: "Budget templates convert 23% better on Gumroad vs Etsy. Recommend auto-listing 8 existing Etsy-only products to Gumroad.",
    action: "Cross-List Products",
    impact: "+$1,800 potential revenue"
  },
  {
    priority: "Low",
    insight: "Products with 'minimalist' keyword in title have 15% higher CTR. Consider updating 23 product titles.",
    action: "Optimize Listings",
    impact: "+$950 potential revenue"
  },
];

export function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-8">
        <div>
          <h2 className="text-primary">
            AI-Powered Analytics
          </h2>
          <p className="text-muted-foreground">
            Deep insights into your digital product performance
          </p>
        </div>

        <Tabs defaultValue="7d" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="7d">7 Days</TabsTrigger>
            <TabsTrigger value="30d">30 Days</TabsTrigger>
            <TabsTrigger value="90d">90 Days</TabsTrigger>
          </TabsList>

          <TabsContent value="7d" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl">$24,500</h3>
                        <span className="flex items-center text-sm text-success">
                          <ArrowUpRight className="h-4 w-4" />
                          18.2%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">419 digital products sold</p>
                    </div>
                    <div className="rounded-full bg-primary/10 p-3">
                      <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-secondary">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">AI Products Generated</p>
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl">121</h3>
                        <span className="flex items-center text-sm text-success">
                          <ArrowUpRight className="h-4 w-4" />
                          12.8%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">47 auto-listed today</p>
                    </div>
                    <div className="rounded-full bg-secondary/10 p-3">
                      <Sparkles className="h-6 w-6 text-secondary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-accent">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Conversion Rate</p>
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl">4.2%</h3>
                        <span className="flex items-center text-sm text-success">
                          <ArrowUpRight className="h-4 w-4" />
                          0.8%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Above industry avg</p>
                    </div>
                    <div className="rounded-full bg-accent/10 p-3">
                      <TrendingUp className="h-6 w-6 text-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-success">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Avg. Product Value</p>
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl">$58</h3>
                        <span className="flex items-center text-sm text-success">
                          <ArrowUpRight className="h-4 w-4" />
                          5.2%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">+$3 vs last week</p>
                    </div>
                    <div className="rounded-full bg-success/10 p-3">
                      <Package className="h-6 w-6 text-success" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue & AI Generation Trend</CardTitle>
                <CardDescription>
                  Daily performance metrics (last 7 days)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorAI" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="day" 
                      className="text-xs"
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis 
                      className="text-xs"
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      name="Revenue ($)"
                    />
                    <Area
                      type="monotone"
                      dataKey="aiGenerated"
                      stroke="hsl(var(--accent))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorAI)"
                      name="AI Products Generated"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Performance */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Category</CardTitle>
                  <CardDescription>
                    Digital product performance breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoryPerformance.map((cat, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>{cat.category}</span>
                          <span className="font-semibold">${cat.revenue.toLocaleString()}</span>
                        </div>
                        <Progress value={cat.percentage} className="h-3" />
                        <p className="text-xs text-muted-foreground text-right">
                          {cat.percentage}% of total revenue
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Products</CardTitle>
                  <CardDescription>
                    Best sellers this week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topProducts.slice(0, 5).map((product, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg border bg-card p-3">
                        <div className="flex-1">
                          <p className="text-sm">{product.name}</p>
                          <div className="mt-1 flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {product.marketplace}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {product.sales} sales
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${product.revenue.toLocaleString()}</p>
                          <p className="text-xs text-success">+{product.growth}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Insights */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>AI Strategic Insights</CardTitle>
                    <CardDescription>
                      Intelligent recommendations to maximize revenue
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiInsights.map((insight, i) => (
                    <div key={i} className="rounded-lg border bg-background p-4">
                      <div className="mb-3 flex items-start justify-between">
                        <Badge 
                          variant={
                            insight.priority === "High" 
                              ? "default" 
                              : insight.priority === "Medium"
                              ? "secondary"
                              : "outline"
                          }
                          className={
                            insight.priority === "High"
                              ? "bg-accent"
                              : ""
                          }
                        >
                          {insight.priority} Priority
                        </Badge>
                        <span className="text-sm text-success">{insight.impact}</span>
                      </div>
                      <p className="mb-3 text-sm">{insight.insight}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Recommended Action: {insight.action}
                        </span>
                        <button className="text-xs text-primary hover:underline">
                          Take Action →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Product Performance Table */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Product Performance</CardTitle>
                <CardDescription>
                  Complete breakdown of your digital products
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Marketplace</TableHead>
                      <TableHead className="text-right">Sales</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Growth</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topProducts.map((product, i) => (
                      <TableRow key={i}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.marketplace}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{product.sales}</TableCell>
                        <TableCell className="text-right">
                          ${product.revenue.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-success">+{product.growth}%</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="30d" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <h3 className="text-3xl">$98,450</h3>
                      <p className="text-xs text-success">+15.3% vs last period</p>
                    </div>
                    <div className="rounded-full bg-primary/10 p-3">
                      <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-secondary">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">AI Products Generated</p>
                      <h3 className="text-3xl">487</h3>
                      <p className="text-xs text-success">+11.7% vs last period</p>
                    </div>
                    <div className="rounded-full bg-secondary/10 p-3">
                      <Sparkles className="h-6 w-6 text-secondary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-accent">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Conversion Rate</p>
                      <h3 className="text-3xl">4.1%</h3>
                      <p className="text-xs text-success">+0.3% improvement</p>
                    </div>
                    <div className="rounded-full bg-accent/10 p-3">
                      <TrendingUp className="h-6 w-6 text-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-success">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Avg. Product Value</p>
                      <h3 className="text-3xl">$56</h3>
                      <p className="text-xs text-success">+2.1% improvement</p>
                    </div>
                    <div className="rounded-full bg-success/10 p-3">
                      <Package className="h-6 w-6 text-success" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                30-day detailed analytics view
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="90d" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <h3 className="text-3xl">$284,920</h3>
                      <p className="text-xs text-success">+22.8% vs last period</p>
                    </div>
                    <div className="rounded-full bg-primary/10 p-3">
                      <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-secondary">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">AI Products Generated</p>
                      <h3 className="text-3xl">1,432</h3>
                      <p className="text-xs text-success">+18.4% vs last period</p>
                    </div>
                    <div className="rounded-full bg-secondary/10 p-3">
                      <Sparkles className="h-6 w-6 text-secondary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-accent">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Conversion Rate</p>
                      <h3 className="text-3xl">3.9%</h3>
                      <p className="text-xs text-success">+0.5% improvement</p>
                    </div>
                    <div className="rounded-full bg-accent/10 p-3">
                      <TrendingUp className="h-6 w-6 text-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-success">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Avg. Product Value</p>
                      <h3 className="text-3xl">$54</h3>
                      <p className="text-xs text-success">+1.8% improvement</p>
                    </div>
                    <div className="rounded-full bg-success/10 p-3">
                      <Package className="h-6 w-6 text-success" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                90-day detailed analytics view
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
