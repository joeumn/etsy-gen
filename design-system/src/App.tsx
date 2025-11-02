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

function AppContent() {
  const { open, setOpen } = useCommandPalette();

  return (
    <>
      <CommandPalette open={open} onOpenChange={setOpen} />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/trends" element={<TrendsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/marketplaces" element={<MarketplacesPage />} />
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
