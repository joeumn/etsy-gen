"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users as UsersIcon, 
  ArrowLeft,
  Search,
  Database,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Shield,
  Mail,
  Calendar,
  Activity,
  Settings,
  Loader2,
  PlayCircle,
  FileText,
  Server
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { format } from "date-fns";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  is_active: boolean;
  email_verified: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

interface DatabaseStatus {
  connected: boolean;
  hasConfig: boolean;
  error: string | null;
  supabaseUrl: string | null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [testingDb, setTestingDb] = useState(false);
  const [checkingTables, setCheckingTables] = useState(false);
  const [tableStatus, setTableStatus] = useState<Record<string, boolean> | null>(null);

  useEffect(() => {
    loadUsers();
    checkDatabaseStatus();
  }, [page, searchTerm, roleFilter]);

  const checkDatabaseStatus = async () => {
    try {
      const { getCurrentUserId } = await import('@/lib/session');
      const userId = getCurrentUserId();
      
      if (!userId) {
        console.error('No user ID found');
        return;
      }

      const response = await fetch(`/api/admin/db-setup?userId=${userId}`);
      if (response.ok) {
        const status = await response.json();
        setDbStatus(status);
      }
    } catch (error) {
      console.error('Error checking database status:', error);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { getCurrentUserId } = await import('@/lib/session');
      const userId = getCurrentUserId();
      
      if (!userId) {
        console.error('No user ID found');
        setLoading(false);
        return;
      }

      const params = new URLSearchParams({
        userId,
        page: page.toString(),
        limit: '10',
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      if (roleFilter !== 'all') {
        params.append('role', roleFilter);
      }

      const response = await fetch(`/api/admin/users?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setTotalPages(data.totalPages || 1);
      } else {
        console.error('Failed to load users:', await response.text());
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const testDatabaseConnection = async () => {
    try {
      setTestingDb(true);
      const { getCurrentUserId } = await import('@/lib/session');
      const userId = getCurrentUserId();
      
      if (!userId) return;

      const response = await fetch(`/api/admin/db-setup?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test' }),
      });

      const result = await response.json();
      
      // Update database status
      setDbStatus(prev => prev ? {
        ...prev,
        connected: result.connected,
        error: result.error || null,
      } : null);

      // Show result message (you can add a toast notification here)
      alert(result.message);
    } catch (error) {
      console.error('Error testing database:', error);
      alert('Failed to test database connection');
    } finally {
      setTestingDb(false);
    }
  };

  const checkTables = async () => {
    try {
      setCheckingTables(true);
      const { getCurrentUserId } = await import('@/lib/session');
      const userId = getCurrentUserId();
      
      if (!userId) return;

      const response = await fetch(`/api/admin/db-setup?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check-tables' }),
      });

      const result = await response.json();
      setTableStatus(result.tables);
      
      alert(result.message);
    } catch (error) {
      console.error('Error checking tables:', error);
      alert('Failed to check database tables');
    } finally {
      setCheckingTables(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'destructive';
      case 'admin':
        return 'default';
      default:
        return 'secondary';
    }
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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <UsersIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Users Management</h1>
                <p className="text-xs text-muted-foreground">Admin Panel</p>
              </div>
            </div>
          </motion.div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={loadUsers} 
              disabled={loading} 
              variant="outline" 
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Users List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Find Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by email or name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle>Users ({users.length})</CardTitle>
                <CardDescription>Manage and monitor user accounts</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <UsersIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No users found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-base">
                                {user.name || 'Unnamed User'}
                              </h3>
                              <Badge variant={getRoleBadgeVariant(user.role)}>
                                <Shield className="h-3 w-3 mr-1" />
                                {user.role.replace('_', ' ')}
                              </Badge>
                              {user.is_active ? (
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                  <Activity className="h-3 w-3 mr-1" />
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-red-600 border-red-600">
                                  Inactive
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span>{user.email}</span>
                              {user.email_verified && (
                                <CheckCircle className="h-3 w-3 text-green-600" />
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Joined: {format(new Date(user.created_at), 'MMM d, yyyy')}</span>
                          </div>
                          {user.last_login_at && (
                            <div className="flex items-center gap-1">
                              <Activity className="h-3 w-3" />
                              <span>Last login: {format(new Date(user.last_login_at), 'MMM d, yyyy')}</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Database Status */}
          <div className="space-y-6">
            {/* Database Connection Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Database Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dbStatus ? (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <span className="text-sm font-medium">Connection</span>
                          {dbStatus.connected ? (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Connected
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-red-600 border-red-600">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Disconnected
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <span className="text-sm font-medium">Configuration</span>
                          {dbStatus.hasConfig ? (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Set
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-red-600 border-red-600">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Missing
                            </Badge>
                          )}
                        </div>

                        {dbStatus.supabaseUrl && (
                          <div className="p-3 rounded-lg bg-muted/50">
                            <div className="text-xs font-medium mb-1">Supabase URL</div>
                            <div className="text-xs text-muted-foreground font-mono break-all">
                              {dbStatus.supabaseUrl}
                            </div>
                          </div>
                        )}

                        {dbStatus.error && (
                          <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                            <div className="text-xs font-medium text-red-800 dark:text-red-200 mb-1">Error</div>
                            <div className="text-xs text-red-700 dark:text-red-300">
                              {dbStatus.error}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Button
                          onClick={testDatabaseConnection}
                          disabled={testingDb}
                          variant="outline"
                          className="w-full"
                          size="sm"
                        >
                          {testingDb ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <PlayCircle className="h-4 w-4 mr-2" />
                          )}
                          Test Connection
                        </Button>

                        <Button
                          onClick={checkTables}
                          disabled={checkingTables}
                          variant="outline"
                          className="w-full"
                          size="sm"
                        >
                          {checkingTables ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Server className="h-4 w-4 mr-2" />
                          )}
                          Check Tables
                        </Button>
                      </div>

                      {tableStatus && (
                        <div className="pt-3 border-t">
                          <div className="text-xs font-medium mb-2">Table Status</div>
                          <div className="space-y-1">
                            {Object.entries(tableStatus).map(([table, exists]) => (
                              <div key={table} className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground font-mono">{table}</span>
                                {exists ? (
                                  <CheckCircle className="h-3 w-3 text-green-600" />
                                ) : (
                                  <AlertCircle className="h-3 w-3 text-red-600" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Migration Instructions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Setup Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-2">
                    <p className="text-muted-foreground">
                      To set up or fix your database:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                      <li>Open your Supabase dashboard</li>
                      <li>Go to SQL Editor</li>
                      <li>Run these migration files in order:
                        <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                          <li className="text-xs font-mono">schema.sql</li>
                          <li className="text-xs font-mono">stage3-migrations.sql</li>
                          <li className="text-xs font-mono">stage4-migrations.sql</li>
                          <li className="text-xs font-mono">fix-user-settings-migration.sql</li>
                        </ul>
                      </li>
                      <li>Click "Test Connection" to verify</li>
                    </ol>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    size="sm"
                    asChild
                  >
                    <a
                      href="https://supabase.com/dashboard"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Server className="h-4 w-4 mr-2" />
                      Open Supabase
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
