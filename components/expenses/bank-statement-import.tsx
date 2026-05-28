"use client";

import { useState } from "react";
import {
  Image as ImageIcon,
  X,
  Sparkles,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { parseStatementWithGemini } from "./gemini-parser";
import { BankStatementImportProps, DetectedExpense } from "./types";
import { UploadStep } from "./upload-step";
import { ProcessingStep } from "./processing-step";
import { ReviewStep } from "./review-step";

export function BankStatementImport({
  onImport,
  trigger,
}: BankStatementImportProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"upload" | "processing" | "review" | "done">(
    "upload",
  );
  const [file, setFile] = useState<File | null>(null);
  const [expenses, setExpenses] = useState<DetectedExpense[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const reset = () => {
    setStep("upload");
    setFile(null);
    setExpenses([]);
    setError(null);
    setImporting(false);
  };

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setStep("processing");

    try {
      const detected = await parseStatementWithGemini(selectedFile);
      setExpenses(detected);
      setStep("review");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStep("upload");
    }
  };

  const handleChange = (
    id: string,
    field: keyof DetectedExpense,
    value: string | number,
  ) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    );
  };

  const handleToggle = (id: string) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, selected: !e.selected } : e)),
    );
  };

  const handleToggleAll = (val: boolean) => {
    setExpenses((prev) => prev.map((e) => ({ ...e, selected: val })));
  };

  const handleRemove = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const handleImport = async () => {
    const selected = expenses
      .filter((e) => e.selected)
      .map(({ id, selected, ...rest }) => rest);

    if (selected.length === 0) return;
    setImporting(true);
    try {
      await onImport(selected);
      setStep("done");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const selectedCount = expenses.filter((e) => e.selected).length;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline">
            <Sparkles className="mr-2 h-4 w-4" />
            Import Statement
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-155">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold uppercase tracking-wider">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Import from Bank Statement
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2">
          {/* Error banner */}
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Steps */}
          {step === "upload" && <UploadStep onFileSelect={handleFileSelect} />}
          {step === "processing" && (
            <ProcessingStep fileName={file?.name ?? ""} />
          )}
          {step === "review" && (
            <>
              <ReviewStep
                expenses={expenses}
                onChange={handleChange}
                onToggle={handleToggle}
                onToggleAll={handleToggleAll}
                onRemove={handleRemove}
              />
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={reset}
                  className="text-muted-foreground"
                >
                  <X className="mr-1.5 h-3.5 w-3.5" />
                  Start over
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={selectedCount === 0 || importing}
                  className="bg-expense text-white hover:bg-expense/90"
                >
                  {importing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  Import {selectedCount} expense{selectedCount !== 1 ? "s" : ""}
                </Button>
              </div>
            </>
          )}
          {step === "done" && (
            <div className="flex flex-col items-center justify-center gap-4 py-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              <div className="text-center">
                <p className="font-semibold">Import complete!</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedCount} expenses added to your records
                </p>
              </div>
              <Button
                onClick={() => {
                  reset();
                  setOpen(false);
                }}
                className="mt-2"
              >
                Done
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
