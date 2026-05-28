"use server";
// import "server-only";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db/connection";
import {
  Expense,
  type ExpenseCategory,
  EXPENSE_CATEGORIES,
} from "@/lib/db/models/expense";

export async function getExpenses(
  month: number,
  year: number,
  search?: string,
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  await connectToDatabase();

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const query: Record<string, unknown> = {
    clerkUserId: userId,
    date: { $gte: startDate, $lte: endDate },
  };

  if (search) {
    query.description = { $regex: search, $options: "i" };
  }

  const expenses = await Expense.find(query).sort({ date: -1 }).lean();

  return expenses.map((expense) => ({
    ...expense,
    _id: expense._id.toString(),
    date: expense.date.toISOString(),
    createdAt: expense.createdAt.toISOString(),
    updatedAt: expense.updatedAt.toISOString(),
  }));
}

export async function createExpense(data: {
  date: string;
  description: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
}) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  await connectToDatabase();

  const expense = await Expense.create({
    clerkUserId: userId,
    date: new Date(data.date),
    description: data.description,
    amount: data.amount,
    currency: data.currency,
    category: data.category,
  });

  revalidatePath("/expenses", "max");
  revalidatePath("/dashboard", "max");

  return {
    ...expense.toObject(),
    _id: expense._id.toString(),
    date: expense.date.toISOString(),
  };
}

export async function updateExpense(
  id: string,
  data: Partial<{
    date: string;
    description: string;
    amount: number;
    currency: string;
    category: ExpenseCategory;
  }>,
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  await connectToDatabase();

  const updateData: Record<string, unknown> = { ...data };
  if (data.date) {
    updateData.date = new Date(data.date);
  }

  const expense = await Expense.findOneAndUpdate(
    { _id: id, clerkUserId: userId },
    updateData,
    { new: true },
  );

  if (!expense) {
    throw new Error("Expense not found");
  }

  revalidatePath("/expenses", "max");
  revalidatePath("/dashboard", "max");

  return {
    ...expense.toObject(),
    _id: expense._id.toString(),
    date: expense.date.toISOString(),
  };
}

export async function deleteExpense(id: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  await connectToDatabase();

  const expense = await Expense.findOneAndDelete({
    _id: id,
    clerkUserId: userId,
  });

  if (!expense) {
    throw new Error("Expense not found");
  }

  revalidatePath("/expenses", "max");
  revalidatePath("/dashboard", "max");

  return { success: true };
}

export async function getTotalExpenses(month: number, year: number) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  await connectToDatabase();

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const result = await Expense.aggregate([
    {
      $match: {
        clerkUserId: userId,
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: "$currency",
        total: { $sum: "$amount" },
      },
    },
  ]);

  return result;
}

export async function getExpensesByCategory(month: number, year: number) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  await connectToDatabase();

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const result = await Expense.aggregate([
    {
      $match: {
        clerkUserId: userId,
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: { category: "$category", currency: "$currency" },
        total: { $sum: "$amount" },
      },
    },
  ]);

  return result;
}

export async function exportExpensesToCSV(month: number, year: number) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const expenses = await getExpenses(month, year);

  const headers = ["Date", "Description", "Category", "Amount", "Currency"];
  const rows = expenses.map((expense) => [
    new Date(expense.date).toLocaleDateString(),
    expense.description,
    expense.category,
    expense.amount.toString(),
    expense.currency,
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  return csvContent;
}
