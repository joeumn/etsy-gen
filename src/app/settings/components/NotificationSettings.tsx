"use client";

import { forwardRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import SettingsCardSkeleton from './SettingsCardSkeleton';

interface NotificationSettingsProps {
    settings: any;
    setSettings: (settings: any) => void;
    isLoading: boolean;
}

const NotificationSettings = forwardRef(({ settings, setSettings, isLoading }: NotificationSettingsProps, ref) => {

    if (isLoading) {
        return <SettingsCardSkeleton />;
    }

    const notificationItems = [
        { id: 'email', label: 'Email Notifications' },
        { id: 'push', label: 'Push Notifications' },
        { id: 'weeklyReport', label: 'Weekly Reports' },
        { id: 'newTrends', label: 'New Trend Alerts' },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                    Choose which notifications you want to receive about your account and activity.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {notificationItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                        <Label htmlFor={item.id} className="font-medium cursor-pointer flex-1">
                            {item.label}
                        </Label>
                        <Switch
                            id={item.id}
                            checked={settings.notifications?.[item.id] || false}
                            onCheckedChange={(checked) => setSettings({
                                ...settings,
                                notifications: { ...settings.notifications, [item.id]: checked }
                            })}
                        />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
});

NotificationSettings.displayName = 'NotificationSettings';
export default NotificationSettings;