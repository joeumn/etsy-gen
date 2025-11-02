"use client";

import { createContext, useContext, useMemo, useState } from "react";

export type InitializationStatus = "idle" | "running" | "success" | "error";

interface InitializationDetails {
  step: string;
  message?: string;
}

interface InitializationContextValue {
  status: InitializationStatus;
  details?: InitializationDetails;
  lastRunAt?: string;
  setStatus: (status: InitializationStatus) => void;
  setDetails: (details?: InitializationDetails) => void;
  setLastRunAt: (isoDate?: string) => void;
}

const InitializationContext = createContext<InitializationContextValue | null>(null);

export function InitializationProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<InitializationStatus>("idle");
  const [details, setDetails] = useState<InitializationDetails>();
  const [lastRunAt, setLastRunAt] = useState<string>();

  const value = useMemo<InitializationContextValue>(
    () => ({ status, details, lastRunAt, setStatus, setDetails, setLastRunAt }),
    [status, details, lastRunAt],
  );

  return <InitializationContext.Provider value={value}>{children}</InitializationContext.Provider>;
}

export function useInitialization() {
  const context = useContext(InitializationContext);
  if (!context) {
    throw new Error("useInitialization must be used within InitializationProvider");
  }
  return context;
}
