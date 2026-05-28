"use client";

import { format } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { deleteExpense } from "@/app/actions/expenses";

export type ExpenseCategory =
  | "housing"
  | "utilities"
  | "gym"
  | "food"
  | "transport"
  | "entertainment"
  | "healthcare"
  | "shopping"
  | "other";

interface Expense {
  _id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
}

interface ExpensesTableProps {
  expenses: Expense[];
  onRefresh: () => void;
}

const categoryLabels: Record<string, string> = {
  housing: "HOUSING",
  utilities: "UTILITIES",
  gym: "GYM",
  food: "FOOD",
  transport: "TRANSPORT",
  entertainment: "ENTERTAINMENT",
  healthcare: "HEALTHCARE",
  shopping: "SHOPPING",
  other: "OTHER",
};

// Returns "1st", "2nd", "3rd", "4th" etc.
function ordinalDay(date: Date): string {
  const d = date.getDate();
  const s = ["th", "st", "nd", "rd"];
  const v = d % 100;
  return d + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function ExpensesTable({ expenses, onRefresh }: ExpensesTableProps) {
  const { formatAmount } = useCurrency();

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense(id);
      onRefresh();
    } catch (error) {
      console.error("Failed to delete expense:", error);
    }
  };

  if (expenses.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-muted-foreground">
        No expense records found for this period
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Date
          </TableHead>
          <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Description
          </TableHead>
          <TableHead className="hidden sm:table-cell text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Category
          </TableHead>
          <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Amount
          </TableHead>
          <TableHead className="w-20" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.map((expense) => {
          const date = new Date(expense.date);
          return (
            <TableRow key={expense._id} className="border-border">
              {/* Ordinal on mobile, full date on sm+ */}
              <TableCell className="font-medium whitespace-nowrap">
                <span className="sm:hidden">{ordinalDay(date)}</span>
                <span className="hidden sm:inline">
                  {format(date, "MMM dd, yyyy")}
                </span>
              </TableCell>

              {/* Truncated description */}
              <TableCell className="max-w-30 sm:max-w-60">
                <span className="block truncate" title={expense.description}>
                  {expense.description}
                </span>
                {/* Show category badge inline under description on mobile */}
                <Badge
                  className={`badge-${expense.category} mt-1 text-xs uppercase sm:hidden`}
                >
                  {categoryLabels[expense.category] || expense.category}
                </Badge>
              </TableCell>

              {/* Category column — hidden on mobile (shown inline above) */}
              <TableCell className="hidden sm:table-cell">
                <Badge
                  className={`badge-${expense.category} text-xs uppercase`}
                >
                  {categoryLabels[expense.category] || expense.category}
                </Badge>
              </TableCell>

              <TableCell className="text-right font-semibold text-expense whitespace-nowrap">
                -{formatAmount(expense.amount, expense.currency)}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <ExpenseForm
                    expense={expense}
                    trigger={
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    }
                    onSuccess={onRefresh}
                  />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Expense</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this expense record?
                          This action cannot be undone.
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
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
