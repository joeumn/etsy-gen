"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Download, Save, Wand2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface GeneratedImage {
  id: string
  prompt: string
  imageUrl: string
  timestamp: Date
}

interface StudioCanvasProps {
  images: GeneratedImage[]
  onGenerate: (prompt: string) => void
  onSave: (imageId: string) => void
  onUseForListing: (imageId: string) => void
  isLoading?: boolean
  className?: string
}

export function StudioCanvas({
  images,
  onGenerate,
  onSave,
  onUseForListing,
  isLoading = false,
  className,
}: StudioCanvasProps) {
  const [prompt, setPrompt] = React.useState("")
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null)

  const handleGenerate = () => {
    if (prompt.trim()) {
      onGenerate(prompt.trim())
      setPrompt("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleGenerate()
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Prompt Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-ocean-500" />
              AI Design Studio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Describe your product design... (e.g., 'Modern minimalist coffee mug with geometric patterns')"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isLoading}
                  className="bg-gradient-to-r from-ocean-500 to-flame-500 hover:from-ocean-600 hover:to-flame-600"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4" />
                  )}
                  Generate
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Use descriptive prompts for better results. Try including style, colors, and specific details.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Generated Images Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {images.map((image, index) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="group"
          >
            <Card className="overflow-hidden border-0 bg-gradient-to-br from-card to-card/50 shadow-sm transition-all duration-300 group-hover:shadow-lg">
              <div className="relative">
                <img
                  src={image.imageUrl}
                  alt={image.prompt}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onSave(image.id)}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onUseForListing(image.id)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Use
                    </Button>
                  </div>
                </div>
              </div>
              <CardContent className="p-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {image.prompt}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {image.timestamp.toLocaleTimeString()}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {images.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center py-12"
        >
          <Wand2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            No designs yet
          </h3>
          <p className="text-muted-foreground">
            Start by describing your product design above
          </p>
        </motion.div>
      )}
    </div>
  )
}