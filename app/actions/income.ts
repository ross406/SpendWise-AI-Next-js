"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db/connection";
import { Income, type IIncome } from "@/lib/db/models/income";
import { getMonthDateRange } from "@/lib/utils";

export async function getIncomes(month: number, year: number) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  await connectToDatabase();

  const { startDate, endDate } = getMonthDateRange(month, year);

  const incomes = await Income.find({
    clerkUserId: userId,
    date: { $gte: startDate, $lte: endDate },
  })
    .sort({ date: -1 })
    .lean();

  return incomes.map((income) => ({
    ...income,
    _id: income._id.toString(),
    date: income.date.toISOString().split("T")[0],
    createdAt: income.createdAt.toISOString(),
    updatedAt: income.updatedAt.toISOString(),
  }));
}

export async function createIncome(data: {
  date: string;
  description: string;
  amount: number;
  currency: string;
  isRecurring: boolean;
  recurringFrequency?: "monthly" | "weekly" | "yearly";
}) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  await connectToDatabase();

  const income = await Income.create({
    clerkUserId: userId,
    date: new Date(data.date),
    description: data.description,
    amount: data.amount,
    currency: data.currency,
    isRecurring: data.isRecurring,
    recurringFrequency: data.isRecurring ? data.recurringFrequency : undefined,
  });

  revalidatePath("/income", "layout");
  revalidatePath("/dashboard", "layout");

  return {
    ...income.toObject(),
    _id: income._id.toString(),
    date: income.date.toISOString().split("T")[0],
  };
}

export async function updateIncome(
  id: string,
  data: Partial<{
    date: string;
    description: string;
    amount: number;
    currency: string;
    isRecurring: boolean;
    recurringFrequency?: "monthly" | "weekly" | "yearly";
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

  const income = await Income.findOneAndUpdate(
    { _id: id, clerkUserId: userId },
    updateData,
    { new: true },
  );

  if (!income) {
    throw new Error("Income not found");
  }

  revalidatePath("/income", "layout");
  revalidatePath("/dashboard", "layout");

  return {
    ...income.toObject(),
    _id: income._id.toString(),
    date: income.date.toISOString().split("T")[0],
  };
}

export async function deleteIncome(id: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  await connectToDatabase();

  const income = await Income.findOneAndDelete({
    _id: id,
    clerkUserId: userId,
  });

  if (!income) {
    throw new Error("Income not found");
  }

  revalidatePath("/income", "layout");
  revalidatePath("/dashboard", "layout");

  return { success: true };
}

export async function getTotalIncome(month: number, year: number) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  await connectToDatabase();

  const { startDate, endDate } = getMonthDateRange(month, year);

  const result = await Income.aggregate([
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
