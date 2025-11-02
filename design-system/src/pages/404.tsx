import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center px-4 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-3xl mb-2">Page Not Found</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            The page you're looking for doesn't exist or has been moved to a different location.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Button onClick={() => navigate("/dashboard")}>
            <Home className="mr-2 h-4 w-4" />
            Go to Dashboard
          </Button>
        </div>

        <div className="mt-12 text-sm text-muted-foreground">
          <p>Lost? Try using the search command:</p>
          <div className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-muted/50">
            <kbd className="px-2 py-1 text-xs bg-background rounded border">⌘</kbd>
            <span>+</span>
            <kbd className="px-2 py-1 text-xs bg-background rounded border">K</kbd>
          </div>
        </div>
      </div>
    </div>
  );
}
