import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/components/ui/toast";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import { AppInitializer } from "@/components/app-initializer";
import { InitializationProvider } from "@/components/initialization-context";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FoundersForge - AI-Powered Product Creation Platform",
  description: "Transform trending data into profitable digital products using AI. Discover trends, generate listings, create designs, and automate your entire product business.",
  keywords: "AI, product creation, digital products, Etsy, Amazon, Shopify, automation, trending products",
  authors: [{ name: "FoundersForge Team" }],
  openGraph: {
    title: "FoundersForge - AI-Powered Product Creation",
    description: "Turn trends into profitable products with AI",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AppInitializer>
              <InitializationProvider>
                <ToastProvider>
                  {children}
                </ToastProvider>
                <Toaster richColors position="top-right" />
              </InitializationProvider>
            </AppInitializer>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
