"use client";

import { useState, forwardRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Database, CheckCircle, XCircle } from 'lucide-react';
import SettingsCardSkeleton from './SettingsCardSkeleton';
import { toast } from 'sonner';

interface ConnectionManagementProps {
    settings: any;
    setSettings: (settings: any) => void;
    isLoading: boolean;
}

const ConnectionManagement = forwardRef(({ settings, setSettings, isLoading }: ConnectionManagementProps, ref) => {
    const [showKeys, setShowKeys] = useState({
        supabaseUrl: false,
        supabaseKey: false,
        etsyKey: false,
        shopifyToken: false,
        amazonKey: false,
    });

    const [testing, setTesting] = useState<string | null>(null);

    const toggleKeyVisibility = (key: keyof typeof showKeys) => {
        setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const testConnection = async (type: string) => {
        setTesting(type);
        toast.info(`Testing ${type} connection...`);
        
        try {
            const response = await fetch(`/api/onboarding/test-${type}`);
            const data = await response.json();
            
            if (data.success) {
                toast.success(`${type} connection successful!`);
            } else {
                toast.error(`${type} connection failed: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error(`${type} test error:`, error);
            toast.error(`Failed to test ${type} connection`);
        } finally {
            setTesting(null);
        }
    };

    if (isLoading) {
        return <SettingsCardSkeleton />;
    }

    return (
        <div className="space-y-6">
            {/* Database Connection */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Database Connection
                    </CardTitle>
                    <CardDescription>
                        Configure your Supabase database connection credentials
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="supabase-url">Supabase URL</Label>
                        <div className="relative">
                            <Input
                                id="supabase-url"
                                type={showKeys.supabaseUrl ? "text" : "password"}
                                placeholder="https://your-project.supabase.co"
                                value={settings.connections?.supabaseUrl || ''}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    connections: { ...settings.connections, supabaseUrl: e.target.value }
                                })}
                            />
                            <button
                                type="button"
                                onClick={() => toggleKeyVisibility('supabaseUrl')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showKeys.supabaseUrl ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="supabase-key">Supabase Anon Key</Label>
                        <div className="relative">
                            <Input
                                id="supabase-key"
                                type={showKeys.supabaseKey ? "text" : "password"}
                                placeholder="eyJhbG..."
                                value={settings.connections?.supabaseKey || ''}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    connections: { ...settings.connections, supabaseKey: e.target.value }
                                })}
                            />
                            <button
                                type="button"
                                onClick={() => toggleKeyVisibility('supabaseKey')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showKeys.supabaseKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <Button 
                        variant="outline" 
                        onClick={() => testConnection('db')}
                        disabled={testing === 'db'}
                    >
                        {testing === 'db' ? 'Testing...' : 'Test Database Connection'}
                    </Button>
                </CardContent>
            </Card>

            {/* Marketplace Connections */}
            <Card>
                <CardHeader>
                    <CardTitle>Marketplace Connections</CardTitle>
                    <CardDescription>
                        Update credentials for your connected marketplaces
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Etsy */}
                    <div className="space-y-4 pb-4 border-b">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium">Etsy</h4>
                            {settings.systemConfig?.hasEtsyConfig ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                            )}
                        </div>
                        <div>
                            <Label htmlFor="etsy-key">API Key</Label>
                            <div className="relative">
                                <Input
                                    id="etsy-key"
                                    type={showKeys.etsyKey ? "text" : "password"}
                                    placeholder="Enter Etsy API key"
                                    value={settings.connections?.etsyApiKey || ''}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        connections: { ...settings.connections, etsyApiKey: e.target.value }
                                    })}
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleKeyVisibility('etsyKey')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showKeys.etsyKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => testConnection('marketplaces')}
                            disabled={testing === 'marketplaces'}
                        >
                            {testing === 'marketplaces' ? 'Testing...' : 'Test Connection'}
                        </Button>
                    </div>

                    {/* Shopify */}
                    <div className="space-y-4 pb-4 border-b">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium">Shopify</h4>
                            {settings.systemConfig?.hasShopifyConfig ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                            )}
                        </div>
                        <div>
                            <Label htmlFor="shopify-token">Access Token</Label>
                            <div className="relative">
                                <Input
                                    id="shopify-token"
                                    type={showKeys.shopifyToken ? "text" : "password"}
                                    placeholder="Enter Shopify access token"
                                    value={settings.connections?.shopifyToken || ''}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        connections: { ...settings.connections, shopifyToken: e.target.value }
                                    })}
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleKeyVisibility('shopifyToken')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showKeys.shopifyToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Amazon */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium">Amazon</h4>
                            {settings.systemConfig?.hasAmazonConfig ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                            )}
                        </div>
                        <div>
                            <Label htmlFor="amazon-key">Access Key</Label>
                            <div className="relative">
                                <Input
                                    id="amazon-key"
                                    type={showKeys.amazonKey ? "text" : "password"}
                                    placeholder="Enter Amazon access key"
                                    value={settings.connections?.amazonKey || ''}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        connections: { ...settings.connections, amazonKey: e.target.value }
                                    })}
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleKeyVisibility('amazonKey')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showKeys.amazonKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
});

ConnectionManagement.displayName = 'ConnectionManagement';

export default ConnectionManagement;
