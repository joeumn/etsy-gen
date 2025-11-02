import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Home, RefreshCw, AlertTriangle } from "lucide-react";

export function ErrorPage() {
  const navigate = useNavigate();

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center px-4 animate-fade-in">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-destructive/10 mb-6">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <h1 className="text-5xl font-bold mb-4">Something went wrong</h1>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            We're sorry for the inconvenience. Our AI agents are working on fixing the issue. Please try refreshing the page or go back to the dashboard.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Page
          </Button>
          <Button onClick={() => navigate("/dashboard")}>
            <Home className="mr-2 h-4 w-4" />
            Go to Dashboard
          </Button>
        </div>

        <div className="mt-12 p-4 rounded-lg bg-muted/50 max-w-md mx-auto text-left text-sm">
          <p className="text-muted-foreground">
            <strong>Error Code:</strong> 500
          </p>
          <p className="text-muted-foreground mt-1">
            If this issue persists, please contact support with the error code above.
          </p>
        </div>
      </div>
    </div>
  );
}
