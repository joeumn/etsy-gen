"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { 
  Sparkles, 
  ArrowLeft,
  Check,
  X,
  Zap,
  Crown,
  Building,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  const pricingTiers = [
    {
      id: "free",
      name: "Free",
      price: 0,
      yearlyPrice: 0,
      period: "forever",
      description: "Perfect for getting started",
      icon: Zap,
      features: [
        "10 monthly scans",
        "5 product generations",
        "Basic analytics",
        "Community support",
        "Etsy integration",
      ],
      limitations: [
        "No AI design studio",
        "No social signals",
        "No brand generation",
        "No priority support",
      ],
      buttonText: "Get Started Free",
      buttonVariant: "outline" as const,
      popular: false,
    },
    {
      id: "pro",
      name: "Pro",
      price: 29,
      yearlyPrice: 290,
      period: "month",
      description: "For serious entrepreneurs",
      icon: Crown,
      features: [
        "100 monthly scans",
        "50 product generations",
        "AI design studio access",
        "Social trend analysis",
        "Brand generation (5/month)",
        "Advanced analytics",
        "Priority support",
        "All marketplace integrations",
        "API access",
      ],
      limitations: [],
      buttonText: "Start Pro Trial",
      buttonVariant: "default" as const,
      popular: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: 99,
      yearlyPrice: 990,
      period: "month",
      description: "For agencies and teams",
      icon: Building,
      features: [
        "Unlimited scans",
        "Unlimited generations",
        "All AI features",
        "Team collaboration",
        "Custom integrations",
        "White-label options",
        "Dedicated support",
        "Custom training",
        "SLA guarantee",
      ],
      limitations: [],
      buttonText: "Contact Sales",
      buttonVariant: "secondary" as const,
      popular: false,
    },
  ];

  const faqs = [
    {
      question: "Can I change plans anytime?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences."
    },
    {
      question: "What happens to my data if I cancel?",
      answer: "Your data is safe. You can export all your products and analytics before canceling. We keep your data for 30 days after cancellation in case you want to reactivate."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 14-day money-back guarantee for all paid plans. If you're not satisfied, contact us for a full refund."
    },
    {
      question: "Can I use my own AI models?",
      answer: "Enterprise customers can integrate their own AI models through our API. Contact sales to learn more about custom integrations."
    },
    {
      question: "Is there a free trial?",
      answer: "Yes! Pro plan comes with a 14-day free trial. No credit card required to start."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and bank transfers for Enterprise plans. All payments are processed securely through Stripe."
    }
  ];

  const handleSelectPlan = (planId: string) => {
    console.log("Selected plan:", planId);
    // In real app, this would redirect to Stripe checkout
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
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

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-flame-gradient bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Choose the plan that fits your business. Start free and scale as you grow.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={billingPeriod === "monthly" ? "font-semibold" : "text-muted-foreground"}>
              Monthly
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "yearly" : "monthly")}
              className="relative"
            >
              <div className={`absolute left-1 top-1 w-6 h-6 bg-ocean-500 rounded-full transition-transform duration-200 ${
                billingPeriod === "yearly" ? "translate-x-6" : "translate-x-0"
              }`} />
            </Button>
            <span className={billingPeriod === "yearly" ? "font-semibold" : "text-muted-foreground"}>
              Yearly
            </span>
            {billingPeriod === "yearly" && (
              <Badge className="bg-green-500 text-white">Save 20%</Badge>
            )}
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {tier.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-flame-500 text-white z-10">
                  Most Popular
                </Badge>
              )}
              <Card
                className={`h-full transition-all duration-300 hover:shadow-lg ${
                  tier.popular ? "ring-2 ring-flame-500 shadow-lg scale-105" : ""
                }`}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 rounded-full bg-ocean-100 dark:bg-ocean-900">
                    <tier.icon className="h-8 w-8 text-ocean-600 dark:text-ocean-400" />
                  </div>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">
                      ${billingPeriod === "yearly" ? tier.yearlyPrice : tier.price}
                    </span>
                    <span className="text-muted-foreground">
                      /{tier.period}
                    </span>
                    {billingPeriod === "yearly" && tier.price > 0 && (
                      <div className="text-sm text-green-600 font-semibold mt-1">
                        Save ${(tier.price * 12) - tier.yearlyPrice}/year
                      </div>
                    )}
                  </div>
                  <p className="text-muted-foreground mt-2">{tier.description}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {tier.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-3">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                    {tier.limitations.map((limitation, limitationIndex) => (
                      <div key={limitationIndex} className="flex items-center gap-3">
                        <X className="h-4 w-4 text-red-500 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{limitation}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    className={`w-full ${
                      tier.popular 
                        ? "bg-flame-500 hover:bg-flame-600" 
                        : tier.id === "free"
                        ? "bg-ocean-500 hover:bg-ocean-600"
                        : ""
                    }`}
                    variant={tier.buttonVariant}
                    onClick={() => handleSelectPlan(tier.id)}
                  >
                    {tier.buttonText}
                    {tier.id !== "enterprise" && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center"
        >
          <Card className="bg-flame-gradient text-white">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold mb-4">Ready to Start Creating?</h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of entrepreneurs who are already using AI to create profitable digital products.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="bg-white text-flame-600 hover:bg-white/90">
                  Start Free Trial
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Contact Sales
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}