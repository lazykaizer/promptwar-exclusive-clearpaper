"use client";

import { cn } from "@/lib/utils";
import type { Role, Jurisdiction, Language } from "@/lib/schemas";

interface ContextSelectorsProps {
  role: Role;
  docType: string;
  jurisdiction: Jurisdiction;
  language: Language;
  onRoleChange: (role: Role) => void;
  onDocTypeChange: (docType: string) => void;
  onJurisdictionChange: (jurisdiction: Jurisdiction) => void;
  onLanguageChange: (language: Language) => void;
  disabled?: boolean;
  className?: string;
}

const ROLES: Role[] = [
  "Tenant", "Landlord", "Employee", "Employer",
  "Freelancer", "Client", "Borrower", "Lender", "Consumer", "Other"
];

const DOC_TYPES = [
  "Auto-detect",
  "Rental / Lease Agreement",
  "Job Offer / Employment Contract",
  "Freelance / Service Agreement",
  "Non-Disclosure Agreement (NDA)",
  "Loan Agreement",
  "Terms of Service",
  "Privacy Policy",
  "Sale Agreement",
  "Partnership Agreement",
  "Other",
];

const JURISDICTIONS: Jurisdiction[] = ["India", "Other"];

const LANGUAGES: Language[] = [
  "English", "Hindi", "Hinglish", "Marathi",
  "Gujarati", "Bengali", "Tamil", "Telugu", "Kannada"
];

export function ContextSelectors({
  role,
  docType,
  jurisdiction,
  language,
  onRoleChange,
  onDocTypeChange,
  onJurisdictionChange,
  onLanguageChange,
  disabled,
  className,
}: ContextSelectorsProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <p className="text-xs font-semibold text-[var(--ink-faint)] uppercase tracking-wide">
        Context (optional)
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SelectField
          id="role-select"
          label="I am the"
          value={role}
          onChange={(v) => onRoleChange(v as Role)}
          options={ROLES.map((r) => ({ value: r, label: r }))}
          disabled={disabled}
        />
        <SelectField
          id="doctype-select"
          label="Document type"
          value={docType}
          onChange={onDocTypeChange}
          options={DOC_TYPES.map((t) => ({ value: t, label: t }))}
          disabled={disabled}
        />
        <SelectField
          id="jurisdiction-select"
          label="Jurisdiction"
          value={jurisdiction}
          onChange={(v) => onJurisdictionChange(v as Jurisdiction)}
          options={JURISDICTIONS.map((j) => ({ value: j, label: j }))}
          disabled={disabled}
        />

      </div>
    </div>
  );
}

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}

function SelectField({ id, label, value, onChange, options, disabled }: SelectFieldProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-xs font-medium text-[var(--ink-muted)]">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          "w-full rounded-lg border border-[var(--border-strong)] px-3 py-2",
          "text-sm text-[var(--ink)] bg-[var(--surface)]",
          "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent",
          "transition-colors duration-150",
          "hover:border-[var(--primary)]",
          "disabled:opacity-60 disabled:cursor-not-allowed"
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
