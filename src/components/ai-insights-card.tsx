import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Sparkles, TrendingUp, ArrowRight, Lightbulb } from "lucide-react";
import { motion } from "motion/react";

interface Insight {
  id: string;
  title: string;
  description: string;
  confidence: number;
  category: "trend" | "opportunity" | "optimization" | "alert";
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface AIInsightsCardProps {
  insights?: Insight[];
}

export function AIInsightsCard({ insights }: AIInsightsCardProps) {
  const defaultInsights: Insight[] = [
    {
      id: "1",
      title: "High-Potential Niche Detected",
      description: "Minimalist digital planners are trending up 127% this week. Consider creating products in this category.",
      confidence: 92,
      category: "opportunity",
    },
    {
      id: "2",
      title: "Optimize Product Titles",
      description: "Your product titles could be improved for better SEO. AI suggests adding 3-4 trending keywords.",
      confidence: 85,
      category: "optimization",
    },
    {
      id: "3",
      title: "Best Time to List",
      description: "Based on marketplace patterns, listing between 2-4 PM EST shows 34% higher visibility.",
      confidence: 78,
      category: "trend",
    },
  ];

  const displayInsights = insights || defaultInsights;

  const getCategoryColor = (category: Insight["category"]) => {
    switch (category) {
      case "opportunity":
        return "bg-success/10 text-success border-success/20";
      case "trend":
        return "bg-chart-1/10 text-chart-1 border-chart-1/20";
      case "optimization":
        return "bg-warning/10 text-warning border-warning/20";
      case "alert":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getCategoryLabel = (category: Insight["category"]) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <Card className="border-2 border-primary/20 hover-lift">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse-subtle" />
          </div>
          <div>
            <CardTitle>AI Insights</CardTitle>
            <CardDescription>Personalized recommendations for your business</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayInsights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-3 p-4 rounded-lg bg-muted/50 border hover:border-primary/50 transition-base"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary flex-shrink-0" />
                <h4 className="text-sm font-medium">{insight.title}</h4>
              </div>
              <Badge variant="outline" className={getCategoryColor(insight.category)}>
                {getCategoryLabel(insight.category)}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground">{insight.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Confidence:</span>
                <div className="flex items-center gap-1">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${insight.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium">{insight.confidence}%</span>
                </div>
              </div>

              {insight.action && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={insight.action.onClick}
                  className="h-8 text-xs"
                >
                  {insight.action.label}
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              )}
            </div>
          </motion.div>
        ))}

        <Button variant="outline" className="w-full" size="sm">
          <TrendingUp className="mr-2 h-4 w-4" />
          View All Insights
        </Button>
      </CardContent>
    </Card>
  );
}
