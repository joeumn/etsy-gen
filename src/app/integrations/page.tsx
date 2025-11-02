"use client";

import { AppLayout as DashboardLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plug,
  Database,
  Cloud,
  Mail,
  Zap,
  CheckCircle,
  XCircle,
  Settings as SettingsIcon,
  ExternalLink
} from "lucide-react";

export default function IntegrationsPage() {
  const integrations = [
    {
      name: "Google Drive",
      description: "Automatically store AI-generated products",
      icon: Cloud,
      status: "active",
      category: "Storage",
      features: ["Auto-backup", "Folder organization", "Version control"],
      connected: true,
    },
    {
      name: "Supabase",
      description: "PostgreSQL database for all app data",
      icon: Database,
      status: "active",
      category: "Database",
      features: ["Real-time sync", "Row-level security", "Auto-scaling"],
      connected: true,
    },
    {
      name: "Email Notifications",
      description: "SMTP email delivery for alerts",
      icon: Mail,
      status: "active",
      category: "Communications",
      features: ["Sale alerts", "Error notifications", "Daily reports"],
      connected: true,
    },
    {
      name: "Stripe",
      description: "Payment processing and subscriptions",
      icon: Zap,
      status: "available",
      category: "Payments",
      features: ["Subscription billing", "Usage tracking", "Customer portal"],
      connected: false,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Integrations</h1>
          <p className="text-muted-foreground">
            Manage third-party services and API connections
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {["Connected", "Active", "Available", "Issues"].map((label, idx) => (
            <Card key={label}>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-1">{label}</p>
                <p className="text-3xl font-bold">
                  {idx === 0 ? 3 : idx === 1 ? 3 : idx === 2 ? 1 : 0}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Integration Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integrations.map((integration) => {
            const Icon = integration.icon;
            return (
              <Card key={integration.name} className="card-hover">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-ocean-gradient rounded-lg flex items-center justify-center">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {integration.description}
                        </p>
                        <Badge variant="outline" className="mt-2">
                          {integration.category}
                        </Badge>
                      </div>
                    </div>
                    {integration.connected ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Features */}
                  <div>
                    <p className="text-sm font-semibold mb-2">Features:</p>
                    <div className="flex flex-wrap gap-2">
                      {integration.features.map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {integration.connected ? (
                      <>
                        <Button variant="outline" className="flex-1">
                          <SettingsIcon className="mr-2 h-4 w-4" />
                          Configure
                        </Button>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button className="flex-1 bg-flame-gradient text-white">
                        Connect {integration.name}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* API Keys Section */}
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">Google Drive API</p>
                  <p className="text-sm text-muted-foreground">OAuth 2.0 configured</p>
                </div>
                <Badge className="bg-green-100 text-green-700">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">Marketplace APIs</p>
                  <p className="text-sm text-muted-foreground">Etsy, Shopify, Amazon connected</p>
                </div>
                <Badge className="bg-green-100 text-green-700">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">AI Providers</p>
                  <p className="text-sm text-muted-foreground">Gemini, OpenAI configured</p>
                </div>
                <Badge className="bg-green-100 text-green-700">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

