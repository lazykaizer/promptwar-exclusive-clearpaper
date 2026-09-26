"use client";

import { cn } from "@/lib/utils";
import type { Risk } from "@/lib/schemas";
import { AlertTriangle, Info, ShieldCheck, TrendingDown } from "lucide-react";

interface RiskBadgeProps {
  risk: Risk;
  size?: "sm" | "md";
  className?: string;
}

const riskConfig: Record<
  Risk,
  {
    label: string;
    icon: React.ElementType;
    colorClass: string;
  }
> = {
  high: {
    label: "High Risk",
    icon: AlertTriangle,
    colorClass: "risk-high",
  },
  medium: {
    label: "Medium Risk",
    icon: TrendingDown,
    colorClass: "risk-medium",
  },
  low: {
    label: "Low Risk",
    icon: ShieldCheck,
    colorClass: "risk-low",
  },
  info: {
    label: "Info",
    icon: Info,
    colorClass: "info",
  },
};

export function RiskBadge({ risk, size = "sm", className }: RiskBadgeProps) {
  const config = riskConfig[risk] || riskConfig.info;
  const Icon = config.icon;

  const isSmall = size === "sm";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium rounded-full",
        isSmall ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        className
      )}
      style={{
        color: `var(--${config.colorClass})`,
        backgroundColor: `var(--${config.colorClass}-bg)`,
      }}
      role="status"
      aria-label={config.label}
    >
      <Icon
        size={isSmall ? 11 : 14}
        strokeWidth={1.5}
        aria-hidden="true"
      />
      {config.label}
    </span>
  );
}
