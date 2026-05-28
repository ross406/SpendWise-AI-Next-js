import { cn } from "@/lib/utils";
import { DetectedExpense } from "./types";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EXPENSE_CATEGORIES,
  type ExpenseCategory,
} from "@/lib/db/models/expense-types";
import { Trash2 } from "lucide-react";

export function ReviewStep({
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
      <div className="max-h-90 space-y-2 overflow-y-auto pr-1">
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
