import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./lib/theme-context";
import { Toaster } from "./components/ui/sonner";
import { LoginPage } from "./pages/login";
import { DashboardPage } from "./pages/dashboard";
import { TrendsPage } from "./pages/trends";
import { AnalyticsPage } from "./pages/analytics";
import { ProductsPage } from "./pages/products";
import { MarketplacesPage } from "./pages/marketplaces";
import { SettingsPage } from "./pages/settings";
import { NotFoundPage } from "./pages/404";
import { ErrorPage } from "./pages/500";
import { CommandPalette, useCommandPalette } from "./components/command-palette";
import { AppLayout } from "./components/layout/app-layout";
import { NetworkStatusPage } from "./pages/network-status";
import { PredictStudioPage } from "./pages/predict-studio";

function AppContent() {
  const { open, setOpen } = useCommandPalette();

  return (
    <>
      <CommandPalette open={open} onOpenChange={setOpen} />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<AppLayout><DashboardPage /></AppLayout>} />
        <Route path="/trends" element={<AppLayout><TrendsPage /></AppLayout>} />
        <Route path="/analytics" element={<AppLayout><AnalyticsPage /></AppLayout>} />
        <Route path="/products" element={<AppLayout><ProductsPage /></AppLayout>} />
        <Route path="/marketplaces" element={<AppLayout><MarketplacesPage /></AppLayout>} />
        <Route path="/predict-studio" element={<AppLayout><PredictStudioPage /></AppLayout>} />
        <Route path="/network-status" element={<AppLayout><NetworkStatusPage /></AppLayout>} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen">
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
}
