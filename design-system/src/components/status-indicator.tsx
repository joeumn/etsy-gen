import { Badge } from "./ui/badge";
import { CheckCircle, Clock, AlertCircle, XCircle, Loader2, Zap } from "lucide-react";

export type StatusType = "success" | "pending" | "processing" | "failed" | "active" | "inactive";

interface StatusIndicatorProps {
  status: StatusType;
  label?: string;
  showIcon?: boolean;
  pulse?: boolean;
  size?: "sm" | "default" | "lg";
}

export function StatusIndicator({
  status,
  label,
  showIcon = true,
  pulse = true,
  size = "default",
}: StatusIndicatorProps) {
  const getStatusConfig = (status: StatusType) => {
    switch (status) {
      case "success":
        return {
          className: "bg-success/10 text-success border-success/20",
          icon: CheckCircle,
          label: label || "Success",
          pulse: false,
        };
      case "pending":
        return {
          className: "bg-warning/10 text-warning border-warning/20",
          icon: Clock,
          label: label || "Pending",
          pulse: true,
        };
      case "processing":
        return {
          className: "bg-chart-1/10 text-chart-1 border-chart-1/20",
          icon: Loader2,
          label: label || "Processing",
          pulse: true,
          spin: true,
        };
      case "failed":
        return {
          className: "bg-destructive/10 text-destructive border-destructive/20",
          icon: XCircle,
          label: label || "Failed",
          pulse: false,
        };
      case "active":
        return {
          className: "bg-success/10 text-success border-success/20",
          icon: Zap,
          label: label || "Active",
          pulse: true,
        };
      case "inactive":
        return {
          className: "bg-muted text-muted-foreground border-border",
          icon: AlertCircle,
          label: label || "Inactive",
          pulse: false,
        };
      default:
        return {
          className: "bg-muted text-muted-foreground",
          icon: AlertCircle,
          label: label || status,
          pulse: false,
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;
  const shouldPulse = pulse && config.pulse;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    default: "text-sm",
    lg: "text-base px-3 py-1",
  };

  const iconSizeClasses = {
    sm: "h-3 w-3",
    default: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  return (
    <Badge
      variant="outline"
      className={`${config.className} ${sizeClasses[size]} ${shouldPulse ? "animate-pulse-subtle" : ""}`}
    >
      {showIcon && (
        <Icon
          className={`${iconSizeClasses[size]} mr-1 ${config.spin ? "animate-spin" : ""}`}
        />
      )}
      {config.label}
    </Badge>
  );
}

export function LiveStatusDot({ status, size = "default" }: { status: StatusType; size?: "sm" | "default" | "lg" }) {
  const getColor = (status: StatusType) => {
    switch (status) {
      case "success":
      case "active":
        return "bg-success";
      case "pending":
        return "bg-warning";
      case "processing":
        return "bg-chart-1";
      case "failed":
        return "bg-destructive";
      case "inactive":
        return "bg-muted-foreground";
      default:
        return "bg-muted-foreground";
    }
  };

  const sizeClasses = {
    sm: "h-2 w-2",
    default: "h-2.5 w-2.5",
    lg: "h-3 w-3",
  };

  const shouldAnimate = status === "active" || status === "processing" || status === "pending";

  return (
    <span className="relative flex">
      <span
        className={`${sizeClasses[size]} ${getColor(status)} rounded-full ${
          shouldAnimate ? "animate-pulse" : ""
        }`}
      />
      {shouldAnimate && (
        <span
          className={`absolute inline-flex h-full w-full rounded-full ${getColor(
            status
          )} opacity-75 animate-ping`}
        />
      )}
    </span>
  );
}
