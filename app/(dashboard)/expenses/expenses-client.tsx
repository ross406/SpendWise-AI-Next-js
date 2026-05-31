"use client";

import { useState, useCallback, useEffect } from "react";
import {
  TrendingDown,
  Plus,
  Search,
  Download,
  Sparkles,
  LayoutGrid,
  Table2,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExpensesTable } from "@/components/expenses/expenses-table";
import { ExpensesBoard } from "@/components/expenses/expenses-board";
import {
  ExpenseForm,
  ExpenseFormData,
} from "@/components/expenses/expense-form";
import { BankStatementImport } from "@/components/expenses/bank-statement-import";
import {
  getExpenses,
  exportExpensesToCSV,
  createExpense,
} from "@/app/actions/expenses";
import {
  EXPENSE_CATEGORIES,
  type ExpenseCategory,
} from "@/lib/db/models/expense-types";
import { DetectedExpense } from "@/components/expenses/types";
import { VoiceExpenseButton } from "@/components/expenses/voice-expense-button";
import { parseVoiceExpense } from "@/components/expenses/gemini-parser";
import { Textarea } from "@/components/ui/textarea";

interface Expense {
  _id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
}

interface ExpensesClientProps {
  initialExpenses: Expense[];
  initialMonth: number;
  initialYear: number;
}

type ViewMode = "table" | "board";

type VoiceStatus = "idle" | "review" | "processing" | "error";

