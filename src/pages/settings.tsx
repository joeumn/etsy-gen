import { AppLayout } from "../components/layout/app-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Separator } from "../components/ui/separator";
import { Switch } from "../components/ui/switch";
import {
  User,
  CreditCard,
  Zap,
  Shield,
  Eye,
  EyeOff,
  Upload,
  Check,
  Sparkles,
  Bell,
  Mail,
  Smartphone,
  Settings,
  Menu,
  Eye as VisibilityIcon,
  EyeOff as VisibilityOffIcon,
  GripVertical,
} from "lucide-react";
import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useTheme } from "../lib/theme-context";
import { Badge } from "../components/ui/badge";

const navItems = [
  { id: "profile", label: "Profile", icon: User, color: "text-primary" },
  { id: "billing", label: "Billing", icon: CreditCard, color: "text-secondary" },
  { id: "integrations", label: "AI Integrations", icon: Zap, color: "text-accent" },
  { id: "notifications", label: "Notifications", icon: Bell, color: "text-success" },
  { id: "navigation", label: "Navigation", icon: Settings, color: "text-purple" },
  { id: "security", label: "Security", icon: Shield, color: "text-warning" },
];

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");

  // Load nav items from localStorage or use defaults
  const [navItemsState, setNavItemsState] = useState(() => {
    const saved = localStorage.getItem('navItems');
    return saved ? JSON.parse(saved) : [
      { id: "dashboard", label: "AI Command Center", icon: "LayoutDashboard", visible: true },
      { id: "trends", label: "Trend Scanner", icon: "TrendingUp", visible: true },
      { id: "analytics", label: "AI Analytics", icon: "BarChart3", visible: true },
      { id: "products", label: "Digital Products", icon: "Package", visible: true },
      { id: "marketplaces", label: "Marketplaces", icon: "Store", visible: true },
      { id: "predict-studio", label: "Predict Studio", icon: "Sparkles", visible: true },
      { id: "network-status", label: "Network Status", icon: "Network", visible: true },
      { id: "settings", label: "Settings", icon: "Settings", visible: true },
    ];
  });

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="pb-2">
        <h2 className="text-primary">
          Settings
        </h2>
        <p className="text-muted-foreground">
          Manage your account settings and AI preferences
        </p>
      </div>

      {/* Settings Layout */}
      <div className="flex gap-6">
        {/* Fixed Navigation Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <div className="sticky top-20">
            <Card className="border-2 border-primary/10 bg-card shadow-sm">
              <CardContent className="p-3">
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveSection(item.id);
                          const element = document.getElementById(item.id);
                          if (element) {
                            const yOffset = -80; // Offset for fixed header
                            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                            window.scrollTo({ top: y, behavior: 'smooth' });
                          }
                        }}
                        className={`w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-all ${
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-primary-foreground' : item.color}`} />
                        <span className={isActive ? 'font-medium' : ''}>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>
        </aside>

        {/* Scrollable Content Area */}
        <div className="flex-1 min-w-0 space-y-6">
            {/* Profile Section */}
            <section id="profile">
              <Card>
                <CardHeader className="border-b">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <CardTitle>Profile Information</CardTitle>
                  </div>
                  <CardDescription>
                    Update your personal information and avatar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24 border-4 border-primary/20">
                      <AvatarImage src="" alt="Profile" />
                      <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                        JD
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground">
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Photo
                        </Button>
                        <Button variant="ghost" size="sm">
                          Remove
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG or GIF. Max size of 2MB.
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" defaultValue="John" className="bg-muted/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" defaultValue="Doe" className="bg-muted/50" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue="john.doe@example.com"
                      className="bg-muted/50"
                    />
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        defaultValue="+1 (555) 123-4567"
                        className="bg-muted/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Input
                        id="timezone"
                        defaultValue="PST (UTC-8)"
                        className="bg-muted/50"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button className="bg-primary hover:bg-primary/90">
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Billing Section */}
            <section id="billing">
              <Card>
                <CardHeader className="border-b">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-secondary" />
                    <CardTitle>Subscription & Billing</CardTitle>
                  </div>
                  <CardDescription>
                    Manage your subscription plan and payment methods
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="rounded-lg border-2 border-primary p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3>Professional Plan</h3>
                          <Badge className="bg-primary">
                            <Sparkles className="mr-1 h-3 w-3" />
                            Current
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Billed monthly
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl text-primary">$49</div>
                        <p className="text-sm text-muted-foreground">per month</p>
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="rounded-full bg-primary p-1">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <span>Unlimited products</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="rounded-full bg-primary p-1">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <span>AI-powered insights</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="rounded-full bg-primary p-1">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <span>Priority support</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="rounded-full bg-primary p-1">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <span>Advanced analytics</span>
                      </div>
                    </div>
                    <div className="mt-6 flex gap-2">
                      <Button variant="outline" size="sm" className="border-primary/50 hover:bg-primary hover:text-primary-foreground">
                        Change Plan
                      </Button>
                      <Button variant="outline" size="sm">
                        Cancel Subscription
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-4">Payment Method</h4>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                          <CreditCard className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div>
                          <p>Visa ending in 4242</p>
                          <p className="text-sm text-muted-foreground">
                            Expires 12/2025
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="border-secondary/50 text-secondary hover:bg-secondary hover:text-secondary-foreground">
                        Update
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Integrations Section */}
            <section id="integrations">
              <Card>
                <CardHeader className="border-b">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-accent" />
                    <CardTitle>AI Integrations</CardTitle>
                  </div>
                  <CardDescription>
                    Connect your AI service providers to power The Forge
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-4">
                    <div className="rounded-lg border p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                            <Sparkles className="h-5 w-5 text-primary-foreground" />
                          </div>
                          <div>
                            <h4 className="text-sm">Google Gemini</h4>
                            <p className="text-xs text-muted-foreground">
                              Advanced AI capabilities
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-success border-success/50">
                          <Check className="mr-1 h-3 w-3" />
                          Connected
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gemini">API Key</Label>
                        <div className="relative">
                          <Input
                            id="gemini"
                            type={showGeminiKey ? "text" : "password"}
                            placeholder="Enter your Gemini API key"
                            defaultValue="sk-gemini-1234567890abcdefghijklmnop"
                            className="bg-muted/50 pr-10"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full"
                            onClick={() => setShowGeminiKey(!showGeminiKey)}
                          >
                            {showGeminiKey ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                            <Zap className="h-5 w-5 text-secondary-foreground" />
                          </div>
                          <div>
                            <h4 className="text-sm">OpenAI</h4>
                            <p className="text-xs text-muted-foreground">
                              GPT-4 and more
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-success border-success/50">
                          <Check className="mr-1 h-3 w-3" />
                          Connected
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="openai">API Key</Label>
                        <div className="relative">
                          <Input
                            id="openai"
                            type={showOpenAIKey ? "text" : "password"}
                            placeholder="Enter your OpenAI API key"
                            defaultValue="sk-proj-1234567890abcdefghijklmnop"
                            className="bg-muted/50 pr-10"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full"
                            onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                          >
                            {showOpenAIKey ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button className="bg-primary hover:bg-primary/90">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Save API Keys
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Notifications Section */}
            <section id="notifications">
              <Card>
                <CardHeader className="border-b">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-success" />
                    <CardTitle>Notification Preferences</CardTitle>
                  </div>
                  <CardDescription>
                    Choose how you want to be notified
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-primary/10 p-2">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p>Email Notifications</p>
                          <p className="text-sm text-muted-foreground">
                            Receive updates via email
                          </p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-secondary/10 p-2">
                          <Smartphone className="h-5 w-5 text-secondary" />
                        </div>
                        <div>
                          <p>Push Notifications</p>
                          <p className="text-sm text-muted-foreground">
                            Get notified on your device
                          </p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-accent/10 p-2">
                          <Sparkles className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <p>AI Insights</p>
                          <p className="text-sm text-muted-foreground">
                            Weekly AI-generated reports
                          </p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Navigation Section */}
            <section id="navigation">
              <Card>
                <CardHeader className="border-b">
                  <div className="flex items-center gap-2">
                    <Menu className="h-5 w-5 text-purple-500" />
                    <CardTitle>Navigation Settings</CardTitle>
                  </div>
                  <CardDescription>
                    Customize your left navigation menu
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div>
                    <h4 className="mb-4">Menu Items</h4>
                    <DragDropContext
                      onDragEnd={(result) => {
                        if (!result.destination) return;
                        const items = Array.from(navItemsState);
                        const [reorderedItem] = items.splice(result.source.index, 1);
                        items.splice(result.destination.index, 0, reorderedItem);
                        setNavItemsState(items);
                      }}
                    >
                      <Droppable droppableId="nav-items">
                        {(provided) => (
                          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                            {navItemsState.map((item: any, index: number) => (
                              <Draggable key={item.id} draggableId={item.id} index={index}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="flex items-center gap-3 p-3 border rounded-lg"
                                  >
                                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                                    <div className="flex-1">
                                      <div className="font-medium">{item.label}</div>
                                      <div className="text-sm text-muted-foreground">/{item.id}</div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const newItems = [...navItemsState];
                                        newItems[index].visible = !newItems[index].visible;
                                        setNavItemsState(newItems);
                                      }}
                                    >
                                      {item.visible ? (
                                        <VisibilityIcon className="h-4 w-4" />
                                      ) : (
                                        <VisibilityOffIcon className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong>Note:</strong> Navigation changes will be saved to your user profile and applied across all your sessions.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-4">Theme Selector</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">Light Theme</div>
                          <div className="text-sm text-muted-foreground">Clean and bright interface</div>
                        </div>
                        <Button
                          variant={theme === "light" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTheme("light")}
                        >
                          {theme === "light" ? "Active" : "Select"}
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">Dark Theme</div>
                          <div className="text-sm text-muted-foreground">Easy on the eyes in low light</div>
                        </div>
                        <Button
                          variant={theme === "dark" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTheme("dark")}
                        >
                          {theme === "dark" ? "Active" : "Select"}
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">System Theme</div>
                          <div className="text-sm text-muted-foreground">Follow your system preference</div>
                        </div>
                        <Button
                          variant={theme === "system" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTheme("system")}
                        >
                          {theme === "system" ? "Active" : "Select"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      className="bg-primary hover:bg-primary/90"
                      onClick={() => {
                        // Save navigation preferences to localStorage
                        localStorage.setItem('navItems', JSON.stringify(navItemsState));
                        localStorage.setItem('theme', theme);
                        // Show success message or toast
                      }}
                    >
                      Save Navigation Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Security Section */}
            <section id="security">
              <Card>
                <CardHeader className="border-b">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-warning" />
                    <CardTitle>Security Settings</CardTitle>
                  </div>
                  <CardDescription>
                    Manage your account security preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div>
                    <h4 className="mb-4">Change Password</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          placeholder="Enter current password"
                          className="bg-muted/50"
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            placeholder="Enter new password"
                            className="bg-muted/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirm new password"
                            className="bg-muted/50"
                          />
                        </div>
                      </div>
                      <Button variant="outline" className="border-warning/50 text-warning hover:bg-warning hover:text-warning-foreground">
                        Update Password
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="mb-4">Two-Factor Authentication</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <p>Authenticator App</p>
                          <p className="text-sm text-muted-foreground">
                            Use an app to generate codes
                          </p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <p>SMS Verification</p>
                          <p className="text-sm text-muted-foreground">
                            Receive codes via text message
                          </p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="rounded-lg border-2 border-destructive/50 bg-destructive/5 p-6">
                    <h4 className="mb-2 text-destructive">Danger Zone</h4>
                    <p className="mb-4 text-sm text-muted-foreground">
                      These actions are irreversible. Please proceed with caution.
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Export Data
                      </Button>
                      <Button variant="destructive" size="sm">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
        </div>
      </div>
    </div>
    </AppLayout>
  );
}
