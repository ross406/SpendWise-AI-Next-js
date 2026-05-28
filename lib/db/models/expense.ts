// import "server-only";

import mongoose, { Schema, models } from "mongoose";
import {
  EXPENSE_CATEGORIES,
  type ExpenseCategory,
  type IExpense,
} from "./expense-types";

export { EXPENSE_CATEGORIES, type ExpenseCategory, type IExpense };

const expenseSchema = new Schema<IExpense>(
  {
    clerkUserId: { type: String, required: true, index: true },
    date: { type: Date, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: "USD" },
    category: {
      type: String,
      required: true,
      enum: EXPENSE_CATEGORIES,
      default: "other",
    },
  },
  { timestamps: true },
);

expenseSchema.index({ clerkUserId: 1, date: -1 });
expenseSchema.index({ clerkUserId: 1, category: 1 });

export const Expense =
  models.Expense || mongoose.model<IExpense>("Expense", expenseSchema);
