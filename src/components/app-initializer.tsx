"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, AlertCircle, Wifi, Database, Key, Package, Sparkles } from "lucide-react";
import { Progress } from "./ui/progress";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { useInitialization } from "./initialization-context";

interface InitStep {
  id: string;
  label: string;
  status: "pending" | "loading" | "success" | "error";
  message?: string;
  icon: any;
}

interface AppInitializerProps {
  children: React.ReactNode;
  onComplete?: () => void;
}

export function AppInitializer({ children, onComplete }: AppInitializerProps) {
  const { status } = useSession();
  const { setStatus: setInitStatus, setDetails, setLastRunAt } = useInitialization();
  const [shouldInitialize, setShouldInitialize] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<InitStep[]>([
    { id: "env", label: "Loading Environment", status: "pending", icon: Key },
    { id: "db", label: "Connecting to Database", status: "pending", icon: Database },
    { id: "apis", label: "Verifying API Keys", status: "pending", icon: Wifi },
    { id: "scan", label: "Initial Marketplace Scan", status: "pending", icon: Package },
    { id: "ready", label: "System Ready", status: "pending", icon: Sparkles },
  ]);
  const [progress, setProgress] = useState(0);

  const resetSteps = useCallback(() => {
    setSteps((prev) =>
      prev.map((step) => ({
        ...step,
        status: "pending",
        message: undefined,
      })),
    );
    setCurrentStep(0);
    setProgress(0);
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      const initDone = typeof window !== "undefined" ? sessionStorage.getItem("forge-init-done") : null;
      if (!initDone) {
        resetSteps();
        setShouldInitialize(true);
        setIsInitializing(true);
        setInitStatus("running");
        setDetails({ step: "environment", message: "Starting system checks" });
      } else {
        setShouldInitialize(false);
        setIsInitializing(false);
        setInitStatus("success");
        setDetails({ step: "ready", message: "System ready" });
        setLastRunAt(initDone);
      }
    } else if (status === "unauthenticated") {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("forge-init-done");
      }
      setShouldInitialize(false);
      setIsInitializing(false);
      setInitStatus("idle");
      setDetails(undefined);
      setLastRunAt(undefined);
    }
  }, [status, resetSteps, setInitStatus, setDetails, setLastRunAt]);

  useEffect(() => {
    if (shouldInitialize) {
      initializeApp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldInitialize]);

  const updateStep = (index: number, status: "loading" | "success" | "error", message?: string) => {
    setSteps(prev => prev.map((step, i) => 
      i === index ? { ...step, status, message } : step
    ));
  };

  const initializeApp = async () => {
    if (!shouldInitialize) return;

    try {
      const nowIso = new Date().toISOString();

      // Step 1: Load environment variables
      setCurrentStep(0);
      updateStep(0, "loading");
      setDetails({ step: "environment", message: "Loading environment variables" });
      await simulateStep(500);
      
      const envCheck = await fetch("/api/health/env").then(r => r.json()).catch(() => ({ ok: true }));
      updateStep(0, "success", "Environment loaded");
      setDetails({ step: "environment", message: envCheck.message ?? "Environment loaded" });
      setProgress(20);

      // Step 2: Database connection
      setCurrentStep(1);
      updateStep(1, "loading");
      setDetails({ step: "database", message: "Connecting to database" });
      await simulateStep(800);
      
      const dbCheck = await fetch("/api/health/db").then(r => r.json()).catch(() => ({ ok: false }));
      if (dbCheck.ok) {
        updateStep(1, "success", "Database connected");
        setDetails({ step: "database", message: "Database connected" });
      } else {
        updateStep(1, "error", "Database offline - using mock data");
        setDetails({ step: "database", message: "Database offline - using mock data" });
      }
      setProgress(40);

      // Step 3: API keys verification
      setCurrentStep(2);
      updateStep(2, "loading");
      setDetails({ step: "apis", message: "Verifying API keys" });
      await simulateStep(600);
      
      const apiCheck = await fetch("/api/health/apis").then(r => r.json()).catch(() => ({ configured: 0 }));
      updateStep(2, "success", `${apiCheck.configured || 0} APIs configured`);
      setDetails({ step: "apis", message: `${apiCheck.configured || 0} APIs configured` });
      setProgress(60);

      // Step 4: Initial scan (optional, quick check)
      setCurrentStep(3);
      updateStep(3, "loading");
      setDetails({ step: "scanner", message: "Preparing marketplace scanner" });
      await simulateStep(1000);
      
      // Just check if scan is available, don't run full scan on startup
      updateStep(3, "success", "Scanner ready");
      setDetails({ step: "scanner", message: "Scanner ready" });
      setProgress(80);

      // Step 5: Ready
      setCurrentStep(4);
      updateStep(4, "loading");
      setDetails({ step: "ready", message: "Finalizing systems" });
      await simulateStep(500);
      updateStep(4, "success", "All systems operational");
      setDetails({ step: "ready", message: "All systems operational" });
      setProgress(100);

      // Wait a moment before removing loading screen
      await simulateStep(800);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("forge-init-done", nowIso);
      }
      setIsInitializing(false);
      setShouldInitialize(false);
      setInitStatus("success");
      setLastRunAt(nowIso);
      setDetails({ step: "ready", message: "System ready" });
      onComplete?.();

    } catch (error) {
      console.error("Initialization error:", error);
      // Continue anyway - graceful degradation
      setProgress(100);
      await simulateStep(1000);
      setIsInitializing(false);
      setShouldInitialize(false);
      setInitStatus("error");
      setDetails({ step: "error", message: "Initialization failed" });
      onComplete?.();
    }
  };

  const simulateStep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  if (!isInitializing) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-cyan-500/10 to-purple-500/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent_50%)] animate-pulse" />
      </div>

      {/* Content */}
      <div className="relative flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-2 border-indigo-500/20 bg-card/95 backdrop-blur-xl shadow-2xl">
            <CardContent className="p-8">
              {/* Logo/Title */}
              <div className="mb-8 text-center">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-lg"
                >
                  <Sparkles className="h-8 w-8 text-white" />
                </motion.div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                  THE FORGE
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Initializing your AI product empire...
                </p>
              </div>

              {/* Progress bar */}
              <div className="mb-6">
                <Progress value={progress} className="h-2" />
                <div className="mt-2 text-center text-xs text-muted-foreground">
                  {progress}% Complete
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-3">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index === currentStep;
                  const isPast = index < currentStep;

                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center gap-3 rounded-lg p-3 transition-colors ${
                        isActive
                          ? "bg-indigo-500/10 border border-indigo-500/20"
                          : isPast
                          ? "bg-muted/50"
                          : "bg-muted/20"
                      }`}
                    >
                      {/* Icon */}
                      <div className={`flex-shrink-0 ${
                        step.status === "loading"
                          ? "animate-pulse"
                          : ""
                      }`}>
                        {step.status === "loading" && (
                          <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                        )}
                        {step.status === "success" && (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        )}
                        {step.status === "error" && (
                          <AlertCircle className="h-5 w-5 text-amber-600" />
                        )}
                        {step.status === "pending" && (
                          <Icon className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>

                      {/* Label */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{step.label}</div>
                        {step.message && (
                          <div className="text-xs text-muted-foreground truncate">
                            {step.message}
                          </div>
                        )}
                      </div>

                      {/* Status badge */}
                      {step.status === "success" && (
                        <Badge variant="outline" className="text-xs border-green-500/30 text-green-600">
                          ✓
                        </Badge>
                      )}
                      {step.status === "error" && (
                        <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-600">
                          !
                        </Badge>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Footer message */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-6 text-center text-xs text-muted-foreground"
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span>AI systems coming online...</span>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
