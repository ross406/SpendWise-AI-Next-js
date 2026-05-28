"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Sparkles,
  ArrowRight,
  Calendar,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ExpenditureChart } from "@/components/charts/expenditure-chart";
import { CategoryDonut } from "@/components/charts/category-donut";
import { useCurrency } from "@/lib/contexts/currency-context";

interface DashboardClientProps {
  userName: string;
  initialIncomes: Array<{ _id: string; amount: number; currency: string }>;
  initialTotalIncome: Array<{ _id: string; total: number }>;
  initialExpenses: Array<{
    _id: string;
    amount: number;
    currency: string;
    category: string;
  }>;
  initialTotalExpenses: Array<{ _id: string; total: number }>;
  initialExpensesByCategory: Array<{
    _id: { category: string; currency: string };
    total: number;
  }>;
  initialMonth: number;
  initialYear: number;
}

const financialFacts = [
  "Saving just $5 a day can grow to over $100,000 in 20 years with 7% interest.",
  "The 50/30/20 rule: 50% needs, 30% wants, 20% savings.",
  "Compound interest is the eighth wonder of the world.",
  "An emergency fund should cover 3-6 months of expenses.",
];

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function DashboardClient({
  userName,
  initialTotalIncome,
  initialTotalExpenses,
  initialExpensesByCategory,
  initialMonth,
  initialYear,
}: DashboardClientProps) {
  const { formatAmount, convertAmount, currency } = useCurrency();
  const [randomFact, setRandomFact] = useState<string>(financialFacts[0]);

  useEffect(() => {
    setRandomFact(
      financialFacts[Math.floor(Math.random() * financialFacts.length)],
    );
  }, []);

  const totalIncome = initialTotalIncome.reduce(
    (sum, item) => sum + convertAmount(item.total, item._id),
    0,
  );
  const totalExpenses = initialTotalExpenses.reduce(
    (sum, item) => sum + convertAmount(item.total, item._id),
    0,
  );
  const balance = totalIncome - totalExpenses;
  const usagePercent =
    totalIncome > 0 ? ((totalExpenses / totalIncome) * 100).toFixed(1) : "0";

  const categoryData = initialExpensesByCategory.map((item) => ({
    category: item._id.category,
    amount: item.total,
    currency: item._id.currency,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold uppercase tracking-wider">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, {userName}
        </p>
      </div>

      {/* Financial Fun Fact */}
      <Card className="border-primary/20 bg-card">
        <CardContent className="flex items-start gap-4 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-primary">
              Financial Fun Fact
            </p>
            <p className="text-sm font-semibold text-foreground">
              {randomFact}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Total Income
              </p>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-income/20">
                <TrendingUp className="h-4 w-4 text-income" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-income">
              {formatAmount(totalIncome)}
            </p>
            <p className="text-xs text-muted-foreground">
              {months[initialMonth - 1]} {initialYear}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Total Expenses
              </p>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-expense/20">
                <TrendingDown className="h-4 w-4 text-expense" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-expense">
              {formatAmount(totalExpenses)}
            </p>
            <p className="text-xs text-muted-foreground">
              {months[initialMonth - 1]} {initialYear}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Remaining Balance
              </p>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-balance/20">
                <Wallet className="h-4 w-4 text-balance" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {formatAmount(balance)}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <p className="text-xs text-muted-foreground">Usage Flow</p>
              <span className="text-xs font-semibold text-primary">
                {usagePercent}%
              </span>
            </div>
            <Progress value={Number(usagePercent)} className="mt-1 h-1" />
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-bold uppercase tracking-wider">
                Expenditure Flow
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Monthly Category Analysis
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <ExpenditureChart data={categoryData} />
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-bold uppercase tracking-wider">
                Market Share
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Total Spent Allocation
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <CategoryDonut data={categoryData} />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Records */}
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-bold uppercase tracking-wider">
                Upcoming Records
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Bills & Dues Due Soon
              </p>
            </div>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-2 rounded-lg bg-secondary/50 p-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-card">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    House Rent{" "}
                    <Badge variant="secondary" className="ml-2 text-[10px]">
                      BILL
                    </Badge>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Jun 01, {initialYear}
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-semibold">{formatAmount(13500)}</p>
                <Badge className="badge-housing text-[10px]">HOUSING</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 rounded-lg bg-secondary/50 p-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-card">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    Electricity{" "}
                    <Badge variant="secondary" className="ml-2 text-[10px]">
                      BILL
                    </Badge>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Jun 15, {initialYear}
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-semibold">{formatAmount(2000)}</p>
                <Badge className="badge-utilities text-[10px]">UTILITIES</Badge>
              </div>
            </div>

            <Button
              variant="ghost"
              className="w-full text-xs text-muted-foreground"
            >
              Full Calendar View
            </Button>
          </CardContent>
        </Card>

        {/* Savings Goals */}
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-bold uppercase tracking-wider">
                Savings Goals
              </CardTitle>
            </div>
            <Badge className="bg-income/20 text-income text-[10px]">
              ACTIVE
            </Badge>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Target className="h-16 w-16 text-muted-foreground/30" />
            <p className="mt-4 text-sm text-muted-foreground">
              No savings goals set
            </p>
            <p className="text-xs text-muted-foreground">
              Start tracking your savings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Financial Assistant */}
      <Card className="border-primary/20 bg-card">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-sm font-bold uppercase tracking-wider">
                AI Financial Assistant
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Smart health check for {months[initialMonth - 1]} {initialYear}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 2x2 on mobile, 4 across on desktop */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card className="border-border bg-secondary/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-primary">
                  <TrendingUp className="h-4 w-4 shrink-0" />
                  <span className="text-xs font-medium">Current Outlook</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {balance > 0
                    ? "Your spending path looks stable. Keep maintaining this pace."
                    : "Consider reviewing your expenses to improve your balance."}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-secondary/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-expense">
                  <Target className="h-4 w-4 shrink-0" />
                  <span className="text-xs font-medium">Main Focus</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {categoryData[0]
                    ? `${categoryData[0].category.charAt(0).toUpperCase() + categoryData[0].category.slice(1)} takes the lead this month. Is this as planned?`
                    : "Add expenses to see your main spending category."}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-secondary/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-income">
                  <Wallet className="h-4 w-4 shrink-0" />
                  <span className="text-xs font-medium">Savings Status</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {balance > 0
                    ? `You've reserved ${formatAmount(balance)} so far. Good job!`
                    : "Set up savings goals to track your progress."}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-secondary/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-chart-3">
                  <Sparkles className="h-4 w-4 shrink-0" />
                  <span className="text-xs font-medium">Quick Tip</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {balance > totalIncome * 0.2
                    ? "Strong surplus detected. Consider moving some to your high-yield goals."
                    : "Try the 50/30/20 rule to balance spending and savings."}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Deep Analysis CTA — stacks on mobile */}
          <Card className="mt-4 border-border bg-secondary/30">
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Ready for Deeper Analysis?
                  </p>
                  <p className="text-sm font-semibold">
                    Unlock Exhaustive Financial Intelligence
                  </p>
                </div>
              </div>
              <Button variant="ghost" className="w-full text-sm sm:w-auto">
                Analyze Deep Strategic Depth{" "}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
