"use client";

import { useState, useCallback, useRef } from "react";
import {
  Upload,
  FileText,
  Image as ImageIcon,
  X,
  Sparkles,
  Check,
  Loader2,
  AlertCircle,
  Trash2,
  ChevronDown,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  EXPENSE_CATEGORIES,
  type ExpenseCategory,
} from "@/lib/db/models/expense-types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DetectedExpense {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  selected: boolean;
}

interface BankStatementImportProps {
  onImport: (
    expenses: Omit<DetectedExpense, "id" | "selected">[],
  ) => Promise<void>;
  trigger?: React.ReactNode;
}

// ─── Gemini Parser ────────────────────────────────────────────────────────────

async function parseStatementWithGemini(
  file: File,
): Promise<DetectedExpense[]> {
  const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!GEMINI_API_KEY) throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not set");

  // Convert file to base64
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]); // strip data URL prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const mimeType = file.type; // e.g. "application/pdf" or "image/jpeg"

  const prompt = `You are a financial data extraction assistant. Analyze this bank statement and extract ALL expense/debit transactions.

Return ONLY a valid JSON array with no markdown, no explanation, no code fences. Each object must have:
- date: string in "YYYY-MM-DD" format
- description: string (merchant/payee name, cleaned up)
- amount: number (positive value, no currency symbol)
- currency: string (3-letter ISO code like "USD", "INR", "EUR" — detect from statement, default "USD")
- category: one of exactly these values: "housing", "utilities", "food", "gym", "transport", "entertainment", "healthcare", "other"

Rules:
- Only include debits/expenses, skip credits/deposits/refunds
- Infer category from description (e.g. "ZOMATO" → "food", "UBER" → "transport", "NETFLIX" → "subscriptions")
- If date year is ambiguous, use current year
- Clean up description (remove transaction IDs, trailing digits, etc.)

Example output:
[{"date":"2024-01-15","description":"Zomato","amount":450,"currency":"INR","category":"food"},{"date":"2024-01-16","description":"Uber","amount":200,"currency":"INR","category":"transport"}]`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64,
                },
              },
              { text: prompt },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 8192,
        },
      }),
    },
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err?.error?.message || "Gemini API error");
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  // Strip any accidental markdown fences
  const cleaned = text.replace(/```json|```/g, "").trim();

  let parsed: Omit<DetectedExpense, "id" | "selected">[];
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(
      "Could not parse Gemini response as JSON. Try a clearer image.",
    );
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("No expense transactions detected in the statement.");
  }

  return parsed.map((item, i) => ({
    ...item,
    id: `gemini-${i}-${Date.now()}`,
    selected: true,
  }));
}

// ─── Step Components ──────────────────────────────────────────────────────────

function UploadStep({ onFileSelect }: { onFileSelect: (file: File) => void }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-10 cursor-pointer transition-all duration-200",
          dragging
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border hover:border-primary/50 hover:bg-muted/30",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Upload className="h-7 w-7 text-primary" />
        </div>

        <div className="text-center">
          <p className="font-semibold text-foreground">
            Drop your bank statement here
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            or click to browse files
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-3 py-1.5">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">PDF</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-3 py-1.5">
            <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              JPG / PNG / WEBP
            </span>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        <Sparkles className="mr-1 inline h-3 w-3" />
        Powered by Gemini AI — your file is processed client-side and never
        stored
      </p>
    </div>
  );
}

function ProcessingStep({ fileName }: { fileName: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-10">
      <div className="relative">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
          <Sparkles className="h-9 w-9 text-primary" />
        </div>
        <div className="absolute -right-1 -top-1">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      </div>
      <div className="text-center">
        <p className="font-semibold">Analyzing statement…</p>
        <p className="mt-1 text-sm text-muted-foreground">{fileName}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Gemini is detecting and categorizing your transactions
        </p>
      </div>
    </div>
  );
}

function ReviewStep({
  expenses,
  onChange,
  onToggle,
  onToggleAll,
  onRemove,
}: {
  expenses: DetectedExpense[];
  onChange: (
    id: string,
    field: keyof DetectedExpense,
    value: string | number,
  ) => void;
  onToggle: (id: string) => void;
  onToggleAll: (val: boolean) => void;
  onRemove: (id: string) => void;
}) {
  const allSelected = expenses.every((e) => e.selected);
  const selectedCount = expenses.filter((e) => e.selected).length;
  const total = expenses
    .filter((e) => e.selected)
    .reduce((s, e) => s + e.amount, 0);
  const currency = expenses[0]?.currency ?? "USD";

  return (
    <div className="space-y-3">
      {/* Summary bar */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) => onToggleAll(e.target.checked)}
            className="h-4 w-4 cursor-pointer rounded accent-primary"
          />
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {selectedCount}
            </span>{" "}
            of {expenses.length} selected
          </span>
        </div>
        <span className="text-sm font-semibold">
          {currency}{" "}
          {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      </div>

      {/* Expense rows */}
      <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
        {expenses.map((expense) => (
          <div
            key={expense.id}
            className={cn(
              "group flex items-start gap-3 rounded-lg border p-3 transition-all",
              expense.selected
                ? "border-border bg-card"
                : "border-border/40 bg-muted/20 opacity-50",
            )}
          >
            <input
              type="checkbox"
              checked={expense.selected}
              onChange={() => onToggle(expense.id)}
              className="mt-1 h-4 w-4 cursor-pointer rounded accent-primary"
            />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-start gap-2">
                <Input
                  value={expense.description}
                  onChange={(e) =>
                    onChange(expense.id, "description", e.target.value)
                  }
                  className="h-7 flex-1 text-sm font-medium"
                />
                <Input
                  type="date"
                  value={expense.date}
                  onChange={(e) => onChange(expense.id, "date", e.target.value)}
                  className="h-7 w-36 text-xs"
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Input
                    value={expense.currency}
                    onChange={(e) =>
                      onChange(
                        expense.id,
                        "currency",
                        e.target.value.toUpperCase().slice(0, 3),
                      )
                    }
                    className="h-7 w-16 text-center text-xs font-mono"
                  />
                  <Input
                    type="number"
                    value={expense.amount}
                    onChange={(e) =>
                      onChange(
                        expense.id,
                        "amount",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    className="h-7 w-28 text-sm font-semibold"
                    min={0}
                    step={0.01}
                  />
                </div>
                <Select
                  value={expense.category}
                  onValueChange={(v) => onChange(expense.id, "category", v)}
                >
                  <SelectTrigger className="h-7 flex-1 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-xs">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <button
              onClick={() => onRemove(expense.id)}
              className="mt-0.5 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

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

      <DialogContent className="sm:max-w-[620px]">
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
