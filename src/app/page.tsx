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

  const stats = [
    { value: "10K+", label: "Products Generated" },
    { value: "$2.4M+", label: "Revenue Tracked" },
    { value: "500+", label: "Active Users" },
    { value: "98%", label: "Success Rate" },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Digital Creator",
      content: "The Forge helped me launch 50+ products in my first month. I've already made back my investment 10x over.",
      avatar: "SC",
    },
    {
      name: "Marcus Rodriguez",
      role: "E-commerce Entrepreneur",
      content: "I went from spending 40 hours/week on product research to zero. The AI does everything while I focus on growth.",
      avatar: "MR",
    },
    {
      name: "Emily Thompson",
      role: "Passive Income Builder",
      content: "This is the closest thing to a money printer I've ever seen. Set it up once and watch the listings multiply.",
      avatar: "ET",
    },
  ];

  const howItWorks = [
    { step: "1", title: "Connect Marketplaces", description: "Link your Etsy, Shopify, or Amazon accounts in minutes" },
    { step: "2", title: "AI Discovers Trends", description: "Our AI scans thousands of products to find winning niches" },
    { step: "3", title: "Auto-Generate Products", description: "Complete products with titles, descriptions, and pricing" },
    { step: "4", title: "List & Earn", description: "Products automatically list and start generating revenue" },
  ];

  const faq = [
    { q: "Do I need any technical skills?", a: "Not at all! The Forge is designed for complete beginners. Just connect your marketplace accounts and let the AI do the work." },
    { q: "Which marketplaces are supported?", a: "Currently Etsy, Shopify, Amazon, and Gumroad. We're adding more platforms every month based on user requests." },
    { q: "How long until I see results?", a: "Most users see their first products listed within 24 hours. Revenue typically starts flowing within the first week." },
    { q: "Is there a free trial?", a: "Yes! Start free and only upgrade when you're ready to scale. No credit card required for the beta." },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Modern Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-indigo-400 to-cyan-400 rounded-full opacity-20 blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-violet-400 to-fuchsia-400 rounded-full opacity-20 blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full opacity-10 blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}} />
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition" />
                <div className="relative w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-indigo-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">{APP_CONFIG.company}</h1>
                <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">{APP_CONFIG.tagline}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <ThemeToggle />
              <Button asChild variant="outline" size="sm" className="hidden md:flex border-border/50 hover:border-border">
                <Link href="/login">
                  Sign In
                </Link>
              </Button>
              <Button asChild size="sm" className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white border-0">
                <Link href="/signup">
                  <Rocket className="h-4 w-4 mr-2" />
                  Get Started
                </Link>
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12 md:py-20 lg:py-32">
          <div className="max-w-5xl mx-auto text-center">
            {/* Beta Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 border border-indigo-500/20 rounded-full mb-8 backdrop-blur-sm"
            >
              <Zap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-semibold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">Free Beta Access • Limited Time</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 md:mb-8 leading-tight tracking-tight"
            >
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">AI-Powered Product</span>
              <br />
              <span className="text-foreground">Creation on Autopilot</span>
            </motion.h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-6 md:mb-10 max-w-3xl mx-auto leading-relaxed px-4">
              Our AI scrapes marketplaces, identifies trends, creates digital products, 
              and lists them automatically. Start building your product empire now.
            </p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4"
            >
              <Button 
                size="lg" 
                className="group relative bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white text-lg px-10 py-7 h-auto rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-0"
                asChild
              >
                <Link href="/signup">
                  <Rocket className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                  Start Building Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-10 py-7 h-auto rounded-2xl border-2 hover:bg-accent/50 backdrop-blur-sm"
                asChild
              >
                <Link href="/login">
                  Watch Demo
                  <span className="ml-2">→</span>
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-4 py-12 md:py-20">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
              How <span className="text-flame-gradient">The Forge</span> Works
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Four powerful pillars working 24/7 to build your digital product empire
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                  <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 hover:border-indigo-500/30 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl blur opacity-50" />
                      <div className="relative w-14 h-14 bg-gradient-to-br from-indigo-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">{feature.title}</h3>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card/50 backdrop-blur-sm border-2 border-flame-500/20 rounded-3xl p-6 md:p-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-center">
                What You Get with <span className="text-ocean-gradient">The Forge</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {benefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-500 flex-shrink-0" />
                    <span className="text-sm md:text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              className="bg-flame-gradient rounded-3xl p-8 md:p-12 shadow-2xl shadow-flame-500/20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              whileHover={{ scale: 1.02 }}
            >
              <motion.h2
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
              >
                Ready to Build Wealth on Autopilot?
              </motion.h2>
              <motion.p
                className="text-base md:text-xl text-white/90 mb-6 md:mb-8"
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
                  className="w-full sm:w-auto bg-white text-flame-600 hover:bg-white/90 text-base md:text-lg px-8 md:px-10 py-5 md:py-6 h-auto font-semibold"
                  asChild
                >
                  <Link href="/signup">
                    Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-4 py-12 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="text-3xl md:text-5xl font-bold text-flame-gradient mb-2">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="container mx-auto px-4 py-12 md:py-20 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                From Zero to <span className="text-ocean-gradient">Revenue</span> in 4 Steps
              </h2>
              <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
                No complex setup. No coding required. Just pure automation.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {howItWorks.map((item, index) => (
                <motion.div
                  key={item.step}
                  className="relative"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-flame-gradient rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-glow">
                      {item.step}
                    </div>
                    <h3 className="text-lg md:text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-sm md:text-base text-muted-foreground">{item.description}</p>
                  </div>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-8 -right-4 w-8 h-0.5 bg-gradient-to-r from-flame-500 to-ocean-500" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                What Our <span className="text-flame-gradient">Users</span> Say
              </h2>
              <p className="text-base md:text-xl text-muted-foreground">
                Join hundreds of entrepreneurs building wealth with The Forge
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  className="bg-card border-2 border-border hover:border-flame-500/30 rounded-2xl p-6 md:p-8 transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-ocean-gradient rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-bold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                  <p className="text-sm md:text-base text-muted-foreground italic">
                    "{testimonial.content}"
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto px-4 py-12 md:py-20 bg-muted/20">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Frequently Asked <span className="text-ocean-gradient">Questions</span>
              </h2>
            </div>
            <div className="space-y-4">
              {faq.map((item, index) => (
                <motion.div
                  key={index}
                  className="bg-card border border-border rounded-xl p-6 hover:border-flame-500/30 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <h3 className="font-bold text-lg mb-2">{item.q}</h3>
                  <p className="text-muted-foreground">{item.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t bg-background/50 backdrop-blur-sm py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-flame-gradient rounded-xl flex items-center justify-center">
                  <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-white" />
                </div>
                <div className="text-center md:text-left">
                  <p className="text-lg md:text-xl font-bold">{APP_CONFIG.company}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">{APP_CONFIG.tagline}</p>
                </div>
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">
                © 2025 {APP_CONFIG.company}. Private Beta.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
