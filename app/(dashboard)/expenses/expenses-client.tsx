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
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExpensesTable } from "@/components/expenses/expenses-table";
import { ExpensesBoard } from "@/components/expenses/expenses-board";
import { ExpenseForm } from "@/components/expenses/expense-form";
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

export function ExpensesClient({
  initialExpenses,
  initialMonth,
  initialYear,
}: ExpensesClientProps) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<ViewMode>("table");

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
