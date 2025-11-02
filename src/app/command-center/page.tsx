"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Key,
  Database,
  Zap,
  Globe,
  Shield,
  Bell,
  Cpu,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

interface APIConnection {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  required: boolean;
}

export default function CommandCenter() {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [connections, setConnections] = useState<APIConnection[]>([
    { id: 'gemini', name: 'Google Gemini AI', status: 'connected', lastSync: '2 min ago', required: true },
    { id: 'etsy', name: 'Etsy Marketplace', status: 'connected', lastSync: '5 min ago', required: false },
    { id: 'shopify', name: 'Shopify Store', status: 'connected', lastSync: '10 min ago', required: false },
    { id: 'amazon', name: 'Amazon MWS', status: 'disconnected', required: false },
    { id: 'stripe', name: 'Stripe Payments', status: 'error', required: false },
    { id: 'supabase', name: 'Supabase Database', status: 'connected', lastSync: '1 min ago', required: true },
  ]);

  const [automationSettings, setAutomationSettings] = useState({
    autoScrape: true,
    autoAnalyze: true,
    autoGenerate: false,
    autoList: false,
    notifyOnSuccess: true,
    notifyOnError: true,
    dailyLimit: 50,
    priceRange: { min: 5, max: 50 },
  });

  const toggleKeyVisibility = (key: string) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const testConnection = async (connectionId: string) => {
    toast.info(`Testing ${connectionId} connection...`);
    // Simulate API test
    setTimeout(() => {
      toast.success(`${connectionId} connection successful!`);
    }, 1000);
  };

  const saveSettings = () => {
    toast.success('Settings saved successfully!');
  };

  const StatusIcon = ({ status }: { status: APIConnection['status'] }) => {
    switch (status) {
      case 'connected':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'disconnected':
        return <XCircle className="h-5 w-5 text-muted-foreground" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Settings className="h-8 w-8 text-flame-500" />
              Command Center
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage all your integrations, automations, and system settings
            </p>
          </div>
          <Button onClick={saveSettings} size="lg" className="bg-flame-gradient">
            <Save className="h-4 w-4 mr-2" />
            Save All Changes
          </Button>
        </div>

        <Tabs defaultValue="connections" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="connections">
              <Key className="h-4 w-4 mr-2" />
              Connections
            </TabsTrigger>
            <TabsTrigger value="automation">
              <Zap className="h-4 w-4 mr-2" />
              Automation
            </TabsTrigger>
            <TabsTrigger value="system">
              <Cpu className="h-4 w-4 mr-2" />
              System
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* API Connections Tab */}
          <TabsContent value="connections" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  API Connections
                </CardTitle>
                <CardDescription>
                  Manage your marketplace and service integrations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {connections.map((connection) => (
                  <div
                    key={connection.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:border-flame-500/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <StatusIcon status={connection.status} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{connection.name}</span>
                          {connection.required && (
                            <Badge variant="destructive" className="text-xs">Required</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {connection.lastSync ? `Last synced: ${connection.lastSync}` : 'Not configured'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testConnection(connection.id)}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Test
                      </Button>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* API Keys Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  API Keys
                </CardTitle>
                <CardDescription>
                  Configure your service API keys and credentials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {['GEMINI_API_KEY', 'ETSY_CLIENT_ID', 'SHOPIFY_ACCESS_TOKEN', 'AMAZON_ACCESS_KEY'].map((keyName) => (
                  <div key={keyName} className="space-y-2">
                    <Label htmlFor={keyName}>{keyName}</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id={keyName}
                          type={showKeys[keyName] ? 'text' : 'password'}
                          defaultValue="********************************"
                          className="pr-10"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0"
                          onClick={() => toggleKeyVisibility(keyName)}
                        >
                          {showKeys[keyName] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <Button variant="outline">Update</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Automation Rules
                </CardTitle>
                <CardDescription>
                  Configure what The Forge does automatically
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-Scrape Marketplaces</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically scan marketplaces for new trends daily
                      </p>
                    </div>
                    <Switch
                      checked={automationSettings.autoScrape}
                      onCheckedChange={(checked) =>
                        setAutomationSettings((prev) => ({ ...prev, autoScrape: checked }))
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-Analyze Trends</Label>
                      <p className="text-sm text-muted-foreground">
                        Use AI to analyze trends and identify opportunities
                      </p>
                    </div>
                    <Switch
                      checked={automationSettings.autoAnalyze}
                      onCheckedChange={(checked) =>
                        setAutomationSettings((prev) => ({ ...prev, autoAnalyze: checked }))
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-Generate Products</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically create products from trending niches
                      </p>
                    </div>
                    <Switch
                      checked={automationSettings.autoGenerate}
                      onCheckedChange={(checked) =>
                        setAutomationSettings((prev) => ({ ...prev, autoGenerate: checked }))
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-List Products</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically publish products to connected marketplaces
                      </p>
                    </div>
                    <Switch
                      checked={automationSettings.autoList}
                      onCheckedChange={(checked) =>
                        setAutomationSettings((prev) => ({ ...prev, autoList: checked }))
                      }
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Daily Product Limit</Label>
                    <Input
                      type="number"
                      value={automationSettings.dailyLimit}
                      onChange={(e) =>
                        setAutomationSettings((prev) => ({
                          ...prev,
                          dailyLimit: parseInt(e.target.value),
                        }))
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      Maximum products to generate per day
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Price Range</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">Minimum ($)</Label>
                        <Input
                          type="number"
                          value={automationSettings.priceRange.min}
                          onChange={(e) =>
                            setAutomationSettings((prev) => ({
                              ...prev,
                              priceRange: { ...prev.priceRange, min: parseInt(e.target.value) },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Maximum ($)</Label>
                        <Input
                          type="number"
                          value={automationSettings.priceRange.max}
                          onChange={(e) =>
                            setAutomationSettings((prev) => ({
                              ...prev,
                              priceRange: { ...prev.priceRange, max: parseInt(e.target.value) },
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Notify on Success</Label>
                  <Switch
                    checked={automationSettings.notifyOnSuccess}
                    onCheckedChange={(checked) =>
                      setAutomationSettings((prev) => ({ ...prev, notifyOnSuccess: checked }))
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label>Notify on Errors</Label>
                  <Switch
                    checked={automationSettings.notifyOnError}
                    onCheckedChange={(checked) =>
                      setAutomationSettings((prev) => ({ ...prev, notifyOnError: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground">API Health</div>
                    <div className="text-2xl font-bold text-green-500">98.5%</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Response Time</div>
                    <div className="text-2xl font-bold">124ms</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Jobs Queued</div>
                    <div className="text-2xl font-bold">42</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Active Workers</div>
                    <div className="text-2xl font-bold">3/5</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full">
                  Enable Two-Factor Authentication
                </Button>
                <Button variant="outline" className="w-full">
                  View Activity Log
                </Button>
                <Button variant="outline" className="w-full">
                  Manage API Permissions
                </Button>
                <Button variant="destructive" className="w-full">
                  Revoke All Access Tokens
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
