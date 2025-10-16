import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/components/ui/toast";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
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
      </body>
    </html>
  );
}
