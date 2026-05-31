import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ExpensesClient } from "./expenses-client";
import { getExpenses } from "@/app/actions/expenses";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const params = await searchParams;
  const now = new Date();
  const month = params.month ? parseInt(params.month) : now.getMonth() + 1;
  const year = params.year ? parseInt(params.year) : now.getFullYear();

  const expenses = await getExpenses(month, year);
  return (
    <ExpensesClient
      key={`${month}-${year}`}
      initialExpenses={expenses}
      initialMonth={month}
      initialYear={year}
    />
  );
}
