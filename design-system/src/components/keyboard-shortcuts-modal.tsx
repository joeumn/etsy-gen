import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Keyboard } from "lucide-react";

interface KeyboardShortcut {
  keys: string[];
  description: string;
  category: string;
}

interface KeyboardShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsModal({ open, onOpenChange }: KeyboardShortcutsModalProps) {
  const shortcuts: KeyboardShortcut[] = [
    { keys: ["⌘", "K"], description: "Open command palette", category: "Navigation" },
    { keys: ["⌘", "B"], description: "Toggle sidebar", category: "Navigation" },
    { keys: ["⌘", "/"], description: "Show keyboard shortcuts", category: "General" },
    { keys: ["⌘", "T"], description: "Toggle theme", category: "General" },
    { keys: ["G", "D"], description: "Go to Dashboard", category: "Navigation" },
    { keys: ["G", "T"], description: "Go to Trends", category: "Navigation" },
    { keys: ["G", "P"], description: "Go to Products", category: "Navigation" },
    { keys: ["G", "M"], description: "Go to Marketplaces", category: "Navigation" },
    { keys: ["G", "A"], description: "Go to Analytics", category: "Navigation" },
    { keys: ["G", "S"], description: "Go to Settings", category: "Navigation" },
    { keys: ["N", "P"], description: "Create new product", category: "Actions" },
    { keys: ["N", "S"], description: "Start new scan", category: "Actions" },
    { keys: ["?"], description: "Open AI assistant", category: "Actions" },
  ];

  const categories = Array.from(new Set(shortcuts.map((s) => s.category)));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2">
              <Keyboard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Keyboard Shortcuts</DialogTitle>
              <DialogDescription>
                Navigate The Forge faster with these keyboard shortcuts
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">{category}</h3>
              <div className="space-y-2">
                {shortcuts
                  .filter((s) => s.category === category)
                  .map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, i) => (
                          <span key={i} className="flex items-center gap-1">
                            <kbd className="px-3 py-1.5 text-xs font-medium bg-background rounded border border-border shadow-sm">
                              {key}
                            </kbd>
                            {i < shortcut.keys.length - 1 && (
                              <span className="text-muted-foreground text-xs">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-sm text-muted-foreground">
            <strong>Tip:</strong> Press <kbd className="px-2 py-0.5 mx-1 text-xs bg-background rounded border">⌘</kbd> + <kbd className="px-2 py-0.5 mx-1 text-xs bg-background rounded border">/</kbd> anytime to see this dialog.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
