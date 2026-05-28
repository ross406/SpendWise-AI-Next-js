export const EXPENSE_CATEGORIES = [
  "housing",
  "utilities",
  "food",
  "gym",
  "transport",
  "entertainment",
  "healthcare",
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
