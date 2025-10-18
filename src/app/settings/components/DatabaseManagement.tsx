"use client";

import { useState, forwardRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Download, Upload, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import SettingsCardSkeleton from './SettingsCardSkeleton';

interface DatabaseManagementProps {
    settings: any;
    isLoading: boolean;
}

const DatabaseManagement = forwardRef(({ settings, isLoading }: DatabaseManagementProps, ref) => {
    const [migrating, setMigrating] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [restoring, setRestoring] = useState(false);
    const [backups, setBackups] = useState<any[]>([]);
    const [userId] = useState<string>("admin@foundersforge.com");

    useEffect(() => {
        if (!isLoading && settings.systemConfig?.hasSupabaseConfig) {
            fetchBackups();
        }
    }, [isLoading, settings]);

    const fetchBackups = async () => {
        try {
            const response = await fetch(`/api/database/backup?userId=${userId}`);
            if (response.ok) {
                const data = await response.json();
                setBackups(data.operations || []);
            }
        } catch (error) {
            console.error('Error fetching backups:', error);
        }
    };

    const handleMigrateDatabase = async () => {
        setMigrating(true);
        toast.info("Starting database migration...");
        
        try {
            const response = await fetch('/api/database/migrate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });

            if (!response.ok) {
                throw new Error('Migration failed');
            }

            const data = await response.json();
            toast.success("Database migration completed successfully!");
        } catch (error: any) {
            console.error('Migration error:', error);
            toast.error(error.message || "Failed to migrate database. Please check logs.");
        } finally {
            setMigrating(false);
        }
    };

    const handleBackupDatabase = async () => {
        setDownloading(true);
        toast.info("Preparing database backup...");
        
        try {
            const response = await fetch('/api/database/backup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });

            if (!response.ok) {
                throw new Error('Backup failed');
            }

            const data = await response.json();
            toast.success("Database backup created successfully!");
            fetchBackups(); // Refresh backup list
        } catch (error: any) {
            console.error('Backup error:', error);
            toast.error(error.message || "Failed to create database backup.");
        } finally {
            setDownloading(false);
        }
    };

    const handleRestoreDatabase = async (backupId: string) => {
        if (!confirm('Are you sure you want to restore from this backup? This will overwrite current data.')) {
            return;
        }

        setRestoring(true);
        toast.info("Starting database restore...");
        
        try {
            const response = await fetch('/api/database/restore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, backupId }),
            });

            if (!response.ok) {
                throw new Error('Restore failed');
            }

            const data = await response.json();
            toast.success("Database restored successfully!");
        } catch (error: any) {
            console.error('Restore error:', error);
            toast.error(error.message || "Failed to restore database.");
        } finally {
            setRestoring(false);
        }
    };

    if (isLoading) {
        return <SettingsCardSkeleton />;
    }

    return (
        <div className="space-y-6">
            {/* Database Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Database Status
                    </CardTitle>
                    <CardDescription>
                        Current database connection and health information
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">Connection Status</p>
                            <p className="font-medium flex items-center gap-2">
                                {settings.systemConfig?.hasSupabaseConfig ? (
                                    <>
                                        <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                        Connected
                                    </>
                                ) : (
                                    <>
                                        <span className="h-2 w-2 rounded-full bg-red-500"></span>
                                        Not Connected
                                    </>
                                )}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Database Type</p>
                            <p className="font-medium">PostgreSQL (Supabase)</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Last Backup</p>
                            <p className="font-medium">Never</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Schema Version</p>
                            <p className="font-medium">2.0.0</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Database Operations */}
            <Card>
                <CardHeader>
                    <CardTitle>Database Operations</CardTitle>
                    <CardDescription>
                        Perform database maintenance and backup operations
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-4">
                        {/* Migration */}
                        <div className="flex items-start justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                                <h4 className="font-medium mb-1">Run Migrations</h4>
                                <p className="text-sm text-muted-foreground">
                                    Update database schema to the latest version
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={handleMigrateDatabase}
                                disabled={migrating || !settings.systemConfig?.hasSupabaseConfig}
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${migrating ? 'animate-spin' : ''}`} />
                                {migrating ? 'Migrating...' : 'Migrate'}
                            </Button>
                        </div>

                        {/* Backup */}
                        <div className="flex items-start justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                                <h4 className="font-medium mb-1">Backup Database</h4>
                                <p className="text-sm text-muted-foreground">
                                    Download a complete backup of your database
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={handleBackupDatabase}
                                disabled={downloading || !settings.systemConfig?.hasSupabaseConfig}
                            >
                                <Download className={`h-4 w-4 mr-2 ${downloading ? 'animate-pulse' : ''}`} />
                                {downloading ? 'Preparing...' : 'Backup'}
                            </Button>
                        </div>

                        {/* Restore */}
                        <div className="flex items-start justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                                <h4 className="font-medium mb-1">Restore Database</h4>
                                <p className="text-sm text-muted-foreground">
                                    Restore database from a backup file
                                </p>
                                {backups.length > 0 && backups.filter(b => b.status === 'completed').length > 0 && (
                                    <div className="mt-2">
                                        <select 
                                            className="text-sm border rounded px-2 py-1"
                                            onChange={(e) => e.target.value && handleRestoreDatabase(e.target.value)}
                                            disabled={restoring || !settings.systemConfig?.hasSupabaseConfig}
                                        >
                                            <option value="">Select a backup...</option>
                                            {backups
                                                .filter(b => b.status === 'completed')
                                                .map(backup => (
                                                    <option key={backup.id} value={backup.id}>
                                                        {backup.file_name} - {new Date(backup.created_at).toLocaleString()}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                )}
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    if (backups.length === 0 || backups.filter(b => b.status === 'completed').length === 0) {
                                        toast.info("No backups available. Create a backup first.");
                                    }
                                }}
                                disabled={restoring || !settings.systemConfig?.hasSupabaseConfig || backups.filter(b => b.status === 'completed').length === 0}
                            >
                                <Upload className={`h-4 w-4 mr-2 ${restoring ? 'animate-pulse' : ''}`} />
                                {restoring ? 'Restoring...' : 'Restore'}
                            </Button>
                        </div>
                    </div>

                    {/* Warning Notice */}
                    {!settings.systemConfig?.hasSupabaseConfig && (
                        <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                            <div className="flex-1">
                                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                                    Database Not Connected
                                </h4>
                                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                    Configure your database connection in the Connection Management section to enable these features.
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Database Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Backup History</CardTitle>
                    <CardDescription>
                        Recent database backups
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {backups.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No backups available</p>
                    ) : (
                        <div className="space-y-2 text-sm">
                            {backups.slice(0, 5).map(backup => (
                                <div key={backup.id} className="flex items-center justify-between py-2 border-b">
                                    <div>
                                        <span className="font-mono">{backup.file_name}</span>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(backup.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded ${
                                        backup.status === 'completed' 
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                                            : backup.status === 'failed'
                                            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                    }`}>
                                        {backup.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Migration Files Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Configuration Files</CardTitle>
                    <CardDescription>
                        SQL migration files available in your project
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between py-2 border-b">
                            <span className="font-mono">schema.sql</span>
                            <span className="text-muted-foreground">Core schema</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b">
                            <span className="font-mono">ai-bots-schema.sql</span>
                            <span className="text-muted-foreground">AI Bots feature</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b">
                            <span className="font-mono">stage3-migrations.sql</span>
                            <span className="text-muted-foreground">Stage 3 features</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b">
                            <span className="font-mono">stage4-migrations.sql</span>
                            <span className="text-muted-foreground">Stage 4 automation</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="font-mono">live-data-migration.sql</span>
                            <span className="text-muted-foreground">Live data support</span>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                        These files are located in <code className="bg-muted px-1 py-0.5 rounded">lib/db/</code>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
});

DatabaseManagement.displayName = 'DatabaseManagement';

export default DatabaseManagement;
