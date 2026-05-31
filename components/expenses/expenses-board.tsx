"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Pencil, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useCurrency } from "@/lib/contexts/currency-context";
import { ExpenseForm } from "./expense-form";
import { deleteExpense, updateExpense } from "@/app/actions/expenses";
import { EXPENSE_CATEGORIES } from "@/lib/db/models/expense-types";
import type { ExpenseCategory } from "@/lib/db/models/expense-types";

interface Expense {
  _id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
}

interface ExpensesBoardProps {
  expenses: Expense[];
  onRefresh: () => void;
}

const categoryLabels: Record<string, string> = {
  housing: "Housing",
  utilities: "Utilities",
  gym: "Gym",
  food: "Food",
  transport: "Transport",
  entertainment: "Entertainment",
  healthcare: "Healthcare",
  shopping: "Shopping",
  other: "Other",
};

export function ExpensesBoard({ expenses, onRefresh }: ExpensesBoardProps) {
  const { formatAmount } = useCurrency();
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Group expenses by category
  const grouped = EXPENSE_CATEGORIES.reduce<Record<string, Expense[]>>(
    (acc, cat) => {
      acc[cat] = expenses.filter((e) => e.category === cat);
      return acc;
    },
    {},
  );

  /* ── Drag handlers ─────────────────────────────────────── */

  const handleDragStart = (e: React.DragEvent, expenseId: string) => {
    e.dataTransfer.setData("expenseId", expenseId);
    e.dataTransfer.effectAllowed = "move";
    setDraggingId(expenseId);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverCategory(null);
  };

  const handleDragOver = (e: React.DragEvent, category: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverCategory(category);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if leaving the column element itself, not a child
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const { clientX, clientY } = e;
    if (
      clientX < rect.left ||
      clientX >= rect.right ||
      clientY < rect.top ||
      clientY >= rect.bottom
    ) {
      setDragOverCategory(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, category: ExpenseCategory) => {
    e.preventDefault();
    const expenseId = e.dataTransfer.getData("expenseId");
    setDragOverCategory(null);
    setDraggingId(null);

    const expense = expenses.find((ex) => ex._id === expenseId);
    if (!expense || expense.category === category) return;

    try {
      await updateExpense(expenseId, { category });
      onRefresh();
    } catch (err) {
      console.error("Failed to update expense category:", err);
    }
  };

  /* ── Delete handler ────────────────────────────────────── */

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense(id);
      onRefresh();
    } catch (error) {
      console.error("Failed to delete expense:", error);
    }
  };

  /* ── Render ────────────────────────────────────────────── */

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 pt-1">
      {EXPENSE_CATEGORIES.map((category) => {
        const columnExpenses = grouped[category] || [];
        const isOver = dragOverCategory === category;
        const columnTotal = columnExpenses.reduce(
          (sum, e) => sum + e.amount,
          0,
        );
        // Use the currency of the first expense, or fall back to a blank string
        const columnCurrency = columnExpenses[0]?.currency ?? "";

        return (
          <div
            key={category}
            className={`
              flex-none w-60 flex flex-col rounded-xl border transition-all duration-150
              ${
                isOver
                  ? "border-primary/50 bg-primary/5 shadow-md"
                  : "border-border bg-muted/20"
              }
            `}
            onDragOver={(e) => handleDragOver(e, category)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, category as ExpenseCategory)}
          >
            {/* Column header */}
            <div className="flex flex-col gap-1.5 px-3 py-2.5 border-b border-border/60">
              <div className="flex items-center justify-between">
                <Badge
                  className={`badge-${category} text-xs uppercase tracking-wide`}
                >
                  {categoryLabels[category]}
                </Badge>
                {columnExpenses.length > 0 && (
                  <span className="text-xs font-semibold text-muted-foreground tabular-nums bg-muted rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                    {columnExpenses.length}
                  </span>
                )}
              </div>
              {columnExpenses.length > 0 && (
                <span className="text-sm font-bold text-expense tabular-nums">
                  Total: -{formatAmount(columnTotal, columnCurrency)}
                </span>
              )}
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-2 p-2 min-h-[100px] flex-1">
              {columnExpenses.map((expense) => {
                const date = new Date(expense.date);
                const isDragging = draggingId === expense._id;

                return (
                  <div
                    key={expense._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, expense._id)}
                    onDragEnd={handleDragEnd}
                    className={`
                      group rounded-lg border bg-card p-3
                      cursor-grab active:cursor-grabbing
                      transition-all duration-150 select-none
                      ${
                        isDragging
                          ? "opacity-30 scale-95 shadow-none"
                          : "opacity-100 hover:border-primary/30 hover:shadow-sm hover:-translate-y-0.5"
                      }
                    `}
                  >
                    {/* Amount row */}
                    <div className="flex items-start justify-between gap-1 mb-1.5">
                      <span className="font-bold text-expense text-sm leading-tight">
                        -{formatAmount(expense.amount, expense.currency)}
                      </span>
                      <GripVertical className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0 mt-0.5" />
                    </div>

                    {/* Description */}
                    <p
                      className="text-sm text-foreground/90 truncate leading-snug"
                      title={expense.description}
                    >
                      {expense.description}
                    </p>

                    {/* Date + action buttons */}
                    <div className="flex items-center justify-between mt-2.5">
                      <span className="text-xs text-muted-foreground">
                        {format(date, "MMM dd, yyyy")}
                      </span>

                      {/* Buttons — fade in on hover */}
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-100">
                        <ExpenseForm
                          expense={expense}
                          trigger={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 hover:bg-muted"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          }
                          onSuccess={onRefresh}
                        />

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Expense
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this expense
                                record? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(expense._id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Empty column drop target */}
              {columnExpenses.length === 0 && (
                <div
                  className={`
                    flex-1 rounded-lg border-2 border-dashed
                    flex items-center justify-center min-h-[72px]
                    transition-colors duration-150
                    ${
                      isOver
                        ? "border-primary/40 bg-primary/5"
                        : "border-border/40"
                    }
                  `}
                >
                  <span className="text-xs text-muted-foreground/40 select-none">
                    Drop here
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
