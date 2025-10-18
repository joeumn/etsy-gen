"use client";

import { useState, forwardRef } from 'react';
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

    const handleMigrateDatabase = async () => {
        setMigrating(true);
        toast.info("Starting database migration...");
        
        try {
            // This would call your migration API endpoint
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated delay
            toast.success("Database migration completed successfully!");
        } catch (error) {
            console.error('Migration error:', error);
            toast.error("Failed to migrate database. Please check logs.");
        } finally {
            setMigrating(false);
        }
    };

    const handleBackupDatabase = async () => {
        setDownloading(true);
        toast.info("Preparing database backup...");
        
        try {
            // This would call your backup API endpoint
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated delay
            toast.success("Database backup ready! Download starting...");
            
            // In a real implementation, this would trigger a file download
            // const blob = new Blob([backupData], { type: 'application/sql' });
            // const url = window.URL.createObjectURL(blob);
            // const a = document.createElement('a');
            // a.href = url;
            // a.download = `database-backup-${new Date().toISOString()}.sql`;
            // a.click();
        } catch (error) {
            console.error('Backup error:', error);
            toast.error("Failed to create database backup.");
        } finally {
            setDownloading(false);
        }
    };

    const handleRestoreDatabase = () => {
        toast.info("Database restore functionality coming soon!");
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
                            </div>
                            <Button
                                variant="outline"
                                onClick={handleRestoreDatabase}
                                disabled={!settings.systemConfig?.hasSupabaseConfig}
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Restore
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
