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
import {
  Network,
  Wifi,
  Server,
  Database,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Activity,
} from "lucide-react";
import { useState, useEffect } from "react";

export function NetworkStatusPage() {
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setLastRefresh(new Date());
    // Simulate API call
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, 10000); // Auto-refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const services = [
    {
      name: "API Gateway",
      status: "online",
      latency: "45ms",
      uptime: "99.9%",
      icon: Network,
    },
    {
      name: "Database",
      status: "online",
      latency: "12ms",
      uptime: "99.8%",
      icon: Database,
    },
    {
      name: "AI Services",
      status: "online",
      latency: "89ms",
      uptime: "99.7%",
      icon: Server,
    },
    {
      name: "File Storage",
      status: "degraded",
      latency: "156ms",
      uptime: "98.5%",
      icon: Wifi,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-primary">Network Status</h2>
            <p className="text-muted-foreground">
              Monitor system connectivity and performance
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-sm text-muted-foreground">
              <div>Last refresh: {lastRefresh.toLocaleTimeString()}</div>
              <div>Auto-refresh: 10s</div>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Overall Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Overview
            </CardTitle>
            <CardDescription>
              Current status of all system components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <div className="font-semibold">Overall Status</div>
                  <div className="text-sm text-muted-foreground">All systems operational</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-blue-500" />
                <div>
                  <div className="font-semibold">Uptime</div>
                  <div className="text-sm text-muted-foreground">99.8% this month</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-purple-500" />
                <div>
                  <div className="font-semibold">Avg Latency</div>
                  <div className="text-sm text-muted-foreground">67ms</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Network className="h-8 w-8 text-orange-500" />
                <div>
                  <div className="font-semibold">Active Connections</div>
                  <div className="text-sm text-muted-foreground">1,247</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Status */}
        <Card>
          <CardHeader>
            <CardTitle>Service Status</CardTitle>
            <CardDescription>
              Individual service health and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {services.map((service) => {
                const Icon = service.icon;
                const isOnline = service.status === "online";
                const isDegraded = service.status === "degraded";

                return (
                  <div key={service.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${isOnline ? 'bg-green-100' : isDegraded ? 'bg-yellow-100' : 'bg-red-100'}`}>
                        <Icon className={`h-5 w-5 ${isOnline ? 'text-green-600' : isDegraded ? 'text-yellow-600' : 'text-red-600'}`} />
                      </div>
                      <div>
                        <div className="font-semibold">{service.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Latency: {service.latency} • Uptime: {service.uptime}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={isOnline ? "default" : isDegraded ? "secondary" : "destructive"}
                      className={
                        isOnline
                          ? "bg-green-100 text-green-800"
                          : isDegraded
                          ? "bg-yellow-100 text-yellow-800"
                          : ""
                      }
                    >
                      {service.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Response Times</CardTitle>
              <CardDescription>
                Average response times over the last 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>API Calls</span>
                  <span>67ms</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Database Queries</span>
                  <span>23ms</span>
                </div>
                <Progress value={90} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>File Uploads</span>
                  <span>145ms</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Error Rates</CardTitle>
              <CardDescription>
                Error rates and incident tracking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>API Errors</span>
                  <span>0.02%</span>
                </div>
                <Progress value={2} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Database Errors</span>
                  <span>0.01%</span>
                </div>
                <Progress value={1} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Timeout Errors</span>
                  <span>0.05%</span>
                </div>
                <Progress value={5} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Incidents */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest system events and maintenance activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium">System maintenance completed</div>
                  <div className="text-sm text-muted-foreground">
                    Scheduled maintenance finished successfully. All services restored.
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">2 hours ago</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium">File storage performance degradation</div>
                  <div className="text-sm text-muted-foreground">
                    Increased latency detected. Monitoring for resolution.
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">4 hours ago</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium">Database backup completed</div>
                  <div className="text-sm text-muted-foreground">
                    Automated backup process finished successfully.
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">6 hours ago</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}