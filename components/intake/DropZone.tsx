"use client";

import { useCallback, useState, useRef } from "react";
import { Upload, FileText, Image as ImageIcon, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/shared/SectionState";

interface DropZoneProps {
  onFileExtracted: (text: string, filename: string, warnings: string[]) => void;
  onError: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const ACCEPTED_EXTENSIONS = ".pdf,.docx,.txt,.jpg,.jpeg,.png,.webp";
const MAX_SIZE_MB = 10;

export function DropZone({ onFileExtracted, onError, disabled, className }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Extracting text…");
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      // Size check
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        onError(`File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed is ${MAX_SIZE_MB} MB.`);
        return;
      }

      // Type check
      const isValidType =
        ACCEPTED_TYPES.includes(file.type) ||
        file.name.match(/\.(pdf|docx|txt|jpg|jpeg|png|webp)$/i);
      if (!isValidType) {
        onError("This file type is not supported. Please upload a PDF, DOCX, TXT, JPG, or PNG file.");
        return;
      }

      setIsLoading(true);
      setCurrentFile(file.name);
      setWarnings([]);

      // Progress messages
      const fileType = file.type;
      if (fileType === "application/pdf") {
        setLoadingMessage("Reading PDF…");
      } else if (fileType.startsWith("image/")) {
        setLoadingMessage("Transcribing image with AI…");
      } else {
        setLoadingMessage("Extracting text…");
      }

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/extract", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Extraction failed." }));
          throw new Error(err.error || "Extraction failed.");
        }

        const result = await res.json();
        setWarnings(result.warnings || []);
        onFileExtracted(result.text, file.name, result.warnings || []);
      } catch (err) {
        onError(err instanceof Error ? err.message : "Failed to read the file.");
      } finally {
        setIsLoading(false);
      }
    },
    [onFileExtracted, onError]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled || isLoading) return;

      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [disabled, isLoading, processFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      // Reset input so same file can be re-uploaded
      e.target.value = "";
    },
    [processFile]
  );

  return (
    <div className={cn("space-y-3", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer",
          "transition-all duration-300 ease-out shadow-sm",
          isDragging
            ? "border-[var(--primary)] bg-[var(--primary-soft)] shadow-md scale-[1.02]"
            : "border-[var(--border-strong)] bg-[var(--surface)] hover:border-[var(--primary)] hover:bg-[var(--primary-soft)] hover:shadow-lg hover:-translate-y-1",
          (disabled || isLoading) && "opacity-60 cursor-not-allowed pointer-events-none"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && !isLoading && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload document — click or drag and drop"
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled && !isLoading) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          onChange={handleChange}
          className="sr-only"
          aria-label="Upload document"
          disabled={disabled || isLoading}
        />

        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <LoadingSpinner size={28} />
            <p className="text-sm font-medium text-[var(--primary)]">{loadingMessage}</p>
            {currentFile && (
              <p className="text-xs text-[var(--ink-faint)] truncate max-w-48">{currentFile}</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-2 text-[var(--ink-faint)]">
              <Upload size={24} strokeWidth={1.5} aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-[var(--ink)]">
                Drop your document here, or{" "}
                <span className="text-[var(--primary)] underline underline-offset-4 decoration-2">browse</span>
              </p>
              <p className="text-sm text-[var(--ink-faint)] mt-1">
                PDF, DOCX, TXT, JPG, PNG — up to 10 MB
              </p>
            </div>
            <div className="flex gap-3 mt-1">
              <FileTypeChip icon={<FileText size={11} />} label="PDF" />
              <FileTypeChip icon={<FileText size={11} />} label="DOCX" />
              <FileTypeChip icon={<ImageIcon size={11} />} label="Photo" />
            </div>
          </div>
        )}
      </div>

      {/* Warnings */}
      {warnings.map((w, i) => (
        <div key={i} className="flex items-start gap-2 text-xs text-[var(--risk-medium)] bg-[var(--risk-medium-bg)] rounded-lg px-3 py-2">
          <AlertCircle size={12} className="mt-0.5 flex-shrink-0" strokeWidth={1.5} aria-hidden="true" />
          <span>{w}</span>
        </div>
      ))}

      {/* Privacy note */}
      <p className="text-xs text-[var(--ink-faint)] text-center flex items-center justify-center gap-1">
        <span aria-hidden="true">🔒</span>
        Your document stays in this browser session. We do not store it.
      </p>
    </div>
  );
}

function FileTypeChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-[var(--surface-muted)] text-[var(--ink-muted)] border border-[var(--border)]">
      {icon}
      {label}
    </span>
  );
}
