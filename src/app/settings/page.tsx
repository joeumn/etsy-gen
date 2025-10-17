"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { 
  Sparkles, 
  ArrowLeft,
  Settings as SettingsIcon,
  Key,
  Palette,
  BarChart3,
  Download,
  Save,
  CheckCircle,
  AlertCircle,
  Bell,
  Shield,
  Server,
  RefreshCw,
  Eye,
  EyeOff
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Settings() {
  const [settings, setSettings] = useState({
    // AI Provider Settings
    aiProvider: "gemini",
    aiKeys: {
      gemini: "",
      openai: "",
      anthropic: "",
      azureOpenAI: "",
    },

    // Marketplace Connections
    etsy: {
      connected: false,
      apiKey: "",
    },
    amazon: {
      connected: false,
      accessKey: "",
      secretKey: "",
      region: "us-east-1",
    },
    shopify: {
      connected: false,
      accessToken: "",
      shopDomain: "",
    },

    // Notification Settings
    notifications: {
      email: true,
      push: false,
      weeklyReport: true,
      newTrends: true,
    },

    // Feature Flags (from server)
    features: {
      zig3Studio: false,
      zig4Stripe: false,
      zig5Social: false,
      zig6Branding: false,
    },

    // System Config Status (from server)
    systemConfig: {
      hasGeminiKey: false,
      hasOpenAIKey: false,
      hasAnthropicKey: false,
      hasAzureOpenAIKey: false,
      hasEtsyConfig: false,
      hasShopifyConfig: false,
      hasAmazonConfig: false,
      hasStripeConfig: false,
      hasSupabaseConfig: false,
    },
  });

  const [showApiKeys, setShowApiKeys] = useState({
    gemini: false,
    openai: false,
    anthropic: false,
    azureOpenAI: false,
    etsy: false,
    amazonAccess: false,
    amazonSecret: false,
    shopify: false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  // Load settings from API on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      // Import getCurrentUserId dynamically to avoid SSR issues
      const { getCurrentUserId } = await import('@/lib/session');
      const userId = getCurrentUserId();
      
      if (!userId) {
        console.error('No user ID found');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`/api/settings/load?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSettings(prev => ({
          ...prev,
          ...data,
        }));
      } else {
        console.error('Failed to load settings:', await response.text());
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadSettings();
    setIsRefreshing(false);
  };

  const toggleApiKeyVisibility = (key: keyof typeof showApiKeys) => {
    setShowApiKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("idle");

    try {
      // Import getCurrentUserId dynamically to avoid SSR issues
      const { getCurrentUserId } = await import('@/lib/session');
      const userId = getCurrentUserId();
      
      if (!userId) {
        console.error('No user ID found');
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
        setIsSaving(false);
        return;
      }

      const response = await fetch(`/api/settings/save?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch (error) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'foundersforge-settings.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div className="w-8 h-8 bg-flame-gradient rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">Settings</span>
          </motion.div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button 
              onClick={handleRefresh} 
              disabled={isRefreshing} 
              variant="outline" 
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-ocean-500 hover:bg-ocean-600">
              {isSaving ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings, API connections, and preferences.
          </p>
        </motion.div>

        {/* Save Status */}
        {saveStatus === "success" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-green-800 dark:text-green-200">Settings saved successfully!</span>
          </motion.div>
        )}

        {saveStatus === "error" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2"
          >
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-red-800 dark:text-red-200">Failed to save settings. Please try again.</span>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-flame-500 border-t-transparent" />
          </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Provider Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    AI Provider Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="ai-provider">Default AI Provider</Label>
                    <Select
                      value={settings.aiProvider}
                      onValueChange={(value: string) => setSettings(prev => ({ ...prev, aiProvider: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select AI provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gemini">Google Gemini</SelectItem>
                        <SelectItem value="openai">OpenAI GPT-4</SelectItem>
                        <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                        <SelectItem value="azureOpenAI">Azure OpenAI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* AI API Keys */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">API Keys (User Level)</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      These keys are specific to your account. System-level keys are configured in Vercel environment variables.
                    </p>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <Label htmlFor="gemini-key" className="text-xs text-muted-foreground">
                            Google Gemini API Key
                          </Label>
                          {settings.systemConfig?.hasGeminiKey && (
                            <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              System configured
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <Input
                            id="gemini-key"
                            type={showApiKeys.gemini ? "text" : "password"}
                            placeholder="Enter your Gemini API key"
                            value={settings.aiKeys.gemini}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings(prev => ({
                              ...prev,
                              aiKeys: { ...prev.aiKeys, gemini: e.target.value }
                            }))}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => toggleApiKeyVisibility('gemini')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showApiKeys.gemini ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <Label htmlFor="openai-key" className="text-xs text-muted-foreground">
                            OpenAI API Key
                          </Label>
                          {settings.systemConfig?.hasOpenAIKey && (
                            <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              System configured
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <Input
                            id="openai-key"
                            type={showApiKeys.openai ? "text" : "password"}
                            placeholder="Enter your OpenAI API key"
                            value={settings.aiKeys.openai}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings(prev => ({
                              ...prev,
                              aiKeys: { ...prev.aiKeys, openai: e.target.value }
                            }))}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => toggleApiKeyVisibility('openai')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showApiKeys.openai ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <Label htmlFor="anthropic-key" className="text-xs text-muted-foreground">
                            Anthropic API Key
                          </Label>
                          {settings.systemConfig?.hasAnthropicKey && (
                            <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              System configured
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <Input
                            id="anthropic-key"
                            type={showApiKeys.anthropic ? "text" : "password"}
                            placeholder="Enter your Anthropic API key"
                            value={settings.aiKeys.anthropic}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings(prev => ({
                              ...prev,
                              aiKeys: { ...prev.aiKeys, anthropic: e.target.value }
                            }))}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => toggleApiKeyVisibility('anthropic')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showApiKeys.anthropic ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <Label htmlFor="azure-key" className="text-xs text-muted-foreground">
                            Azure OpenAI API Key
                          </Label>
                          {settings.systemConfig?.hasAzureOpenAIKey && (
                            <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              System configured
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <Input
                            id="azure-key"
                            type={showApiKeys.azureOpenAI ? "text" : "password"}
                            placeholder="Enter your Azure OpenAI API key"
                            value={settings.aiKeys.azureOpenAI}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings(prev => ({
                              ...prev,
                              aiKeys: { ...prev.aiKeys, azureOpenAI: e.target.value }
                            }))}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => toggleApiKeyVisibility('azureOpenAI')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showApiKeys.azureOpenAI ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Marketplace Connections */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Marketplace Connections
                  </CardTitle>
                  <CardDescription>
                    Connect your marketplace accounts. System-level configurations are shown when available.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Etsy */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Label>Etsy Integration</Label>
                        {settings.systemConfig?.hasEtsyConfig && (
                          <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            System
                          </span>
                        )}
                      </div>
                      <Switch
                        checked={settings.etsy.connected}
                        onCheckedChange={(checked: boolean) => 
                          setSettings(prev => ({ 
                            ...prev, 
                            etsy: { ...prev.etsy, connected: checked } 
                          }))
                        }
                      />
                    </div>
                    {settings.etsy.connected && (
                      <div className="space-y-2">
                        <Label htmlFor="etsy-api-key">API Key</Label>
                        <div className="relative">
                          <Input
                            id="etsy-api-key"
                            type={showApiKeys.etsy ? "text" : "password"}
                            placeholder="Enter your Etsy API key"
                            value={settings.etsy.apiKey}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings(prev => ({ 
                              ...prev, 
                              etsy: { ...prev.etsy, apiKey: e.target.value } 
                            }))}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => toggleApiKeyVisibility('etsy')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showApiKeys.etsy ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Amazon */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Label>Amazon Integration</Label>
                        {settings.systemConfig?.hasAmazonConfig && (
                          <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            System
                          </span>
                        )}
                      </div>
                      <Switch
                        checked={settings.amazon.connected}
                        onCheckedChange={(checked: boolean) => 
                          setSettings(prev => ({ 
                            ...prev, 
                            amazon: { ...prev.amazon, connected: checked } 
                          }))
                        }
                      />
                    </div>
                    {settings.amazon.connected && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="amazon-access-key">Access Key</Label>
                          <div className="relative">
                            <Input
                              id="amazon-access-key"
                              type={showApiKeys.amazonAccess ? "text" : "password"}
                              placeholder="Enter access key"
                              value={settings.amazon.accessKey}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings(prev => ({ 
                                ...prev, 
                                amazon: { ...prev.amazon, accessKey: e.target.value } 
                              }))}
                              className="pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => toggleApiKeyVisibility('amazonAccess')}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showApiKeys.amazonAccess ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="amazon-secret-key">Secret Key</Label>
                          <div className="relative">
                            <Input
                              id="amazon-secret-key"
                              type={showApiKeys.amazonSecret ? "text" : "password"}
                              placeholder="Enter secret key"
                              value={settings.amazon.secretKey}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings(prev => ({ 
                                ...prev, 
                                amazon: { ...prev.amazon, secretKey: e.target.value } 
                              }))}
                              className="pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => toggleApiKeyVisibility('amazonSecret')}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showApiKeys.amazonSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Shopify */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Label>Shopify Integration</Label>
                        {settings.systemConfig?.hasShopifyConfig && (
                          <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            System
                          </span>
                        )}
                      </div>
                      <Switch
                        checked={settings.shopify.connected}
                        onCheckedChange={(checked: boolean) => 
                          setSettings(prev => ({ 
                            ...prev, 
                            shopify: { ...prev.shopify, connected: checked } 
                          }))
                        }
                      />
                    </div>
                    {settings.shopify.connected && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="shopify-token">Access Token</Label>
                          <div className="relative">
                            <Input
                              id="shopify-token"
                              type={showApiKeys.shopify ? "text" : "password"}
                              placeholder="Enter access token"
                              value={settings.shopify.accessToken}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings(prev => ({ 
                                ...prev, 
                                shopify: { ...prev.shopify, accessToken: e.target.value } 
                              }))}
                              className="pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => toggleApiKeyVisibility('shopify')}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showApiKeys.shopify ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="shopify-domain">Shop Domain</Label>
                          <Input
                            id="shopify-domain"
                            placeholder="your-shop.myshopify.com"
                            value={settings.shopify.shopDomain}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings(prev => ({ 
                              ...prev, 
                              shopify: { ...prev.shopify, shopDomain: e.target.value } 
                            }))}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Notification Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>
                    Choose which notifications you want to receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(settings.notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label htmlFor={key} className="capitalize flex-1 cursor-pointer">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                      <Switch
                        id={key}
                        checked={value}
                        onCheckedChange={(checked: boolean) => 
                          setSettings(prev => ({ 
                            ...prev, 
                            notifications: { ...prev.notifications, [key]: checked } 
                          }))
                        }
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Feature Flags */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Feature Status
                  </CardTitle>
                  <CardDescription>
                    System-wide feature flags from Vercel
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex-1">
                        <p className="text-sm font-medium flex items-center gap-2">
                          Zig 3: Studio
                          {settings.features.zig3Studio && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                              Active
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">AI Design Studio</p>
                      </div>
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${
                        settings.features.zig3Studio ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-gray-400'
                      }`} />
                    </div>
                    <div className="flex items-start justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex-1">
                        <p className="text-sm font-medium flex items-center gap-2">
                          Zig 4: Stripe
                          {settings.features.zig4Stripe && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                              Active
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Payment Processing</p>
                      </div>
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${
                        settings.features.zig4Stripe ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-gray-400'
                      }`} />
                    </div>
                    <div className="flex items-start justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex-1">
                        <p className="text-sm font-medium flex items-center gap-2">
                          Zig 5: Social
                          {settings.features.zig5Social && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                              Active
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Social Media Signals</p>
                      </div>
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${
                        settings.features.zig5Social ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-gray-400'
                      }`} />
                    </div>
                    <div className="flex items-start justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex-1">
                        <p className="text-sm font-medium flex items-center gap-2">
                          Zig 6: Branding
                          {settings.features.zig6Branding && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                              Active
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Auto-Branding Engine</p>
                      </div>
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${
                        settings.features.zig6Branding ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-gray-400'
                      }`} />
                    </div>
                  </div>
                  <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground flex items-start gap-2">
                      <Server className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>
                        Feature flags are controlled by environment variables in your Vercel deployment. 
                        Set <code className="px-1 py-0.5 rounded bg-muted">NEXT_PUBLIC_ENABLE_ZIG*_*</code> to enable features.
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* System Configuration Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    System Configuration
                  </CardTitle>
                  <CardDescription>
                    Environment variable status from Vercel
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Database</span>
                      <span className={`flex items-center gap-1 ${
                        settings.systemConfig?.hasSupabaseConfig ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {settings.systemConfig?.hasSupabaseConfig ? (
                          <>
                            <CheckCircle className="h-3 w-3" />
                            Connected
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3 w-3" />
                            Not configured
                          </>
                        )}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">AI Providers</span>
                      <span className="text-xs">
                        {[
                          settings.systemConfig?.hasGeminiKey,
                          settings.systemConfig?.hasOpenAIKey,
                          settings.systemConfig?.hasAnthropicKey,
                          settings.systemConfig?.hasAzureOpenAIKey,
                        ].filter(Boolean).length} / 4
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Marketplaces</span>
                      <span className="text-xs">
                        {[
                          settings.systemConfig?.hasEtsyConfig,
                          settings.systemConfig?.hasShopifyConfig,
                          settings.systemConfig?.hasAmazonConfig,
                        ].filter(Boolean).length} / 3
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Payment (Stripe)</span>
                      <span className={`flex items-center gap-1 ${
                        settings.systemConfig?.hasStripeConfig ? 'text-green-600 dark:text-green-400' : 'text-gray-500'
                      }`}>
                        {settings.systemConfig?.hasStripeConfig ? (
                          <>
                            <CheckCircle className="h-3 w-3" />
                            Configured
                          </>
                        ) : (
                          'Not configured'
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground">
                      System configuration is managed through Vercel environment variables and cannot be changed here.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Data Export */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Data Export
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Export your settings and data for backup or migration.
                  </p>
                  <Button onClick={handleExport} variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export Settings
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}