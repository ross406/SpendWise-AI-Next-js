"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CURRENCIES } from "@/lib/services/currency";
import {
  EXPENSE_CATEGORIES,
  type ExpenseCategory,
} from "@/lib/db/models/expense-types";
import { createExpense, updateExpense } from "@/app/actions/expenses";
import { useCurrency } from "@/lib/contexts/currency-context";
import { cn } from "@/lib/utils";

const expenseSchema = z.object({
  date: z.date(),
  description: z.string().min(1, "Description is required"),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string(),
  category: z.string(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

const categoryLabels: Record<string, string> = {
  housing: "Housing",
  utilities: "Utilities",
  gym: "Gym",
  food: "Food",
  transport: "Transport",
  entertainment: "Entertainment",
  healthcare: "Healthcare",
  other: "Other",
};

interface ExpenseFormProps {
  expense?: {
    _id: string;
    date: string;
    description: string;
    amount: number;
    currency: string;
    category: ExpenseCategory;
  };
  trigger: React.ReactNode;
  onSuccess?: () => void;
}

export function ExpenseForm({ expense, trigger, onSuccess }: ExpenseFormProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { currency: userCurrency } = useCurrency();

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date: expense ? new Date(expense.date) : new Date(),
      description: expense?.description || "",
      amount: expense?.amount || 0,
      currency: expense?.currency || userCurrency,
      category: expense?.category || "other",
    },
  });

  const onSubmit = async (data: ExpenseFormData) => {
    setIsLoading(true);
    try {
      const payload = {
        date: format(data.date, "yyyy-MM-dd"),
        description: data.description,
        amount: data.amount,
        currency: data.currency,
        category: data.category as ExpenseCategory,
      };

      if (expense?._id) {
        console.log("updateExpense");
        await updateExpense(expense._id, payload);
      } else {
        console.log("createExpense");
        await createExpense(payload);
      }

      setOpen(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Failed to save expense:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{expense ? "Edit Expense" : "Add Expense"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !form.watch("date") && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.watch("date")
                    ? format(form.watch("date"), "PPP")
                    : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={form.watch("date")}
                  onSelect={(date) => date && form.setValue("date", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="e.g., Grocery shopping"
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={form.watch("category")}
              onValueChange={(value) => form.setValue("category", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {categoryLabels[cat] || cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...form.register("amount", { valueAsNumber: true })}
              />
              {form.formState.errors.amount && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.amount.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Currency</Label>
              <Select
                value={form.watch("currency")}
                onValueChange={(value) => form.setValue("currency", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((curr) => (
                    <SelectItem key={curr.code} value={curr.code}>
                      {curr.symbol} {curr.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "Saving..." : expense ? "Update" : "Add Expense"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
