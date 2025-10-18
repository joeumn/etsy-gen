"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowLeft,
  User,
  KeyRound,
  Building,
  Bell,
  Server,
  Shield,
  Sparkles,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { createClient } from '@/lib/supabase/client';

// Import the new components
import ProfileSettings from './components/ProfileSettings';
import SecuritySettings from './components/SecuritySettings';
import ApiKeysSettings from './components/ApiKeysSettings';
import MarketplaceSettings from './components/MarketplaceSettings';
import NotificationSettings from './components/NotificationSettings';
import SystemStatus from './components/SystemStatus';

export type SettingsTab = 'profile' | 'security' | 'apiKeys' | 'marketplaces' | 'notifications' | 'systemStatus';
export type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

const TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'apiKeys', label: 'API Keys', icon: KeyRound },
  { id: 'marketplaces', label: 'Marketplaces', icon: Building },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'systemStatus', label: 'System Status', icon: Server },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [settings, setSettings] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  // Refs for Profile and Security save handlers
  const profileRef = useRef<{ handleSave: () => Promise<boolean> }>(null);
  const securityRef = useRef<{ handleSave: () => Promise<boolean> }>(null);

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/settings/load?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        } else {
          console.error('Failed to load settings');
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaveStatus('saving');
    let success = false;

    if (activeTab === 'profile' && profileRef.current) {
      success = await profileRef.current.handleSave();
    } else if (activeTab === 'security' && securityRef.current) {
      success = await securityRef.current.handleSave();
    } else {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSaveStatus('error');
        return;
      }

      const response = await fetch(`/api/settings/save?userId=${user.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings)
      });
      success = response.ok;
    }

    setSaveStatus(success ? 'success' : 'error');
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings ref={profileRef} setSaveStatus={setSaveStatus} />;
      case 'security':
        return <SecuritySettings ref={securityRef} setSaveStatus={setSaveStatus} />;
      case 'apiKeys':
        return <ApiKeysSettings settings={settings} setSettings={setSettings} isLoading={isLoading} />;
      case 'marketplaces':
        return <MarketplaceSettings settings={settings} setSettings={setSettings} isLoading={isLoading} />;
      case 'notifications':
        return <NotificationSettings settings={settings} setSettings={setSettings} isLoading={isLoading} />;
      case 'systemStatus':
        return <SystemStatus settings={settings} isLoading={isLoading} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard" className='flex items-center gap-2'>
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            </Button>
            <h1 className="text-xl font-bold">Settings</h1>
          </motion.div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button onClick={handleSave} disabled={saveStatus === 'saving' || activeTab === 'systemStatus'} variant="default" size="sm">
              {saveStatus === 'saving' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span className="hidden sm:inline ml-2">Save Changes</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Save Status Toast */}
        {saveStatus !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 border rounded-lg flex items-center gap-3 ${
              saveStatus === 'success'
                ? 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
                : 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
            }`}
          >
            {saveStatus === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <span className="font-medium">
              {saveStatus === 'success' ? 'Changes saved successfully!' : 'Failed to save changes. Please try again.'}
            </span>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Sidebar Navigation */}
          <aside className="hidden lg:block lg:col-span-1">
            <nav className="space-y-1 sticky top-24">
              {TABS.map((tab) => (
                <Button key={tab.id} variant={activeTab === tab.id ? 'secondary' : 'ghost'} className="w-full justify-start text-base py-6" onClick={() => setActiveTab(tab.id)}>
                  <tab.icon className="mr-3 h-5 w-5" />
                  {tab.label}
                </Button>
              ))}
            </nav>
          </aside>

          {/* Mobile Tab Navigation */}
          <div className="lg:hidden col-span-1 mb-4">
            <div className="border-b">
              <div className="overflow-x-auto -mx-4 px-4">
                <div className="flex space-x-2">
                {TABS.map((tab) => (
                  <Button key={tab.id} variant={activeTab === tab.id ? 'secondary' : 'ghost'} size="sm" className="shrink-0" onClick={() => setActiveTab(tab.id)}>
                    <tab.icon className="mr-2 h-4 w-4" />
                    {tab.label}
                  </Button>
                ))}
                </div>
              </div>
            </div>
          </div>

          <main className="lg:col-span-3">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              {renderContent()}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}