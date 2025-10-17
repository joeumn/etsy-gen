"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudioCanvas } from "@/components/ui/studio-canvas";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { 
  Sparkles, 
  ArrowLeft,
  Settings,
  Crown
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

interface DesignAsset {
  id: string;
  prompt: string;
  imageUrl: string;
  imageType: string;
  createdAt: string;
}

export default function Studio() {
  const [assets, setAssets] = useState<DesignAsset[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real assets from API
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await fetch('/api/studio/generate?userId=mock-user-1');
        if (response.ok) {
          const data = await response.json();
          setAssets(data.data || []);
        } else {
          console.error('Failed to fetch assets:', await response.text());
          setAssets([]);
        }
      } catch (error) {
        console.error('Error fetching assets:', error);
        setAssets([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAssets();
  }, []);

  const handleGenerate = async (prompt: string) => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/studio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          userId: 'mock-user-1',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newAsset: DesignAsset = data.data;
        setAssets(prev => [newAsset, ...prev]);
      } else {
        console.error('Failed to generate asset:', await response.text());
        alert('Failed to generate design. Please check your API configuration.');
      }
    } catch (error) {
      console.error('Error generating asset:', error);
      alert('An error occurred while generating the design.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (assetId: string) => {
    console.log("Asset already saved to database:", assetId);
    // Asset is already saved during generation
  };

  const handleUseForListing = async (assetId: string) => {
    console.log("Using asset for listing:", assetId);
    // In real app, this would navigate to listing creation with the asset
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div className="w-8 h-8 bg-flame-gradient rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">AI Design Studio</span>
          </motion.div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="outline" size="sm" asChild>
              <Link href="/settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
            <Button size="sm" className="bg-flame-500 hover:bg-flame-600">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">AI Design Studio</h1>
          <p className="text-muted-foreground">
            Create stunning product designs and mockups with AI. Generate images, save assets, and use them for your listings.
          </p>
        </motion.div>

        {/* Feature Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-ocean-500/10 to-flame-500/10 border-ocean-500/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-ocean-500/20 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-ocean-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Powered by Advanced AI</h3>
                  <p className="text-muted-foreground mb-4">
                    Our AI design studio uses cutting-edge image generation models to create professional product mockups, 
                    templates, and designs. Simply describe what you want, and watch as AI brings your vision to life.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-ocean-500/20 text-ocean-700 dark:text-ocean-300 rounded-full text-sm">
                      Product Mockups
                    </span>
                    <span className="px-3 py-1 bg-flame-500/20 text-flame-700 dark:text-flame-300 rounded-full text-sm">
                      Template Designs
                    </span>
                    <span className="px-3 py-1 bg-gold-500/20 text-gold-700 dark:text-gold-300 rounded-full text-sm">
                      Brand Assets
                    </span>
                    <span className="px-3 py-1 bg-green-500/20 text-green-700 dark:text-green-300 rounded-full text-sm">
                      Social Media Graphics
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Studio Canvas */}
        <StudioCanvas
          assets={assets}
          onGenerate={handleGenerate}
          onSave={handleSave}
          onUseForListing={handleUseForListing}
          isGenerating={isGenerating}
        />

        {/* Usage Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Usage This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-ocean-500">12</div>
                  <div className="text-sm text-muted-foreground">Designs Generated</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-flame-500">8</div>
                  <div className="text-sm text-muted-foreground">Assets Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gold-500">5</div>
                  <div className="text-sm text-muted-foreground">Used in Listings</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}