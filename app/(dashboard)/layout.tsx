"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { CurrencyProvider } from "@/lib/contexts/currency-context";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const now = new Date();

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    router.push(`${pathname}?month=${newMonth}&year=${newYear}`);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex min-h-screen flex-1 flex-col md:ml-56">
        {/* Mobile header */}
        <div className="flex items-center gap-2 border-b border-border bg-background p-4 md:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-2 hover:bg-accent"
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
          <span className="text-sm font-semibold">SPENDWISE AI</span>
        </div>
        <Header month={month} year={year} onMonthChange={handleMonthChange} />
        <main className="flex-1 p-6">{children}</main>
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
