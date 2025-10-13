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
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface BrandKit {
  id: string
  brandName: string
  logoUrl?: string
  colorPalette: {
    primary: string
    secondary: string
    accent: string
    neutral: string
  }
  typography: {
    heading: string
    body: string
    accent: string
  }
  tagline: string
  createdAt: string
}

interface BrandKitModalProps {
  isOpen: boolean
  onClose: () => void
  brandKit?: BrandKit
  onDownload?: (brandKit: BrandKit) => void
}

export function BrandKitModal({
  isOpen,
  onClose,
  brandKit,
  onDownload,
}: BrandKitModalProps) {
  if (!brandKit) return null

  const handleDownload = () => {
    if (onDownload) {
      onDownload(brandKit)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-ocean-500" />
            Brand Kit: {brandKit.brandName}
          </DialogTitle>
          <DialogDescription>
            Your AI-generated brand identity package
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Logo Section */}
          {brandKit.logoUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    Logo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center p-8 bg-muted/20 rounded-lg">
                    <img
                      src={brandKit.logoUrl}
                      alt={`${brandKit.brandName} logo`}
                      className="max-h-32 max-w-full object-contain"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Color Palette */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Color Palette
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(brandKit.colorPalette).map(([name, color]) => (
                    <div key={name} className="space-y-2">
                      <div
                        className="w-full h-16 rounded-lg border shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                      <div className="text-center">
                        <p className="text-sm font-medium capitalize">{name}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {color}
                        </p>
                      </div>
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
                  <Type className="h-4 w-4" />
                  Typography
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(brandKit.typography).map(([type, font]) => (
                    <div key={type} className="space-y-2">
                      <Badge variant="outline" className="capitalize">
                        {type}
                      </Badge>
                      <p
                        className="text-lg"
                        style={{ fontFamily: font }}
                      >
                        The quick brown fox jumps over the lazy dog
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {font}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tagline */}
          {brandKit.tagline && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Tagline</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg italic text-center p-4 bg-muted/20 rounded-lg">
                    "{brandKit.tagline}"
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Download Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex justify-center pt-4"
          >
            <Button
              onClick={handleDownload}
              className="bg-gradient-flame text-white hover:opacity-90 transition-opacity"
              size="lg"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Brand Kit
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  )
}