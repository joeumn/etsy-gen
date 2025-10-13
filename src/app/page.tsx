"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, TrendingUp, Palette, Zap, Shield, Star } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-flame-gradient"></div>
            <span className="text-xl font-bold">FoundersForge</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/pricing">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-4xl"
        >
          <div className="mb-8 flex justify-center">
            <div className="inline-flex items-center rounded-full border bg-muted/50 px-4 py-2 text-sm">
              <Sparkles className="mr-2 h-4 w-4 text-flame-500" />
              AI-Powered Product Creation
            </div>
          </div>
          
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
            Turn Trends Into
            <span className="bg-gradient-to-r from-ocean-500 via-flame-500 to-gold-500 bg-clip-text text-transparent">
              {" "}Profitable Products
            </span>
          </h1>
          
          <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
            Discover trending products, generate AI-powered designs, and launch your digital empire 
            across multiple marketplaces with our all-in-one platform.
          </p>
          
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="bg-flame-gradient hover:opacity-90">
                Start Creating
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline">
                View Pricing
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything You Need to Succeed
          </h2>
          <p className="text-lg text-muted-foreground">
            From trend discovery to product launch, we've got you covered.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-flame-gradient">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="container py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="rounded-2xl bg-gradient-to-r from-ocean-500/10 via-flame-500/10 to-gold-500/10 p-8"
        >
          <div className="grid gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-flame-500">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="container py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="rounded-2xl bg-gradient-to-r from-ocean-500 to-flame-500 p-12 text-center text-white"
        >
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
            Ready to Launch Your First Product?
          </h2>
          <p className="mb-8 text-lg opacity-90">
            Join thousands of entrepreneurs who are already building their digital empires.
          </p>
          <Link href="/dashboard">
            <Button size="lg" variant="secondary" className="bg-white text-ocean-500 hover:bg-white/90">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-flame-gradient"></div>
                <span className="text-xl font-bold">FoundersForge</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The ultimate platform for AI-powered product creation and marketplace success.
              </p>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
                <li><Link href="/studio" className="hover:text-foreground">AI Studio</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/help" className="hover:text-foreground">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
                <li><Link href="/docs" className="hover:text-foreground">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground">About</Link></li>
                <li><Link href="/blog" className="hover:text-foreground">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-foreground">Careers</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            © 2024 FoundersForge. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    title: "AI Trend Analysis",
    description: "Discover trending products across Etsy, Amazon, and Shopify with our advanced AI algorithms.",
    icon: TrendingUp,
  },
  {
    title: "Design Studio",
    description: "Generate stunning product mockups and designs using cutting-edge AI image generation.",
    icon: Palette,
  },
  {
    title: "Auto-Listing",
    description: "Automatically create optimized listings across multiple marketplaces with one click.",
    icon: Zap,
  },
  {
    title: "Social Signals",
    description: "Track viral trends on TikTok, Pinterest, and Instagram to stay ahead of the competition.",
    icon: Star,
  },
  {
    title: "Auto-Branding",
    description: "Generate complete brand kits with logos, colors, and typography for your product lines.",
    icon: Shield,
  },
  {
    title: "Analytics Dashboard",
    description: "Track your performance with detailed analytics and revenue insights.",
    icon: TrendingUp,
  },
];

const stats = [
  { value: "10K+", label: "Products Generated" },
  { value: "500+", label: "Active Users" },
  { value: "$2M+", label: "Revenue Generated" },
  { value: "95%", label: "Success Rate" },
];
