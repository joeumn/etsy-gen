"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { StudioCanvas } from "@/components/ui/studio-canvas"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"

interface GeneratedImage {
  id: string
  prompt: string
  imageUrl: string
  timestamp: Date
}

export default function StudioPage() {
  const [images, setImages] = React.useState<GeneratedImage[]>([])
  const [isLoading, setIsLoading] = React.useState(false)

  const handleGenerate = async (prompt: string) => {
    setIsLoading(true)
    try {
      // Mock image generation - replace with actual API call
      const mockImage: GeneratedImage = {
        id: Date.now().toString(),
        prompt,
        imageUrl: `https://picsum.photos/400/300?random=${Date.now()}`,
        timestamp: new Date(),
      }
      
      setImages(prev => [mockImage, ...prev])
    } catch (error) {
      console.error('Error generating image:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (imageId: string) => {
    try {
      // Save to Supabase Storage
      console.log('Saving image:', imageId)
      // Implement actual save logic
    } catch (error) {
      console.error('Error saving image:', error)
    }
  }

  const handleUseForListing = async (imageId: string) => {
    try {
      // Use image for product listing
      console.log('Using image for listing:', imageId)
      // Implement actual use logic
    } catch (error) {
      console.error('Error using image:', error)
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
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-ocean-500" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-ocean-500 to-flame-500 bg-clip-text text-transparent">
                AI Design Studio
              </h1>
            </div>
          </div>
          
          <Card className="border-0 bg-gradient-to-r from-ocean-500/10 to-flame-500/10">
            <CardHeader>
              <CardTitle className="text-xl">Create Stunning Product Images</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Generate professional product mockups and designs using AI. Perfect for your Etsy listings, 
                social media, and marketing materials.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Studio Canvas */}
        <StudioCanvas
          images={images}
          onGenerate={handleGenerate}
          onSave={handleSave}
          onUseForListing={handleUseForListing}
          isLoading={isLoading}
        />

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pro Tips for Better Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-ocean-500">Be Specific</h4>
                  <p className="text-sm text-muted-foreground">
                    Include details like style, colors, materials, and setting for more accurate results.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-flame-500">Use Keywords</h4>
                  <p className="text-sm text-muted-foreground">
                    Add relevant keywords like "modern", "vintage", "minimalist" to guide the AI.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gold-500">Consider Context</h4>
                  <p className="text-sm text-muted-foreground">
                    Think about where the image will be used - social media, product listing, etc.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-ocean-500">Iterate and Refine</h4>
                  <p className="text-sm text-muted-foreground">
                    Generate multiple variations and combine the best elements from each.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}