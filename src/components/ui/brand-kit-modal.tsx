"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Download, Palette, Type, Sparkles } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface BrandKit {
  name: string
  logo: string
  colorPalette: Array<{
    name: string
    value: string
    hex: string
  }>
  typography: {
    primary: string
    secondary: string
  }
  tagline: string
  brandKitUrl?: string
}

interface BrandKitModalProps {
  isOpen: boolean
  onClose: () => void
  brandKit?: BrandKit
  isLoading?: boolean
}

export function BrandKitModal({ isOpen, onClose, brandKit, isLoading }: BrandKitModalProps) {
  const handleDownload = () => {
    if (brandKit?.brandKitUrl) {
      window.open(brandKit.brandKitUrl, '_blank')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-ocean-500" />
            AI-Generated Brand Kit
          </DialogTitle>
          <DialogDescription>
            Your personalized brand identity created by AI
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-500"></div>
          </div>
        ) : brandKit ? (
          <div className="space-y-6">
            {/* Brand Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">{brandKit.name}</CardTitle>
                  <p className="text-muted-foreground italic">"{brandKit.tagline}"</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center p-8 bg-muted/20 rounded-lg">
                    <img
                      src={brandKit.logo}
                      alt={`${brandKit.name} logo`}
                      className="max-h-32 max-w-32 object-contain"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Color Palette */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-flame-500" />
                    Color Palette
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {brandKit.colorPalette.map((color, index) => (
                      <div key={index} className="text-center">
                        <div
                          className="w-full h-16 rounded-lg mb-2 border"
                          style={{ backgroundColor: color.hex }}
                        />
                        <p className="text-sm font-medium">{color.name}</p>
                        <p className="text-xs text-muted-foreground">{color.hex}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Typography */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="h-5 w-5 text-gold-500" />
                    Typography
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Primary Font</p>
                      <p className="text-2xl font-bold" style={{ fontFamily: brandKit.typography.primary }}>
                        {brandKit.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Secondary Font</p>
                      <p className="text-lg" style={{ fontFamily: brandKit.typography.secondary }}>
                        {brandKit.tagline}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Download Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex justify-center"
            >
              <Button
                onClick={handleDownload}
                size="lg"
                className="bg-gradient-to-r from-ocean-500 to-flame-500 hover:from-ocean-600 hover:to-flame-600 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Brand Kit
              </Button>
            </motion.div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}