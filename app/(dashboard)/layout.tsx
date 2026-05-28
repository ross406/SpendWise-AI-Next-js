"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { CurrencyProvider } from "@/lib/contexts/currency-context";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const now = new Date();

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  // Initialize month/year from URL params
  useEffect(() => {
    const urlMonth = searchParams.get("month");
    const urlYear = searchParams.get("year");

    if (urlMonth && urlYear) {
      setMonth(parseInt(urlMonth));
      setYear(parseInt(urlYear));
    }
  }, [searchParams]);

  const handleMonthChange = (newMonth: number, newYear: number) => {
    setMonth(newMonth);
    setYear(newYear);
    // Update URL with new month/year
    router.push(`?month=${newMonth}&year=${newYear}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-56">
        <Header month={month} year={year} onMonthChange={handleMonthChange} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CurrencyProvider>
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
      </Suspense>
    </CurrencyProvider>
  );
}
