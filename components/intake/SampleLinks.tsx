"use client";

import { FileText, Briefcase, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";

interface SampleDoc {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  filename: string;
  role: string;
}

const SAMPLES: SampleDoc[] = [
  {
    id: "rental",
    title: "Leave & License Agreement",
    subtitle: "Mumbai residential rental with red flags",
    icon: FileText,
    filename: "/samples/rental-agreement.txt",
    role: "Tenant",
  },
  {
    id: "job",
    title: "Job Offer Letter",
    subtitle: "Software engineer role with bond & non-compete",
    icon: Briefcase,
    filename: "/samples/job-offer.txt",
    role: "Employee",
  },
  {
    id: "freelance",
    title: "Freelance MSA",
    subtitle: "Design contract with IP & liability clauses",
    icon: PenLine,
    filename: "/samples/freelance-msa-v1.txt",
    role: "Freelancer",
  },
];

interface SampleLinksProps {
  onSampleLoad: (text: string, filename: string, role: string) => void;
  disabled?: boolean;
  className?: string;
}

export function SampleLinks({ onSampleLoad, disabled, className }: SampleLinksProps) {
  async function loadSample(sample: SampleDoc) {
    if (disabled) return;
    try {
      const res = await fetch(sample.filename);
      if (!res.ok) throw new Error("Failed to load sample");
      const text = await res.text();
      onSampleLoad(text, sample.title, sample.role);
    } catch {
      // Silent fail — samples are bundled
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-xs font-semibold text-[var(--ink-faint)] uppercase tracking-wide">
        Try a sample
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {SAMPLES.map((sample) => {
          const Icon = sample.icon;
          return (
            <button
              key={sample.id}
              onClick={() => loadSample(sample)}
              disabled={disabled}
              className={cn(
                "flex items-start gap-3 p-3 rounded-[var(--radius-card)] text-left",
                "border border-[var(--border)] bg-[var(--surface)]",
                "hover:border-[var(--primary)] hover:bg-[var(--primary-soft)]",
                "transition-colors duration-150",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none"
              )}
              aria-label={`Try sample: ${sample.title}`}
            >
              <Icon
                size={16}
                strokeWidth={1.5}
                className="text-[var(--primary)] flex-shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <p className="text-xs font-medium text-[var(--ink)]">{sample.title}</p>
                <p className="text-xs text-[var(--ink-faint)] mt-0.5">{sample.subtitle}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
