"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { 
  Sparkles, 
  Zap,
  ArrowRight,
  Bot,
  ShoppingCart,
  Rocket,
  CheckCircle,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { APP_CONFIG } from "@/lib/config";

export default function Home() {
  const features = [
    {
      icon: Bot,
      title: "AI Market Intelligence",
      description: "Our AI scrapes Etsy, Shopify, Amazon, and Gumroad to identify high-profit digital products before they saturate.",
    },
    {
      icon: Sparkles,
      title: "Autonomous Product Creation",
      description: "Generate complete products — titles, descriptions, mockups, and pricing — all optimized for maximum conversion.",
    },
    {
      icon: ShoppingCart,
      title: "Automated Listing",
      description: "Products are automatically listed across your connected marketplaces. Set it and forget it.",
    },
    {
      icon: TrendingUp,
      title: "Revenue Analytics",
      description: "Real-time dashboards track sales, impressions, and profit. Know exactly what's working.",
    },
  ];

  const benefits = [
    "Zero manual product research",
    "Automated marketplace listing",
    "AI-powered pricing optimization",
    "Real-time revenue analytics",
    "Multi-platform synchronization",
    "Trend prediction algorithms",
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1C463C] via-background to-background">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-flame-500/10 rounded-full blur-3xl opacity-40" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-ocean-500/10 rounded-full blur-3xl opacity-40" />
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="border-b bg-background/80 backdrop-blur-xl">
          <div className="container mx-auto px-4 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-flame-gradient rounded-xl flex items-center justify-center shadow-glow">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{APP_CONFIG.company}</h1>
                <p className="text-xs text-muted-foreground">{APP_CONFIG.tagline}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button asChild variant="outline" size="sm" className="hidden md:flex">
                <Link href="/dashboard">
                  <Rocket className="h-4 w-4 mr-2" />
                  Open Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-5xl mx-auto text-center">
            {/* Beta Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-flame-500/10 border border-flame-500/20 rounded-full mb-6">
              <Zap className="h-4 w-4 text-flame-500" />
              <span className="text-sm font-semibold text-flame-500">Free & Open Access</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6">
              <span className="text-forge-gradient">The Forge</span>
              <br />
              <span className="text-foreground">AI That Builds</span>
              <br />
              <span className="text-foreground">Wealth for You</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
              Our AI scrapes marketplaces, identifies trends, creates digital products, 
              and lists them automatically. Start building your product empire now.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-flame-gradient hover:shadow-glow text-white text-lg px-8 py-6 h-auto"
                asChild
              >
                <Link href="/dashboard">
                  <Rocket className="mr-2 h-5 w-5" />
                  Launch Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How <span className="text-flame-gradient">The Forge</span> Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Four powerful pillars working 24/7 to build your digital product empire
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-flame-500/5 to-ocean-500/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                  <div className="relative bg-card/80 backdrop-blur-sm border-2 border-border hover:border-flame-500/30 rounded-2xl p-8 transition-all duration-300 card-hover">
                    <div className="w-14 h-14 bg-flame-gradient rounded-xl flex items-center justify-center mb-6 shadow-glow-sm">
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card/50 backdrop-blur-sm border-2 border-flame-500/20 rounded-3xl p-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
                What You Get with <span className="text-ocean-gradient">The Forge</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {benefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                    <span className="text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              className="bg-flame-gradient rounded-3xl p-12 shadow-2xl shadow-flame-500/20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              whileHover={{ scale: 1.02 }}
            >
              <motion.h2
                className="text-4xl md:text-5xl font-bold text-white mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
              >
                Ready to Build Wealth on Autopilot?
              </motion.h2>
              <motion.p
                className="text-xl text-white/90 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
              >
                Launch The Forge and let AI create your product empire.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.1 }}
              >
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-flame-600 hover:bg-white/90 text-lg px-10 py-6 h-auto font-semibold"
                  asChild
                >
                  <Link href="/dashboard">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t bg-background/50 backdrop-blur-sm py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-flame-gradient rounded-xl flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xl font-bold">{APP_CONFIG.company}</p>
                  <p className="text-sm text-muted-foreground">{APP_CONFIG.tagline}</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                © 2025 {APP_CONFIG.company}. Free & Open Access.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
