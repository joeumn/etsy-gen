"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Image as ImageIcon, 
  Download, 
  Save, 
  RefreshCw, 
  Sparkles,
  Loader2 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface DesignAsset {
  id: string;
  prompt: string;
  imageUrl: string;
  imageType: string;
  createdAt: string;
}

interface StudioCanvasProps {
  assets: DesignAsset[];
  onGenerate: (prompt: string) => Promise<void>;
  onSave: (assetId: string) => Promise<void>;
  onUseForListing: (assetId: string) => Promise<void>;
  isGenerating?: boolean;
  className?: string;
}

export function StudioCanvas({
  assets,
  onGenerate,
  onSave,
  onUseForListing,
  isGenerating = false,
  className,
}: StudioCanvasProps) {
  const [prompt, setPrompt] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    await onGenerate(prompt);
    setPrompt("");
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Generation Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Design Studio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Describe your product design..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={(e: React.KeyboardEvent) => e.key === "Enter" && handleGenerate()}
                disabled={isGenerating}
                className="flex-1"
              />
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="bg-ocean-500 hover:bg-ocean-600"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Generate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generated Assets Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Generated Assets ({assets.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence>
            {assets.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 text-muted-foreground"
              >
                <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No assets generated yet. Create your first design above!</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assets.map((asset, index) => (
                  <motion.div
                    key={asset.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={cn(
                      "relative group cursor-pointer",
                      selectedAsset === asset.id && "ring-2 ring-ocean-500"
                    )}
                    onClick={() => setSelectedAsset(
                      selectedAsset === asset.id ? null : asset.id
                    )}
                  >
                    <Card className="overflow-hidden">
                      <div className="aspect-square relative">
                        <img
                          src={asset.imageUrl}
                          alt={asset.prompt}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                onSave(asset.id);
                              }}
                            >
                              <Save className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                onUseForListing(asset.id);
                              }}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {asset.prompt}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(asset.createdAt).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}