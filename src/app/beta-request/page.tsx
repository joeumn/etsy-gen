"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Mail, User, MessageSquare, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_CONFIG } from "@/lib/config";

export default function BetaRequestPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ocean-50 via-background to-flame-50 dark:from-background dark:via-background dark:to-background p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-4">Request Received!</h2>
          <p className="text-muted-foreground mb-8">
            Thank you for your interest in The Forge. We&apos;ll review your request and get back to you soon.
          </p>
          <Button asChild>
            <Link href="/">
              Back to Home
            </Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ocean-50 via-background to-flame-50 dark:from-background dark:via-background dark:to-background p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-ocean-400/20 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-flame-400/20 rounded-full blur-3xl opacity-60" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 bg-flame-gradient rounded-xl flex items-center justify-center shadow-glow">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <span className="text-3xl font-bold text-forge-gradient">{APP_CONFIG.company}</span>
        </div>

        <Card className="shadow-2xl border-2">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Request Beta Access</CardTitle>
            <CardDescription>
              Join the exclusive beta for The Forge
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Why do you want beta access? (Optional)
                </Label>
                <textarea
                  id="message"
                  placeholder="Tell us about your use case..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full h-32 px-3 py-2 border rounded-md resize-none bg-background"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-flame-gradient hover:opacity-90 text-white text-base font-semibold"
              >
                {isSubmitting ? (
                  "Submitting..."
                ) : (
                  <>
                    Submit Request
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have access?{" "}
                <Link
                  href="/auth/login"
                  className="text-ocean-500 hover:text-ocean-600 font-semibold"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}