export function ExpensesClient({
  initialExpenses,
  initialMonth,
  initialYear,
}: ExpensesClientProps) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<ViewMode>("table");

  const [transcript, setTranscript] = useState("");
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("idle");

  const [voiceError, setVoiceError] = useState("");

  const refreshExpenses = useCallback(async () => {
    const data = await getExpenses(
      initialMonth,
      initialYear,
      search || undefined,
    );
    setExpenses(data as Expense[]);
  }, [initialMonth, initialYear, search]);

  useEffect(() => {
    refreshExpenses();
  }, []);

  const handleSearch = async (value: string) => {
    setSearch(value);
    const data = await getExpenses(
      initialMonth,
      initialYear,
      value || undefined,
    );
    setExpenses(data as Expense[]);
  };

  const handleExport = async () => {
    try {
      const csv = await exportExpensesToCSV(initialMonth, initialYear);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `expenses-${initialYear}-${initialMonth.toString().padStart(2, "0")}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export expenses:", error);
    }
  };

  const handleBulkImport = async (
    detectedExpenses: Omit<DetectedExpense, "id" | "selected">[],
  ) => {
    for (const expense of detectedExpenses) {
      await createExpense({
        ...expense,
        category: EXPENSE_CATEGORIES.includes(
          expense.category as ExpenseCategory,
        )
          ? (expense.category as ExpenseCategory)
          : "other",
      });
    }
    await refreshExpenses();
  };

  async function createExpenseFromVoice(transcript: string) {
    const parsed: any = await parseVoiceExpense(transcript);
    console.log("Parsed voice expense:", parsed);
    if (parsed.expense) {
      return createExpense(parsed.expense);
    }
  }

  const processTranscript = async () => {
    try {
      setVoiceError("");
      setVoiceStatus("processing");

      await createExpenseFromVoice(transcript);

      await refreshExpenses();

      setTranscript("");
      setVoiceStatus("idle");
    } catch (error) {
      setVoiceError(
        error instanceof Error
          ? error.message
          : "Failed to process voice expense",
      );

      setVoiceStatus("error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-border bg-card">
        <CardContent>
          {/* Top row: icon+title left, Add Record right */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-expense/10">
                <TrendingDown className="h-6 w-6 text-expense" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Expenses</h2>
                <p className="text-sm text-muted-foreground">
                  Manage and track your daily spending
                </p>
              </div>
            </div>

            <ExpenseForm
              trigger={
                <Button className="shrink-0 bg-expense text-white hover:bg-expense/90 cursor-pointer">
                  <Plus className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Add Record</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              }
              onSuccess={refreshExpenses}
            />
          </div>

          {/* Bottom row: search + actions + view toggle */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:max-w-48">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Filter transactions..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-9"
              />
            </div>

            <Button
              variant="outline"
              onClick={handleExport}
              className="cursor-pointer"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>

            <BankStatementImport
              onImport={handleBulkImport}
              trigger={
                <Button variant="outline" className="cursor-pointer">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Import - Bank Statement
                </Button>
              }
            />

            <VoiceExpenseButton
              // disabled={isProcessingVoice}
              onTranscript={(text) => {
                setTranscript(text);
                setVoiceError("");
                setVoiceStatus("review");
              }}
            />
            <Dialog
              open={voiceStatus !== "idle"}
              onOpenChange={(open) => {
                if (!open && voiceStatus !== "processing") {
                  setVoiceStatus("idle");
                  setVoiceError("");
                  setTranscript("");
                }
              }}
            >
              <DialogContent
                onPointerDownOutside={(e) => {
                  if (voiceStatus === "processing") {
                    e.preventDefault();
                  }
                }}
                onEscapeKeyDown={(e) => {
                  if (voiceStatus === "processing") {
                    e.preventDefault();
                  }
                }}
                className="sm:max-w-md"
              >
                <DialogHeader>
                  <DialogTitle>
                    {voiceStatus === "review" && "Review Voice Expense"}
                    {voiceStatus === "processing" &&
                      "Understanding Your Expense"}
                    {voiceStatus === "error" && "Unable To Process Expense"}
                  </DialogTitle>
                </DialogHeader>
                {voiceStatus === "review" && (
                  <div className="space-y-4">
                    <div>
                      <p className="mb-2 text-sm text-muted-foreground">
                        Review your expense
                      </p>

                      <Textarea
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        placeholder="Describe your expense..."
                        rows={4}
                        className="resize-none"
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Edit the text if speech recognition made any mistakes.
                    </p>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setTranscript("");
                          setVoiceStatus("idle");
                        }}
                      >
                        Speak Again
                      </Button>

                      <Button
                        onClick={processTranscript}
                        disabled={!transcript.trim()}
                      >
                        Confirm
                      </Button>
                    </div>
                  </div>
                )}

                {voiceStatus === "processing" && (
                  <div className="flex flex-col items-center gap-4 py-6">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />

                    <div className="text-center">
                      <p className="font-medium">{transcript}</p>

                      <p className="text-sm text-muted-foreground mt-2">
                        Gemini is extracting the amount, category, description
                        and date...
                      </p>
                    </div>
                  </div>
                )}

                {voiceStatus === "error" && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Transcript
                      </p>

                      <Textarea
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        rows={4}
                      />
                    </div>

                    <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                      {voiceError}
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setTranscript("");
                          setVoiceError("");
                          setVoiceStatus("idle");
                        }}
                      >
                        Speak Again
                      </Button>

                      <Button
                        onClick={async () => {
                          setVoiceError("");
                          await processTranscript();
                        }}
                      >
                        Retry
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
            {/* View toggle */}
            <div className="flex items-center rounded-lg border border-border overflow-hidden ml-auto">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setView("table")}
                className={`h-9 w-9 rounded-none border-0 cursor-pointer transition-colors ${
                  view === "table"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Table view"
              >
                <Table2 className="h-4 w-4" />
              </Button>
              <div className="w-px h-5 bg-border" />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setView("board")}
                className={`h-9 w-9 rounded-none border-0 cursor-pointer transition-colors ${
                  view === "board"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Board view"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table view */}
      {view === "table" && (
        <Card className="border-border bg-card">
          <CardContent className="overflow-x-auto p-0">
            <ExpensesTable expenses={expenses} onRefresh={refreshExpenses} />
          </CardContent>
        </Card>
      )}

      {/* Board view */}
      {view === "board" && (
        <ExpensesBoard expenses={expenses} onRefresh={refreshExpenses} />
      )}
    </div>
  );
}
