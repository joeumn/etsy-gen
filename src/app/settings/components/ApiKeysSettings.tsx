"use client";

import { useState, forwardRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, CheckCircle, Shield } from 'lucide-react';
import SettingsCardSkeleton from './SettingsCardSkeleton';

interface ApiKeysSettingsProps {
    settings: any;
    setSettings: (settings: any) => void;
    isLoading: boolean;
}

const ApiKeysSettings = forwardRef(({ settings, setSettings, isLoading }: ApiKeysSettingsProps, ref) => {
    const [showApiKeys, setShowApiKeys] = useState({
        gemini: false,
        openai: false,
        anthropic: false,
        azureOpenAI: false,
    });

    const toggleApiKeyVisibility = (key: keyof typeof showApiKeys) => {
        setShowApiKeys(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (isLoading) {
        return <SettingsCardSkeleton />;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>AI Provider Settings</CardTitle>
                <CardDescription>
                    Configure your preferred AI provider and enter your API keys.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <Label htmlFor="ai-provider">Default AI Provider</Label>
                    <Select
                        value={settings.aiProvider}
                        onValueChange={(value: string) => setSettings({ ...settings, aiProvider: value })}
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

                <div className="space-y-4">
                    <Label className="text-base font-semibold">API Keys (User Level)</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                        These keys are specific to your account and will override system-level keys.
                    </p>

                    {/* Gemini */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <Label htmlFor="gemini-key" className="font-medium">Google Gemini</Label>
                            {settings.systemConfig?.hasGeminiKey && (
                                <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                    <Shield className="h-3 w-3" />
                                    System Key Available
                                </span>
                            )}
                        </div>
                        <div className="relative">
                            <Input
                                id="gemini-key"
                                type={showApiKeys.gemini ? "text" : "password"}
                                placeholder="Enter your Gemini API key"
                                value={settings.aiKeys?.gemini || ''}
                                onChange={(e) => setSettings({ ...settings, aiKeys: { ...settings.aiKeys, gemini: e.target.value }})}
                                className="pr-10"
                            />
                            <button type="button" onClick={() => toggleApiKeyVisibility('gemini')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                {showApiKeys.gemini ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    {/* OpenAI */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <Label htmlFor="openai-key" className="font-medium">OpenAI</Label>
                            {settings.systemConfig?.hasOpenAIKey && (
                                <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                    <Shield className="h-3 w-3" />
                                    System Key Available
                                </span>
                            )}
                        </div>
                        <div className="relative">
                            <Input
                                id="openai-key"
                                type={showApiKeys.openai ? "text" : "password"}
                                placeholder="Enter your OpenAI API key"
                                value={settings.aiKeys?.openai || ''}
                                onChange={(e) => setSettings({ ...settings, aiKeys: { ...settings.aiKeys, openai: e.target.value }})}
                                className="pr-10"
                            />
                            <button type="button" onClick={() => toggleApiKeyVisibility('openai')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                {showApiKeys.openai ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Anthropic */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <Label htmlFor="anthropic-key" className="font-medium">Anthropic</Label>
                            {settings.systemConfig?.hasAnthropicKey && (
                                <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                    <Shield className="h-3 w-3" />
                                    System Key Available
                                </span>
                            )}
                        </div>
                        <div className="relative">
                            <Input
                                id="anthropic-key"
                                type={showApiKeys.anthropic ? "text" : "password"}
                                placeholder="Enter your Anthropic API key"
                                value={settings.aiKeys?.anthropic || ''}
                                onChange={(e) => setSettings({ ...settings, aiKeys: { ...settings.aiKeys, anthropic: e.target.value }})}
                                className="pr-10"
                            />
                            <button type="button" onClick={() => toggleApiKeyVisibility('anthropic')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                {showApiKeys.anthropic ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Azure OpenAI */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <Label htmlFor="azure-key" className="font-medium">Azure OpenAI</Label>
                            {settings.systemConfig?.hasAzureOpenAIKey && (
                                <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                    <Shield className="h-3 w-3" />
                                    System Key Available
                                </span>
                            )}
                        </div>
                        <div className="relative">
                            <Input
                                id="azure-key"
                                type={showApiKeys.azureOpenAI ? "text" : "password"}
                                placeholder="Enter your Azure OpenAI API key"
                                value={settings.aiKeys?.azureOpenAI || ''}
                                onChange={(e) => setSettings({ ...settings, aiKeys: { ...settings.aiKeys, azureOpenAI: e.target.value }})}
                                className="pr-10"
                            />
                            <button type="button" onClick={() => toggleApiKeyVisibility('azureOpenAI')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                {showApiKeys.azureOpenAI ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
});

ApiKeysSettings.displayName = 'ApiKeysSettings';
export default ApiKeysSettings;