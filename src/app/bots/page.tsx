"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Bot,
  Play,
  Pause,
  Settings,
  Trash2,
  Plus,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react";

interface AIBot {
  id: string;
  name: string;
  type: string;
  status: "active" | "paused" | "error";
  last_run_at?: string;
  next_run_at?: string;
  tasks_completed: number;
  description: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export default function BotManagementPage() {
  const [bots, setBots] = useState<AIBot[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("admin@foundersforge.com");

  useEffect(() => {
    fetchBots();
  }, []);

  const fetchBots = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bots?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch bots');
      }
      const data = await response.json();
      setBots(data.bots || []);
    } catch (error) {
      console.error('Error fetching bots:', error);
      toast.error('Failed to load bots');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBotStatus = async (botId: string) => {
    const bot = bots.find(b => b.id === botId);
    if (!bot) return;

    const newStatus = bot.status === "active" ? "paused" : "active";
    
    try {
      const response = await fetch('/api/bots', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botId,
          userId,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update bot');
      }

      const data = await response.json();
      setBots(bots.map(b => b.id === botId ? data.bot : b));
      toast.success(`Bot ${newStatus === 'active' ? 'activated' : 'paused'} successfully`);
    } catch (error) {
      console.error('Error updating bot:', error);
      toast.error('Failed to update bot status');
    }
  };

  const handleDeleteBot = async (botId: string) => {
    try {
      const response = await fetch(`/api/bots?botId=${botId}&userId=${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete bot');
      }

      setBots(bots.filter(bot => bot.id !== botId));
      toast.success('Bot deleted successfully');
    } catch (error) {
      console.error('Error deleting bot:', error);
      toast.error('Failed to delete bot');
    }
  };

  const formatRelativeTime = (timestamp: string | undefined) => {
    if (!timestamp) return "Never";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  const formatNextRun = (timestamp: string | undefined) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 0) return "Scheduled";
    if (diffMins < 60) return `in ${diffMins} minutes`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `in ${diffHours} hours`;
    const diffDays = Math.floor(diffHours / 24);
    return `in ${diffDays} days`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "paused":
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "paused":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-flame-500" />
            <p className="text-muted-foreground">Loading bots...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">AI Bot Management</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Configure and monitor your autonomous AI bots
            </p>
          </div>
          <Button className="bg-flame-gradient text-white hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" />
            Add New Bot
          </Button>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Bots</p>
                    <p className="text-2xl font-bold">{bots.filter(b => b.status === "active").length}</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Bots</p>
                    <p className="text-2xl font-bold">{bots.length}</p>
                  </div>
                  <Bot className="h-8 w-8 text-flame-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tasks Today</p>
                    <p className="text-2xl font-bold">
                      {bots.reduce((sum, bot) => sum + bot.tasks_completed, 0)}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-ocean-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bots List */}
        <div className="grid grid-cols-1 gap-4">
          {bots.map((bot, index) => (
            <motion.div
              key={bot.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Bot className="h-5 w-5 text-flame-500" />
                        <CardTitle className="text-lg">{bot.name}</CardTitle>
                        <Badge className={getStatusColor(bot.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(bot.status)}
                            <span className="capitalize">{bot.status}</span>
                          </div>
                        </Badge>
                      </div>
                      <CardDescription>{bot.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleBotStatus(bot.id)}
                      >
                        {bot.status === "active" ? (
                          <>
                            <Pause className="h-4 w-4 mr-2" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Start
                          </>
                        )}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteBot(bot.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Last Run</p>
                      <p className="font-medium">{formatRelativeTime(bot.last_run_at)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Next Run</p>
                      <p className="font-medium">{formatNextRun(bot.next_run_at)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tasks Completed</p>
                      <p className="font-medium">{bot.tasks_completed}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {bots.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="py-12 text-center">
                <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No AI Bots Configured</h3>
                <p className="text-muted-foreground mb-6">
                  Get started by adding your first autonomous AI bot
                </p>
                <Button className="bg-flame-gradient text-white hover:opacity-90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Bot
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
