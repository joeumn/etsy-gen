"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { StudioCanvas } from "@/components/ui/studio-canvas"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Sparkles, Image as ImageIcon } from "lucide-react"
import Link from "next/link"

interface DesignAsset {
  id: string
  prompt: string
  imageUrl: string
  assetType: 'image' | 'logo' | 'banner' | 'mockup'
  createdAt: string
  metadata?: Record<string, any>
}

export default function StudioPage() {
  const [assets, setAssets] = React.useState<DesignAsset[]>([])
  const [isLoading, setIsLoading] = React.useState(false)

  // Check if Zig 3 is enabled
  const isStudioEnabled = process.env.NEXT_PUBLIC_ENABLE_ZIG3_STUDIO === 'true'

  React.useEffect(() => {
    if (isStudioEnabled) {
      fetchAssets()
    }
  }, [isStudioEnabled])

  const fetchAssets = async () => {
    try {
      const response = await fetch('/api/studio?userId=current_user')
      const data = await response.json()
      if (data.success) {
        setAssets(data.data.assets)
      }
    } catch (error) {
      console.error('Failed to fetch assets:', error)
    }
  }

  const handleGenerate = async (prompt: string, assetType: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/studio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          assetType,
          userId: 'current_user',
        }),
      })
      const data = await response.json()
      if (data.success) {
        setAssets(prev => [data.data, ...prev])
      }
    } catch (error) {
      console.error('Failed to generate asset:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = (assetId: string) => {
    setAssets(prev => prev.filter(asset => asset.id !== assetId))
  }

  const handleSave = (assetId: string) => {
    // In a real implementation, this would save to Supabase Storage
    console.log('Saving asset:', assetId)
  }

  const handleUseForListing = (assetId: string) => {
    // In a real implementation, this would associate the asset with a product listing
    console.log('Using asset for listing:', assetId)
  }

  if (!isStudioEnabled) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <Sparkles className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-muted-foreground mb-2">
              AI Design Studio
            </h1>
            <p className="text-muted-foreground mb-6">
              This feature is currently disabled. Contact your administrator to enable it.
            </p>
            <Link href="/dashboard">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-flame bg-clip-text text-transparent">
                  AI Design Studio
                </h1>
                <p className="text-muted-foreground">
                  Generate stunning visuals for your products
                </p>
              </div>
            </div>
            <Badge className="bg-gradient-flame text-white">
              <Sparkles className="h-3 w-3 mr-1" />
              Zig 3
            </Badge>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assets.length}</div>
              <p className="text-xs text-muted-foreground">
                Generated this month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assets.filter(asset => 
                  new Date(asset.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length}
              </div>
              <p className="text-xs text-muted-foreground">
                New creations
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(assets.length * 0.5)}MB
              </div>
              <p className="text-xs text-muted-foreground">
                Of 1GB available
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Studio Canvas */}
        <StudioCanvas
          assets={assets}
          onGenerate={handleGenerate}
          onDelete={handleDelete}
          onSave={handleSave}
          onUseForListing={handleUseForListing}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}