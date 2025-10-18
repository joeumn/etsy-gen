"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Brain,
  Search,
  TrendingUp,
  Target,
  DollarSign,
  Calendar,
  Trash2,
  Eye,
  Sparkles,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface MarketReport {
  id: string;
  createdAt: string;
  userId: string;
  topic: string;
  reportData: {
    trend: string;
    targetAudience: string;
    topKeywords: string[];
    pricingSuggestion: string;
    analysis: string;
    sourceURLs: { title: string; url: string }[];
  };
}

export default function MarketIntelligencePage() {
  const [reports, setReports] = useState<MarketReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [searchTopic, setSearchTopic] = useState("");
  const [selectedReport, setSelectedReport] = useState<MarketReport | null>(null);
  const [viewingReport, setViewingReport] = useState(false);

  // Mock user ID (in production, get this from auth context)
  const userId = "mock-user-id-123";

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/market-intelligence?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
      } else {
        toast.error("Failed to fetch market reports");
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Error loading market reports");
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    if (!searchTopic.trim()) {
      toast.error("Please enter a topic to analyze");
      return;
    }

    try {
      setGenerating(true);
      toast.info("Generating market intelligence report...");

      const response = await fetch("/api/market-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: searchTopic, userId }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Market report generated successfully!");
        setSearchTopic("");
        await fetchReports();
        // Auto-select the newly created report
        setSelectedReport(data.report);
        setViewingReport(true);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to generate report");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Error generating market report");
    } finally {
      setGenerating(false);
    }
  };

  const deleteReport = async (reportId: string) => {
    try {
      const response = await fetch(`/api/market-intelligence/${reportId}?userId=${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Report deleted successfully");
        setReports(reports.filter((r) => r.id !== reportId));
        if (selectedReport?.id === reportId) {
          setSelectedReport(null);
          setViewingReport(false);
        }
      } else {
        toast.error("Failed to delete report");
      }
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("Error deleting report");
    }
  };

  const viewReport = (report: MarketReport) => {
    setSelectedReport(report);
    setViewingReport(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Brain className="h-8 w-8 text-purple-500" />
                Market Intelligence
              </h1>
              <p className="text-muted-foreground mt-2">
                AI-powered market research and trend analysis
              </p>
            </div>
          </div>
        </motion.div>

        {/* Search & Generate Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                Generate New Market Report
              </CardTitle>
              <CardDescription>
                Enter a product topic or market niche to analyze trends, competition, and opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  placeholder="e.g., Handmade ceramic mugs, Vintage clothing, etc."
                  value={searchTopic}
                  onChange={(e) => setSearchTopic(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && generateReport()}
                  className="flex-1"
                  disabled={generating}
                />
                <Button
                  onClick={generateReport}
                  disabled={generating || !searchTopic.trim()}
                  className="gap-2"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Reports Grid/Detail View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reports List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Your Reports ({reports.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : reports.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No reports yet. Generate your first market intelligence report!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {reports.map((report) => (
                      <Card
                        key={report.id}
                        className={`cursor-pointer transition-colors hover:bg-accent ${
                          selectedReport?.id === report.id ? "border-primary" : ""
                        }`}
                        onClick={() => viewReport(report)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate">{report.topic}</h3>
                              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(report.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  viewReport(report);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm("Are you sure you want to delete this report?")) {
                                    deleteReport(report.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Report Detail View */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-2"
          >
            {viewingReport && selectedReport ? (
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {selectedReport.topic}
                  </CardTitle>
                  <CardDescription>
                    Generated on {new Date(selectedReport.createdAt).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 max-h-[600px] overflow-y-auto">
                  {/* Trend */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      <h3 className="font-semibold">Market Trend</h3>
                    </div>
                    <p className="text-muted-foreground">{selectedReport.reportData.trend}</p>
                  </div>

                  {/* Target Audience */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-5 w-5 text-blue-500" />
                      <h3 className="font-semibold">Target Audience</h3>
                    </div>
                    <p className="text-muted-foreground">{selectedReport.reportData.targetAudience}</p>
                  </div>

                  {/* Top Keywords */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Search className="h-5 w-5 text-purple-500" />
                      <h3 className="font-semibold">Top Keywords</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedReport.reportData.topKeywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Suggestion */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-5 w-5 text-yellow-500" />
                      <h3 className="font-semibold">Pricing Suggestion</h3>
                    </div>
                    <p className="text-muted-foreground">{selectedReport.reportData.pricingSuggestion}</p>
                  </div>

                  {/* Analysis */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-5 w-5 text-indigo-500" />
                      <h3 className="font-semibold">Detailed Analysis</h3>
                    </div>
                    <p className="text-muted-foreground whitespace-pre-wrap">{selectedReport.reportData.analysis}</p>
                  </div>

                  {/* Source URLs */}
                  {selectedReport.reportData.sourceURLs.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Sources</h3>
                      <div className="space-y-2">
                        {selectedReport.reportData.sourceURLs.map((source, idx) => (
                          <a
                            key={idx}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-sm text-blue-500 hover:underline"
                          >
                            {source.title || source.url}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full">
                <CardContent className="flex items-center justify-center h-full py-20">
                  <div className="text-center">
                    <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Report Selected</h3>
                    <p className="text-muted-foreground">
                      Select a report from the list or generate a new one
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
