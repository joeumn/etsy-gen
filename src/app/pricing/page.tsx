"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { PricingDialog } from "@/components/ui/pricing-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Zap, Crown, Building, ArrowLeft } from "lucide-react"
import Link from "next/link"

const pricingTiers = [
  {
    name: "Free",
    price: 0,
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "10 trend scans per month",
      "5 product generations",
      "Basic analytics",
      "Etsy integration",
      "Email support",
    ],
    icon: <Zap className="h-6 w-6" />,
    cta: "Get Started",
  },
  {
    name: "Pro",
    price: 29,
    period: "month",
    description: "For serious entrepreneurs",
    features: [
      "Unlimited trend scans",
      "Unlimited generations",
      "AI Design Studio access",
      "Social signal analysis",
      "Auto-branding AI",
      "All marketplace integrations",
      "Priority support",
      "Advanced analytics",
    ],
    icon: <Crown className="h-6 w-6" />,
    popular: true,
    cta: "Start Free Trial",
  },
  {
    name: "Enterprise",
    price: 99,
    period: "month",
    description: "For agencies and teams",
    features: [
      "Everything in Pro",
      "Team collaboration",
      "White-label options",
      "Custom integrations",
      "Dedicated account manager",
      "Custom AI training",
      "SLA guarantee",
    ],
    icon: <Building className="h-6 w-6" />,
    cta: "Contact Sales",
  },
]

export default function PricingPage() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSelectPlan = async (priceId: string) => {
    setIsLoading(true)
    try {
      // Redirect to Stripe checkout
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: 'current-user-id', // Replace with actual user ID
          userEmail: 'user@example.com', // Replace with actual user email
          userName: 'User Name', // Replace with actual user name
        }),
      })

      const data = await response.json()
      
      if (data.success && data.url) {
        window.location.href = data.url
      } else {
        console.error('Failed to create checkout session:', data.error)
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-ocean-500 to-flame-500 bg-clip-text text-transparent mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock the full potential of AI-powered product creation and trend analysis
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="relative"
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-ocean-500 to-flame-500 text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}
              
              <Card className={`relative overflow-hidden transition-all duration-300 ${
                tier.popular 
                  ? "bg-gradient-to-br from-ocean-500/10 to-flame-500/10 shadow-xl shadow-ocean-500/20 border-ocean-500/20" 
                  : "bg-gradient-to-br from-card to-card/50 shadow-sm hover:shadow-lg"
              }`}>
                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                    tier.popular 
                      ? "bg-gradient-to-r from-ocean-500 to-flame-500 text-white" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {tier.icon}
                  </div>
                  <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-5xl font-bold">${tier.price}</span>
                    <span className="text-muted-foreground text-lg">/{tier.period}</span>
                  </div>
                  <p className="text-muted-foreground mt-2">{tier.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <ul className="space-y-4">
                    {tier.features.map((feature, featureIndex) => (
                      <motion.li
                        key={featureIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 + featureIndex * 0.05 }}
                        className="flex items-center gap-3"
                      >
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                  
                  <Button
                    className={`w-full mt-6 h-12 text-base ${
                      tier.popular
                        ? "bg-gradient-to-r from-ocean-500 to-flame-500 hover:from-ocean-600 hover:to-flame-600 text-white"
                        : "bg-muted hover:bg-muted/80 text-muted-foreground"
                    }`}
                    onClick={() => setIsDialogOpen(true)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
                    ) : (
                      tier.cta
                    )}
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
          className="mt-20 max-w-4xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I change plans anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is there a free trial?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  All paid plans include a 14-day free trial. No credit card required to start.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We accept all major credit cards through Stripe, including Visa, Mastercard, and American Express.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Absolutely! You can cancel your subscription at any time. No long-term contracts or hidden fees.
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
          className="text-center mt-20"
        >
          <Card className="bg-gradient-to-r from-ocean-500/10 to-flame-500/10 border-ocean-500/20">
            <CardContent className="py-12">
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of entrepreneurs who are already using AI to create and sell digital products.
              </p>
              <Button
                size="lg"
                className="bg-gradient-to-r from-ocean-500 to-flame-500 hover:from-ocean-600 hover:to-flame-600 text-white text-lg px-8 py-3"
                onClick={() => setIsDialogOpen(true)}
              >
                Start Your Free Trial
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <PricingDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSelectPlan={handleSelectPlan}
        isLoading={isLoading}
      />
    </div>
  )
}