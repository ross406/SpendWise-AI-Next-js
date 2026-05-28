"use client";

import { UserButton } from "@clerk/nextjs";
import { Bell, ChevronDown } from "lucide-react";
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
    if (month === 1) {
      onMonthChange(12, year - 1);
    } else {
      onMonthChange(month - 1, year);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      onMonthChange(1, year + 1);
    } else {
      onMonthChange(month + 1, year);
    }
  };

  return (
    <header className="flex h-16 items-center justify-end gap-4 border-b border-border bg-background px-6">
      {/* Filter Section */}
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-1">
        <div className="flex items-center gap-2 px-3 py-1.5 text-xs">
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
          <ChevronDown className="mr-1 h-3 w-3 rotate-90" />
          {months[month - 2 < 0 ? 11 : month - 2]
            ?.slice(0, 3)
            .toUpperCase()}{" "}
          {String(new Date().getDate()).padStart(2, "0")}
        </Button>

        {/* Current Month Dropdown */}
        <Select
          value={`${year}-${month}`}
          onValueChange={(value) => {
            const [y, m] = value.split("-").map(Number);
            onMonthChange(m, y);
          }}
        >
          <SelectTrigger className="h-8 w-28 rounded-lg border-0 bg-transparent px-3 text-xs font-medium shadow-none focus:ring-0 cursor-pointer">
            <SelectValue>
              {months[month - 1]?.toUpperCase()} {year}
            </SelectValue>
            {/* <ChevronDown className="ml-1 h-3 w-3" /> */}
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
          {months[month % 12]?.slice(0, 3).toUpperCase()}{" "}
          {String(new Date().getDate()).padStart(2, "0")}
          <ChevronDown className="ml-1 h-3 w-3 -rotate-90" />
        </Button>
      </div>

      {/* Currency Selector */}
      <Select
        value={currency}
        onValueChange={(value) => setCurrency(value as typeof currency)}
      >
        <SelectTrigger className="h-9 w-24 border-border bg-card text-xs cursor-pointer">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CURRENCIES.map((curr) => (
            <SelectItem key={curr.code} value={curr.code} className="text-xs">
              {curr.symbol} {curr.code}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Notifications */}
      {/* <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5" />
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
          3
        </span>
      </Button> */}

      {/* User Button */}
      <UserButton
        appearance={{
          elements: {
            avatarBox: "h-9 w-9",
          },
        }}
      />
    </header>
  );
}
