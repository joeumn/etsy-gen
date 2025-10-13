"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Palette, Type, Image as ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandKit {
  id: string;
  name: string;
  logoUrl?: string;
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    neutral: string;
  };
  typography: {
    heading: string;
    body: string;
    accent: string;
  };
  tagline: string;
  brandKitUrl?: string;
}

interface BrandKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandKit?: BrandKit;
  onDownload?: () => void;
  className?: string;
}

export function BrandKitModal({
  isOpen,
  onClose,
  brandKit,
  onDownload,
  className,
}: BrandKitModalProps) {
  if (!brandKit) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Brand Kit: {brandKit.name}
              </DialogTitle>
            </DialogHeader>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Logo Section */}
              {brandKit.logoUrl && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Logo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center p-8 bg-muted rounded-lg">
                      <img
                        src={brandKit.logoUrl}
                        alt={`${brandKit.name} logo`}
                        className="max-h-32 max-w-full object-contain"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Color Palette */}
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
                      <div key={name} className="text-center">
                        <div
                          className="w-full h-16 rounded-lg mb-2 border"
                          style={{ backgroundColor: color }}
                        />
                        <p className="text-sm font-medium capitalize">{name}</p>
                        <p className="text-xs text-muted-foreground">{color}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Typography */}
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
                      <div key={type}>
                        <p className="text-sm font-medium capitalize mb-1">{type}</p>
                        <p
                          className="text-lg"
                          style={{ fontFamily: font }}
                        >
                          Sample Text - {font}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tagline */}
              <Card>
                <CardHeader>
                  <CardTitle>Tagline</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg italic text-muted-foreground">
                    "{brandKit.tagline}"
                  </p>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button onClick={onDownload} className="bg-flame-500 hover:bg-flame-600">
                  <Download className="h-4 w-4 mr-2" />
                  Download Brand Kit
                </Button>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}