"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Check, Zap, Crown, Star } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

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

interface PricingDialogProps {
  isOpen: boolean
  onClose: () => void
  onSelectPlan: (planId: string) => void
  currentPlan?: string
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
    buttonText: "Current Plan",
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

export function PricingDialog({
  isOpen,
  onClose,
  onSelectPlan,
  currentPlan = "free",
}: PricingDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <DialogTitle className="text-3xl font-bold bg-gradient-flame bg-clip-text text-transparent">
            Choose Your Plan
          </DialogTitle>
          <DialogDescription className="text-lg">
            Unlock the full potential of AI-powered product creation
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-flame text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              <Card
                className={cn(
                  "relative h-full transition-all duration-300 hover:shadow-lg",
                  tier.popular && "ring-2 ring-ocean-500 shadow-lg",
                  currentPlan === tier.id && "ring-2 ring-gold-500"
                )}
              >
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div
                      className={cn(
                        "p-3 rounded-full",
                        tier.popular
                          ? "bg-gradient-flame text-white"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {tier.icon}
                    </div>
                  </div>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">
                      ${tier.price}
                    </span>
                    <span className="text-muted-foreground">/{tier.period}</span>
                  </div>
                  <p className="text-muted-foreground mt-2">
                    {tier.description}
                  </p>
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
                    className={cn(
                      "w-full mt-6",
                      tier.popular && "bg-gradient-flame text-white hover:opacity-90",
                      currentPlan === tier.id && "bg-gold-500 text-white hover:bg-gold-600"
                    )}
                    variant={tier.buttonVariant}
                    onClick={() => onSelectPlan(tier.id)}
                    disabled={currentPlan === tier.id}
                  >
                    {currentPlan === tier.id ? "Current Plan" : tier.buttonText}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            All plans include a 14-day free trial. Cancel anytime.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}