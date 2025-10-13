"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { PricingDialog } from "@/components/ui/pricing-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Zap, Crown, Star, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface PricingTier {
  id: string
  name: string
  price: number
  period: string
  description: string
  features: string[]
  popular?: boolean
  icon: React.ReactNode
  buttonText: string
  buttonVariant: "default" | "outline" | "secondary"
}

const pricingTiers: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "10 trend scans per month",
      "5 AI generations per month",
      "Basic analytics",
      "Etsy integration",
      "Email support",
    ],
    icon: <Zap className="h-6 w-6" />,
    buttonText: "Get Started",
    buttonVariant: "outline",
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    period: "month",
    description: "For serious entrepreneurs",
    features: [
      "Unlimited trend scans",
      "Unlimited AI generations",
      "AI Design Studio access",
      "Social signal analysis",
      "Auto-branding features",
      "All marketplace integrations",
      "Priority support",
      "Advanced analytics",
    ],
    popular: true,
    icon: <Crown className="h-6 w-6" />,
    buttonText: "Upgrade to Pro",
    buttonVariant: "default",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 99,
    period: "month",
    description: "For teams and agencies",
    features: [
      "Everything in Pro",
      "Team collaboration",
      "White-label options",
      "Custom integrations",
      "Dedicated support",
      "Custom AI training",
      "API access",
      "SLA guarantee",
    ],
    icon: <Star className="h-6 w-6" />,
    buttonText: "Contact Sales",
    buttonVariant: "outline",
  },
]

export default function PricingPage() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [selectedPlan, setSelectedPlan] = React.useState<string | null>(null)
  const [currentPlan] = React.useState("free") // In real app, get from user data

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId)
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setSelectedPlan(null)
  }

  const handleConfirmPlan = (planId: string) => {
    // In a real implementation, redirect to Stripe checkout
    console.log('Selected plan:', planId)
    setIsDialogOpen(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="mr-4">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <Badge className="bg-gradient-flame text-white">
              Zig 4 - Monetization
            </Badge>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-flame bg-clip-text text-transparent mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock the full potential of AI-powered product creation with our flexible pricing plans
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-flame text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              <Card
                className={`relative h-full transition-all duration-300 hover:shadow-lg ${
                  tier.popular ? 'ring-2 ring-ocean-500 shadow-lg' : ''
                } ${currentPlan === tier.id ? 'ring-2 ring-gold-500' : ''}`}
              >
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div
                      className={`p-3 rounded-full ${
                        tier.popular
                          ? 'bg-gradient-flame text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {tier.icon}
                    </div>
                  </div>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${tier.price}</span>
                    <span className="text-muted-foreground">/{tier.period}</span>
                  </div>
                  <p className="text-muted-foreground mt-2">{tier.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {tier.features.map((feature, featureIndex) => (
                      <motion.li
                        key={featureIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.3,
                          delay: index * 0.1 + featureIndex * 0.05,
                        }}
                        className="flex items-center gap-3"
                      >
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full mt-6 ${
                      tier.popular
                        ? 'bg-gradient-flame text-white hover:opacity-90'
                        : currentPlan === tier.id
                        ? 'bg-gold-500 text-white hover:bg-gold-600'
                        : ''
                    }`}
                    variant={tier.buttonVariant}
                    onClick={() => handleSelectPlan(tier.id)}
                    disabled={currentPlan === tier.id}
                  >
                    {currentPlan === tier.id ? 'Current Plan' : tier.buttonText}
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
          className="mt-16 max-w-4xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I change plans anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is there a free trial?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  All paid plans come with a 14-day free trial. No credit card required to start.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We accept all major credit cards through our secure Stripe payment processor.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-ocean-500/10 to-flame-500/10 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-muted-foreground mb-6">
              Join thousands of entrepreneurs who are already using AI to create successful products.
            </p>
            <Button
              size="lg"
              className="bg-gradient-flame text-white hover:opacity-90"
              onClick={() => handleSelectPlan('pro')}
            >
              Start Your Free Trial
            </Button>
          </div>
        </motion.div>
      </div>

      <PricingDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        onSelectPlan={handleConfirmPlan}
        currentPlan={currentPlan}
      />
    </div>
  )
}