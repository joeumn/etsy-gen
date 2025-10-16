"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle, Database, Key, ShoppingBag, Zap, Settings, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  completed: boolean;
  required: boolean;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [settings, setSettings] = useState({
    geminiApiKey: "",
    etsyApiKey: "",
    amazonAccessKey: "",
    amazonSecretKey: "",
    amazonRegion: "us-east-1",
    shopifyAccessToken: "",
    shopifyShopDomain: "",
    zig3Studio: true,
    zig4Stripe: true,
    zig5Social: true,
    zig6Branding: true,
  });

  const steps: OnboardingStep[] = [
    {
      id: "database",
      title: "Database Connection",
      description: "Verify Supabase database is connected and migrated",
      icon: Database,
      completed: false,
      required: true,
    },
    {
      id: "gemini",
      title: "AI Configuration",
      description: "Set up your Gemini API key for AI-powered features",
      icon: Key,
      completed: false,
      required: true,
    },
    {
      id: "marketplaces",
      title: "Marketplace Connections",
      description: "Connect your Etsy, Amazon, and Shopify accounts",
      icon: ShoppingBag,
      completed: false,
      required: true,
    },
    {
      id: "scanners",
      title: "Scanner Verification",
      description: "Test web and social media scanners",
      icon: Zap,
      completed: false,
      required: true,
    },
    {
      id: "customization",
      title: "Feature Customization",
      description: "Configure your preferred features and settings",
      icon: Settings,
      completed: false,
      required: false,
    },
  ];

  const [stepStatuses, setStepStatuses] = useState(steps);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    // Check if onboarding is already completed
    const onboardingCompleted = localStorage.getItem("onboarding_completed");
    if (onboardingCompleted === "true") {
      router.push("/dashboard");
      return;
    }

    // Start with database check
    testDatabaseConnection();
  }, []);

  const testDatabaseConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/onboarding/test-db");
      const data = await response.json();

      if (data.success) {
        updateStepStatus("database", true);
        addToast({
          type: "success",
          title: "Database Connected",
          description: "Supabase database is connected and ready.",
        });
      } else {
        addToast({
          type: "error",
          title: "Database Issue",
          description: data.error || "Failed to connect to database.",
        });
      }
    } catch (error) {
      addToast({
        type: "error",
        title: "Connection Error",
        description: "Unable to test database connection.",
      });
    }
    setIsLoading(false);
  };

  const testGeminiAPI = async () => {
    if (!settings.geminiApiKey) {
      addToast({
        type: "error",
        title: "API Key Required",
        description: "Please enter your Gemini API key.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/onboarding/test-gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: settings.geminiApiKey }),
      });
      const data = await response.json();

      if (data.success) {
        updateStepStatus("gemini", true);
        addToast({
          type: "success",
          title: "Gemini API Connected",
          description: "AI features are now enabled.",
        });
      } else {
        addToast({
          type: "error",
          title: "API Test Failed",
          description: data.error || "Invalid API key or connection issue.",
        });
      }
    } catch (error) {
      addToast({
        type: "error",
        title: "Connection Error",
        description: "Unable to test Gemini API.",
      });
    }
    setIsLoading(false);
  };

  const testMarketplaceConnections = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/onboarding/test-marketplaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          etsy: { apiKey: settings.etsyApiKey },
          amazon: {
            accessKey: settings.amazonAccessKey,
            secretKey: settings.amazonSecretKey,
            region: settings.amazonRegion,
          },
          shopify: {
            accessToken: settings.shopifyAccessToken,
            shopDomain: settings.shopifyShopDomain,
          },
        }),
      });
      const data = await response.json();

      if (data.success) {
        updateStepStatus("marketplaces", true);
        addToast({
          type: "success",
          title: "Marketplaces Connected",
          description: "All marketplace connections are working.",
        });
      } else {
        addToast({
          type: "error",
          title: "Connection Issues",
          description: data.error || "Some marketplace connections failed.",
        });
      }
    } catch (error) {
      addToast({
        type: "error",
        title: "Connection Error",
        description: "Unable to test marketplace connections.",
      });
    }
    setIsLoading(false);
  };

  const testScanners = async () => {
    setIsLoading(true);
    try {
      // Test web scanner
      const webResponse = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: ["test"] }),
      });

      // Test social scanner
      const socialResponse = await fetch("/api/social-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: ["test"] }),
      });

      if (webResponse.ok && socialResponse.ok) {
        updateStepStatus("scanners", true);
        addToast({
          type: "success",
          title: "Scanners Working",
          description: "Web and social media scanners are functional.",
        });
      } else {
        addToast({
          type: "error",
          title: "Scanner Issues",
          description: "One or more scanners are not working properly.",
        });
      }
    } catch (error) {
      addToast({
        type: "error",
        title: "Scanner Test Failed",
        description: "Unable to test scanners.",
      });
    }
    setIsLoading(false);
  };

  const updateStepStatus = (stepId: string, completed: boolean) => {
    setStepStatuses(prev =>
      prev.map(step =>
        step.id === stepId ? { ...step, completed } : step
      )
    );
  };

  const completeOnboarding = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem("onboarding_completed", "true");
        addToast({
          type: "success",
          title: "Onboarding Complete",
          description: "Welcome to EtsyGen! Your app is now fully configured.",
        });
        // For development, redirect to dashboard directly
        router.push("/dashboard");
      } else {
        addToast({
          type: "error",
          title: "Setup Failed",
          description: data.error || "Failed to save settings.",
        });
      }
    } catch (error) {
      addToast({
        type: "error",
        title: "Connection Error",
        description: "Unable to complete onboarding.",
      });
    }
    setIsLoading(false);
  };

  const progress = (stepStatuses.filter(s => s.completed).length / stepStatuses.length) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              We're checking your Supabase database connection and ensuring all migrations are up to date.
            </p>
            <Button onClick={testDatabaseConnection} disabled={isLoading}>
              {isLoading ? "Testing..." : "Test Database Connection"}
            </Button>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="geminiApiKey">Gemini API Key</Label>
              <Input
                id="geminiApiKey"
                type="password"
                value={settings.geminiApiKey}
                onChange={(e) => setSettings(prev => ({ ...prev, geminiApiKey: e.target.value }))}
                placeholder="Enter your Gemini API key"
              />
            </div>
            <Button onClick={testGeminiAPI} disabled={isLoading || !settings.geminiApiKey}>
              {isLoading ? "Testing..." : "Test Gemini API"}
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Etsy Connection</h3>
              <div>
                <Label htmlFor="etsyApiKey">Etsy API Key</Label>
                <Input
                  id="etsyApiKey"
                  type="password"
                  value={settings.etsyApiKey}
                  onChange={(e) => setSettings(prev => ({ ...prev, etsyApiKey: e.target.value }))}
                  placeholder="Enter your Etsy API key"
                />
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Amazon Connection</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amazonAccessKey">Access Key</Label>
                  <Input
                    id="amazonAccessKey"
                    type="password"
                    value={settings.amazonAccessKey}
                    onChange={(e) => setSettings(prev => ({ ...prev, amazonAccessKey: e.target.value }))}
                    placeholder="Access Key"
                  />
                </div>
                <div>
                  <Label htmlFor="amazonSecretKey">Secret Key</Label>
                  <Input
                    id="amazonSecretKey"
                    type="password"
                    value={settings.amazonSecretKey}
                    onChange={(e) => setSettings(prev => ({ ...prev, amazonSecretKey: e.target.value }))}
                    placeholder="Secret Key"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Shopify Connection</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shopifyAccessToken">Access Token</Label>
                  <Input
                    id="shopifyAccessToken"
                    type="password"
                    value={settings.shopifyAccessToken}
                    onChange={(e) => setSettings(prev => ({ ...prev, shopifyAccessToken: e.target.value }))}
                    placeholder="Access Token"
                  />
                </div>
                <div>
                  <Label htmlFor="shopifyShopDomain">Shop Domain</Label>
                  <Input
                    id="shopifyShopDomain"
                    value={settings.shopifyShopDomain}
                    onChange={(e) => setSettings(prev => ({ ...prev, shopifyShopDomain: e.target.value }))}
                    placeholder="your-shop.myshopify.com"
                  />
                </div>
              </div>
            </div>

            <Button onClick={testMarketplaceConnections} disabled={isLoading}>
              {isLoading ? "Testing..." : "Test Marketplace Connections"}
            </Button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              We're testing your web scraping and social media scanning capabilities.
            </p>
            <Button onClick={testScanners} disabled={isLoading}>
              {isLoading ? "Testing..." : "Test Scanners"}
            </Button>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Feature Toggles</h3>
              <div className="space-y-4">
                {Object.entries(settings).filter(([key]) => key.startsWith('zig')).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={key} className="capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    <Switch
                      id={key}
                      checked={value as boolean}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({ ...prev, [key]: checked }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={() => updateStepStatus("customization", true)} disabled={isLoading}>
              Save Preferences
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = stepStatuses[currentStep]?.completed || !stepStatuses[currentStep]?.required;

  return (
    <div className="min-h-screen bg-gradient-to-br from-flame-500/10 via-ocean-500/10 to-gold-500/10">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome to EtsyGen!</h1>
            <p className="text-muted-foreground">
              Let's get your app set up and running in just a few steps.
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Onboarding Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={progress} className="mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {stepStatuses.map((step, index) => (
                  <motion.div
                    key={step.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      index === currentStep ? 'border-flame-500 bg-flame-500/5' :
                      step.completed ? 'border-green-500 bg-green-500/5' : 'border-muted'
                    }`}
                    onClick={() => setCurrentStep(index)}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <step.icon className="h-5 w-5" />
                      {step.completed && <CheckCircle className="h-4 w-4 text-green-500" />}
                    </div>
                    <h3 className="font-semibold text-sm">{step.title}</h3>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {React.createElement(stepStatuses[currentStep].icon, { className: "h-5 w-5" })}
                {stepStatuses[currentStep].title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                {stepStatuses[currentStep].description}
              </p>

              {renderStepContent()}

              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                  disabled={currentStep === 0}
                >
                  Previous
                </Button>

                {currentStep < stepStatuses.length - 1 ? (
                  <Button
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    disabled={!canProceed}
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={completeOnboarding}
                    disabled={!stepStatuses.every(s => s.completed || !s.required) || isLoading}
                  >
                    {isLoading ? "Completing..." : "Complete Setup"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
