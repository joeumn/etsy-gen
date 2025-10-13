"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Image, Download, Trash2, RefreshCw, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface DesignAsset {
  id: string
  prompt: string
  imageUrl: string
  assetType: 'image' | 'logo' | 'banner' | 'mockup'
  createdAt: string
  metadata?: Record<string, any>
}

interface StudioCanvasProps {
  assets: DesignAsset[]
  onGenerate: (prompt: string, assetType: string) => void
  onDelete: (assetId: string) => void
  onSave: (assetId: string) => void
  onUseForListing: (assetId: string) => void
  isLoading?: boolean
  className?: string
}

export function StudioCanvas({
  assets,
  onGenerate,
  onDelete,
  onSave,
  onUseForListing,
  isLoading = false,
  className,
}: StudioCanvasProps) {
  const [prompt, setPrompt] = React.useState("")
  const [assetType, setAssetType] = React.useState<'image' | 'logo' | 'banner' | 'mockup'>('image')

  const handleGenerate = () => {
    if (prompt.trim()) {
      onGenerate(prompt, assetType)
      setPrompt("")
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Generation Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5 text-ocean-500" />
              AI Design Studio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3">
                <Textarea
                  placeholder="Describe the image you want to generate..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <select
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value as any)}
                  className="w-full p-2 border rounded-md bg-background"
                >
                  <option value="image">Product Image</option>
                  <option value="logo">Logo</option>
                  <option value="banner">Banner</option>
                  <option value="mockup">Mockup</option>
                </select>
                <Button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isLoading}
                  className="w-full bg-gradient-flame text-white hover:opacity-90"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Image className="h-4 w-4 mr-2" />
                  )}
                  Generate
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Generated Assets Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {assets.map((asset, index) => (
          <motion.div
            key={asset.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group"
          >
            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={asset.imageUrl}
                  alt={asset.prompt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onSave(asset.id)}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onUseForListing(asset.id)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(asset.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="capitalize">
                      {asset.assetType}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(asset.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {asset.prompt}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {assets.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center py-12"
        >
          <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            No assets generated yet
          </h3>
          <p className="text-muted-foreground">
            Start by describing an image you'd like to create
          </p>
        </motion.div>
      )}
    </div>
  )
}