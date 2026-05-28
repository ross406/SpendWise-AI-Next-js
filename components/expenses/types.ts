// ─── Types ────────────────────────────────────────────────────────────────────

import { ExpenseCategory } from "./expenses-table";

export interface DetectedExpense {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  selected: boolean;
}

export interface BankStatementImportProps {
  onImport: (
    expenses: Omit<DetectedExpense, "id" | "selected">[],
  ) => Promise<void>;
  trigger?: React.ReactNode;
}
