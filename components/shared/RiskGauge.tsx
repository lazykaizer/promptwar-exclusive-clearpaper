"use client";

import { cn } from "@/lib/utils";

type OverallRisk = "low" | "moderate" | "high" | "severe";

interface RiskGaugeProps {
  risk: OverallRisk;
  reason?: string;
  className?: string;
}

const segments: { level: OverallRisk; label: string; color: string }[] = [
  { level: "low", label: "Low", color: "var(--risk-low)" },
  { level: "moderate", label: "Moderate", color: "var(--risk-medium)" },
  { level: "high", label: "High", color: "var(--risk-high)" },
  { level: "severe", label: "Severe", color: "#6B1A10" },
];

const riskIndex: Record<OverallRisk, number> = {
  low: 0,
  moderate: 1,
  high: 2,
  severe: 3,
};

export function RiskGauge({ risk, reason, className }: RiskGaugeProps) {
  const activeIdx = riskIndex[risk];

  return (
    <div className={cn("space-y-3", className)} role="meter" aria-label={`Overall risk level: ${risk}`} aria-valuenow={activeIdx} aria-valuemin={0} aria-valuemax={3}>
      {/* Segment bar */}
      <div className="flex gap-1 items-center">
        {segments.map((seg, idx) => (
          <div key={seg.level} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={cn(
                "h-3 w-full rounded-full transition-all duration-300",
                idx <= activeIdx ? "opacity-100" : "opacity-20"
              )}
              style={{ backgroundColor: seg.color }}
            />
          </div>
        ))}
      </div>

      {/* Labels */}
      <div className="flex">
        {segments.map((seg, idx) => (
          <div key={seg.level} className="flex-1 text-center">
            <span
              className={cn(
                "text-xs font-medium",
                idx === activeIdx ? "font-semibold" : "text-[var(--ink-faint)]"
              )}
              style={idx === activeIdx ? { color: seg.color } : undefined}
            >
              {idx === activeIdx && (
                <span className="block text-base mb-0.5">▼</span>
              )}
              {seg.label}
            </span>
          </div>
        ))}
      </div>

      {/* Reason text */}
      {reason && (
        <p className="text-sm text-[var(--ink-muted)] leading-relaxed">
          {reason}
        </p>
      )}
    </div>
  );
}
