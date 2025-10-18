"use client";

import { forwardRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, AlertCircle, Server, Shield } from 'lucide-react';
import SettingsCardSkeleton from './SettingsCardSkeleton';


interface SystemStatusProps {
    settings: any;
    isLoading: boolean;
}

const SystemStatus = forwardRef(({ settings, isLoading }: SystemStatusProps, ref) => {

    if (isLoading) {
        return (
            <div className="space-y-6">
                <SettingsCardSkeleton />
                <SettingsCardSkeleton />
            </div>
        );
    }

    const featureFlags = [
        { id: 'zig3Studio', label: 'AI Design Studio', description: 'Integrate image generation for instant product mockups' },
        { id: 'zig4Stripe', label: 'Monetization', description: 'Enable Stripe billing and usage-based limits' },
        { id: 'zig5Social', label: 'Social Signals', description: 'Scan social media for trend ranking' },
        { id: 'zig6Branding', label: 'Auto-Branding Engine', description: 'Create branding for product lines' },
    ];

    const systemConfigs = [
        { id: 'hasSupabaseConfig', label: 'Database Connection' },
        { id: 'hasStripeConfig', label: 'Payment Gateway (Stripe)' },
    ];

    const countTrue = (items: (boolean | undefined)[]) => items.filter(Boolean).length;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Server className="h-5 w-5" />
                        System Configuration
                    </CardTitle>
                    <CardDescription>
                        Read-only status of critical environment variables from the server.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {systemConfigs.map(config => (
                        <div key={config.id} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{config.label}</span>
                            <span className={`flex items-center gap-1.5 font-medium ${
                                settings.systemConfig?.[config.id] ? 'text-green-600' : 'text-red-500'
                            }`}>
                                {settings.systemConfig?.[config.id] ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                                {settings.systemConfig?.[config.id] ? 'Configured' : 'Not Configured'}
                            </span>
                        </div>
                    ))}
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">AI Providers</span>
                        <span className="font-medium">
                            {countTrue([
                                settings.systemConfig?.hasGeminiKey,
                                settings.systemConfig?.hasOpenAIKey,
                                settings.systemConfig?.hasAnthropicKey,
                                settings.systemConfig?.hasAzureOpenAIKey,
                            ])} / 4 Configured
                        </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Marketplaces</span>
                        <span className="font-medium">
                            {countTrue([
                                settings.systemConfig?.hasEtsyConfig,
                                settings.systemConfig?.hasShopifyConfig,
                                settings.systemConfig?.hasAmazonConfig,
                            ])} / 3 Configured
                        </span>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Feature Flags
                    </CardTitle>
                    <CardDescription>
                        System-wide feature availability controlled by server environment variables.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {featureFlags.map(flag => (
                        <div key={flag.id} className="flex items-start justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                            <div>
                                <p className="font-medium">{flag.label}</p>
                                <p className="text-sm text-muted-foreground">{flag.description}</p>
                            </div>
                            <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${
                                settings.features?.[flag.id]
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                                {settings.features?.[flag.id] ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
});

SystemStatus.displayName = 'SystemStatus';
export default SystemStatus;