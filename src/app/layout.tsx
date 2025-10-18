import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/components/ui/toast";
import { Providers } from "@/components/providers";
import "./globals.css";

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
      <body className="antialiased">
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ToastProvider>
              {children}
            </ToastProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
