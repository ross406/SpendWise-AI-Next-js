"use client";

import { UserButton } from "@clerk/nextjs";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrency } from "@/lib/contexts/currency-context";
import { CURRENCIES } from "@/lib/services/currency";

interface HeaderProps {
  month: number;
  year: number;
  onMonthChange: (month: number, year: number) => void;
}

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

export function Header({ month, year, onMonthChange }: HeaderProps) {
  const { currency, setCurrency } = useCurrency();

  const handlePrevMonth = () => {
    if (month === 1) onMonthChange(12, year - 1);
    else onMonthChange(month - 1, year);
  };

  const handleNextMonth = () => {
    if (month === 12) onMonthChange(1, year + 1);
    else onMonthChange(month + 1, year);
  };

  return (
    <header className="border-b border-border bg-background px-4 md:px-6">
      {/* Single row on desktop, two rows on mobile */}
      <div className="flex h-auto flex-col gap-2 py-3 md:h-16 md:flex-row md:items-center md:justify-end md:gap-4 md:py-0">
        {/* Top row on mobile: currency + user */}
        <div className="flex items-center justify-between md:hidden">
          <span className="text-xs font-medium text-muted-foreground">
            {months[month - 1]} {year}
          </span>
          <div className="flex items-center gap-2">
            <Select
              value={currency}
              onValueChange={(value) => setCurrency(value as typeof currency)}
            >
              <SelectTrigger className="h-8 w-20 border-border bg-card text-xs cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((curr) => (
                  <SelectItem
                    key={curr.code}
                    value={curr.code}
                    className="text-xs"
                  >
                    {curr.symbol} {curr.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <UserButton appearance={{ elements: { avatarBox: "h-8 w-8" } }} />
          </div>
        </div>

        {/* Month filter row — full width on mobile, auto on desktop */}
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-1">
          <div className="hidden items-center gap-2 px-3 py-1.5 text-xs sm:flex">
            <span className="text-muted-foreground">FILTER BY</span>
            <span className="font-semibold">MONTH</span>
          </div>

          {/* Prev Month */}
          <Button
            variant="secondary"
            size="sm"
            className="h-8 rounded-lg px-3 text-xs font-medium cursor-pointer"
            onClick={handlePrevMonth}
          >
            <ChevronDown className="h-3 w-3 rotate-90" />
            {/* Show abbreviated month label only on sm+ */}
            <span className="ml-1 hidden sm:inline">
              {months[month - 2 < 0 ? 11 : month - 2]
                ?.slice(0, 3)
                .toUpperCase()}
            </span>
          </Button>

          {/* Current Month Dropdown */}
          <Select
            value={`${year}-${month}`}
            onValueChange={(value) => {
              const [y, m] = value.split("-").map(Number);
              onMonthChange(m, y);
            }}
          >
            <SelectTrigger className="h-8 rounded-lg border-0 bg-transparent px-3 text-xs font-medium shadow-none focus:ring-0 cursor-pointer">
              <SelectValue>
                {months[month - 1]?.toUpperCase()} {year}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {Array.from({ length: 11 }, (_, yi) => {
                const y = new Date().getFullYear() - 5 + yi;
                return months.map((m, mi) => (
                  <SelectItem
                    key={`${y}-${mi + 1}`}
                    value={`${y}-${mi + 1}`}
                    className="text-xs"
                  >
                    {m.toUpperCase()} {y}
                  </SelectItem>
                ));
              })}
            </SelectContent>
          </Select>

          {/* Next Month */}
          <Button
            variant="secondary"
            size="sm"
            className="h-8 rounded-lg px-3 text-xs font-medium cursor-pointer"
            onClick={handleNextMonth}
          >
            <span className="mr-1 hidden sm:inline">
              {months[month % 12]?.slice(0, 3).toUpperCase()}
            </span>
            <ChevronDown className="h-3 w-3 -rotate-90" />
          </Button>
        </div>

        {/* Currency + User — hidden on mobile (shown in top row above) */}
        <div className="hidden items-center gap-4 md:flex">
          <Select
            value={currency}
            onValueChange={(value) => setCurrency(value as typeof currency)}
          >
            <SelectTrigger className="h-9 w-24 border-border bg-card text-xs cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((curr) => (
                <SelectItem
                  key={curr.code}
                  value={curr.code}
                  className="text-xs"
                >
                  {curr.symbol} {curr.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <UserButton appearance={{ elements: { avatarBox: "h-9 w-9" } }} />
        </div>
      </div>
    </header>
  );
}
