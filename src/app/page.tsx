"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { 
  Sparkles, 
  TrendingUp, 
  Palette, 
  DollarSign, 
  Users, 
  Zap,
  ArrowRight,
  CheckCircle,
  Star,
  BarChart3,
  Image as ImageIcon,
  Target
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const features = [
    {
      icon: TrendingUp,
      title: "AI Trend Analysis",
      description: "Discover trending products across Etsy, Amazon, and Shopify with advanced AI analysis.",
      color: "text-ocean-500"
    },
    {
      icon: Sparkles,
      title: "Instant Product Generation",
      description: "Generate complete product listings with descriptions, tags, and SEO optimization.",
      color: "text-flame-500"
    },
    {
      icon: Palette,
      title: "AI Design Studio",
      description: "Create stunning product mockups and designs with AI-powered image generation.",
      color: "text-gold-500"
    },
    {
      icon: DollarSign,
      title: "Revenue Optimization",
      description: "Track earnings, analyze performance, and optimize your product strategy.",
      color: "text-green-500"
    },
    {
      icon: Users,
      title: "Social Signals",
      description: "Monitor social media trends and viral content to stay ahead of the curve.",
      color: "text-purple-500"
    },
    {
      icon: Target,
      title: "Auto-Branding",
      description: "Generate complete brand kits with logos, colors, and typography for your products.",
      color: "text-pink-500"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Etsy Seller",
      content: "FoundersForge helped me discover a trending product that generated $10k in my first month!",
      rating: 5
    },
    {
      name: "Mike Rodriguez",
      role: "Amazon FBA",
      content: "The AI design studio is incredible. I can create professional mockups in minutes.",
      rating: 5
    },
    {
      name: "Emily Johnson",
      role: "Digital Entrepreneur",
      content: "The social signals feature keeps me ahead of trends. My products go viral regularly now.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-flame-gradient rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">FoundersForge</span>
          </motion.div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button asChild>
              <Link href="/dashboard">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <Badge className="mb-6 bg-flame-500 text-white">
            🚀 AI-Powered Product Creation
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-flame-gradient bg-clip-text text-transparent">
            Turn Trends Into
            <br />
            <span className="text-ocean-500">Profitable Products</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover trending products, generate complete listings, and create stunning designs with AI. 
            Launch your digital product empire in minutes, not months.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-flame-gradient hover:opacity-90 text-white" asChild>
              <Link href="/dashboard">
                Start Creating <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our AI-powered platform handles every aspect of digital product creation, 
            from trend discovery to brand generation.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "10K+", label: "Products Generated" },
              { number: "$2M+", label: "Revenue Created" },
              { number: "500+", label: "Happy Customers" },
              { number: "95%", label: "Success Rate" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="text-4xl font-bold text-flame-500 mb-2">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">What Our Customers Say</h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of successful entrepreneurs who've transformed their businesses with FoundersForge.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-gold-500 text-gold-500" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-flame-gradient py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Launch Your Product Empire?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of entrepreneurs who are already using AI to create profitable digital products.
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-flame-600 hover:bg-white/90" asChild>
              <Link href="/dashboard">
                Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-flame-gradient rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">FoundersForge</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 FoundersForge. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
