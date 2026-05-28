export const EXPENSE_CATEGORIES = [
  "housing",
  "utilities",
  "gym",
  "food",
  "transport",
  "entertainment",
  "healthcare",
  "shopping",
  "other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export interface IExpense {
  _id: string;
  clerkUserId: string;
  date: Date;
  description: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  createdAt: Date;
  updatedAt: Date;
}
