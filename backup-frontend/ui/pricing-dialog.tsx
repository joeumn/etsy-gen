"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Zap, Crown, Building } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingTier {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  limitations: string[];
  icon: React.ComponentType<{ className?: string }>;
  popular?: boolean;
  buttonText: string;
  buttonVariant: "default" | "secondary" | "outline";
}

interface PricingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (planId: string) => void;
  currentPlan?: string;
  className?: string;
}

const pricingTiers: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "forever",
    description: "Perfect for getting started",
    icon: Zap,
    features: [
      "10 monthly scans",
      "5 product generations",
      "Basic analytics",
      "Community support",
    ],
    limitations: [
      "No AI design studio",
      "No social signals",
      "No brand generation",
    ],
    buttonText: "Current Plan",
    buttonVariant: "outline",
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    period: "month",
    description: "For serious entrepreneurs",
    icon: Crown,
    popular: true,
    features: [
      "100 monthly scans",
      "50 product generations",
      "AI design studio access",
      "Social trend analysis",
      "Brand generation (5/month)",
      "Advanced analytics",
      "Priority support",
    ],
    limitations: [],
    buttonText: "Upgrade to Pro",
    buttonVariant: "default",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 99,
    period: "month",
    description: "For agencies and teams",
    icon: Building,
    features: [
      "Unlimited scans",
      "Unlimited generations",
      "All AI features",
      "Team collaboration",
      "API access",
      "Custom integrations",
      "Dedicated support",
    ],
    limitations: [],
    buttonText: "Contact Sales",
    buttonVariant: "secondary",
  },
];

export function PricingDialog({
  isOpen,
  onClose,
  onSelectPlan,
  currentPlan = "free",
  className,
}: PricingDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold">
                Choose Your Plan
              </DialogTitle>
              <p className="text-center text-muted-foreground">
                Unlock the full potential of AI-powered product creation
              </p>
            </DialogHeader>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6"
            >
              {pricingTiers.map((tier, index) => (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="relative"
                >
                  {tier.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-flame-500 text-white">
                      Most Popular
                    </Badge>
                  )}
                  <Card
                    className={cn(
                      "h-full transition-all duration-300 hover:shadow-lg",
                      tier.popular && "ring-2 ring-flame-500 shadow-lg",
                      currentPlan === tier.id && "ring-2 ring-ocean-500"
                    )}
                  >
                    <CardHeader className="text-center">
                      <div className="mx-auto mb-4 p-3 rounded-full bg-ocean-100 dark:bg-ocean-900">
                        <tier.icon className="h-8 w-8 text-ocean-600 dark:text-ocean-400" />
                      </div>
                      <CardTitle className="text-xl">{tier.name}</CardTitle>
                      <div className="mt-2">
                        <span className="text-4xl font-bold">
                          ${tier.price}
                        </span>
                        <span className="text-muted-foreground">
                          /{tier.period}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {tier.description}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {tier.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                        {tier.limitations.map((limitation, limitationIndex) => (
                          <div key={limitationIndex} className="flex items-center gap-2">
                            <X className="h-4 w-4 text-red-500 flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">
                              {limitation}
                            </span>
                          </div>
                        ))}
                      </div>
                      <Button
                        className={cn(
                          "w-full",
                          tier.popular && "bg-flame-500 hover:bg-flame-600",
                          currentPlan === tier.id && "bg-ocean-500 hover:bg-ocean-600"
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
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}