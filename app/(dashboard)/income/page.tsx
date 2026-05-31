import { unstable_noStore as noStore } from "next/cache";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { IncomeClient } from "./income-client";
import { getIncomes } from "@/app/actions/income";

export default async function IncomePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  noStore();
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const params = await searchParams;
  const now = new Date();
  const month = params.month ? parseInt(params.month) : now.getMonth() + 1;
  const year = params.year ? parseInt(params.year) : now.getFullYear();

  const incomes = await getIncomes(month, year);

  return (
    <IncomeClient
      key={`${month}-${year}`}
      initialIncomes={incomes}
      initialMonth={month}
      initialYear={year}
    />
  );
}
