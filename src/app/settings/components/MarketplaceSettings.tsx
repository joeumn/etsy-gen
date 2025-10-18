"use client";

import { useState, forwardRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Shield } from 'lucide-react';
import SettingsCardSkeleton from './SettingsCardSkeleton';

interface MarketplaceSettingsProps {
    settings: any;
    setSettings: (settings: any) => void;
    isLoading: boolean;
}

const MarketplaceSettings = forwardRef(({ settings, setSettings, isLoading }: MarketplaceSettingsProps, ref) => {
    const [showApiKeys, setShowApiKeys] = useState({
        etsy: false,
        amazonAccess: false,
        amazonSecret: false,
        shopify: false,
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
                <CardTitle>Marketplace Connections</CardTitle>
                <CardDescription>
                    Connect your marketplace accounts to enable automated listing and data syncing.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Etsy */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label className="text-lg font-medium">Etsy</Label>
                        <Switch
                            checked={settings.etsy?.connected || false}
                            onCheckedChange={(checked) => setSettings({ ...settings, etsy: { ...settings.etsy, connected: checked }})}
                        />
                    </div>
                    {settings.systemConfig?.hasEtsyConfig && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Shield className="h-3 w-3 text-green-600" />
                            System-level connection is configured. User settings will override.
                        </p>
                    )}
                    {settings.etsy?.connected && (
                        <div className="space-y-2 pl-4 border-l-2">
                            <Label htmlFor="etsy-api-key">API Key</Label>
                            <div className="relative">
                                <Input
                                    id="etsy-api-key"
                                    type={showApiKeys.etsy ? "text" : "password"}
                                    placeholder="Enter your Etsy API key"
                                    value={settings.etsy?.apiKey || ''}
                                    onChange={(e) => setSettings({ ...settings, etsy: { ...settings.etsy, apiKey: e.target.value }})}
                                    className="pr-10"
                                />
                                <button type="button" onClick={() => toggleApiKeyVisibility('etsy')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
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
                        <Label className="text-lg font-medium">Amazon</Label>
                        <Switch
                            checked={settings.amazon?.connected || false}
                            onCheckedChange={(checked) => setSettings({ ...settings, amazon: { ...settings.amazon, connected: checked }})}
                        />
                    </div>
                     {settings.systemConfig?.hasAmazonConfig && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Shield className="h-3 w-3 text-green-600" />
                            System-level connection is configured. User settings will override.
                        </p>
                    )}
                    {settings.amazon?.connected && (
                        <div className="space-y-4 pl-4 border-l-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="amazon-access-key">Access Key</Label>
                                    <div className="relative">
                                        <Input
                                            id="amazon-access-key"
                                            type={showApiKeys.amazonAccess ? "text" : "password"}
                                            placeholder="Enter access key"
                                            value={settings.amazon?.accessKey || ''}
                                            onChange={(e) => setSettings({ ...settings, amazon: { ...settings.amazon, accessKey: e.target.value }})}
                                            className="pr-10"
                                        />
                                        <button type="button" onClick={() => toggleApiKeyVisibility('amazonAccess')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
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
                                            value={settings.amazon?.secretKey || ''}
                                            onChange={(e) => setSettings({ ...settings, amazon: { ...settings.amazon, secretKey: e.target.value }})}
                                            className="pr-10"
                                        />
                                        <button type="button" onClick={() => toggleApiKeyVisibility('amazonSecret')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                            {showApiKeys.amazonSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <Separator />

                {/* Shopify */}
                <div className="space-y-3">
                     <div className="flex items-center justify-between">
                        <Label className="text-lg font-medium">Shopify</Label>
                        <Switch
                            checked={settings.shopify?.connected || false}
                            onCheckedChange={(checked) => setSettings({ ...settings, shopify: { ...settings.shopify, connected: checked }})}
                        />
                    </div>
                    {settings.systemConfig?.hasShopifyConfig && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Shield className="h-3 w-3 text-green-600" />
                            System-level connection is configured. User settings will override.
                        </p>
                    )}
                    {settings.shopify?.connected && (
                        <div className="space-y-4 pl-4 border-l-2">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="shopify-token">Access Token</Label>
                                    <div className="relative">
                                        <Input
                                            id="shopify-token"
                                            type={showApiKeys.shopify ? "text" : "password"}
                                            placeholder="Enter access token"
                                            value={settings.shopify?.accessToken || ''}
                                            onChange={(e) => setSettings({ ...settings, shopify: { ...settings.shopify, accessToken: e.target.value }})}
                                            className="pr-10"
                                        />
                                        <button type="button" onClick={() => toggleApiKeyVisibility('shopify')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                            {showApiKeys.shopify ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="shopify-domain">Shop Domain</Label>
                                    <Input
                                        id="shopify-domain"
                                        placeholder="your-shop.myshopify.com"
                                        value={settings.shopify?.shopDomain || ''}
                                        onChange={(e) => setSettings({ ...settings, shopify: { ...settings.shopify, shopDomain: e.target.value }})}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
});

MarketplaceSettings.displayName = 'MarketplaceSettings';
export default MarketplaceSettings;