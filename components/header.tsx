'use client'

import { UserButton } from '@clerk/nextjs'
import { Bell, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCurrency } from '@/lib/contexts/currency-context'
import { CURRENCIES } from '@/lib/services/currency'

interface HeaderProps {
  month: number
  year: number
  onMonthChange: (month: number, year: number) => void
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export function Header({ month, year, onMonthChange }: HeaderProps) {
  const { currency, setCurrency } = useCurrency()

  const handlePrevMonth = () => {
    if (month === 1) {
      onMonthChange(12, year - 1)
    } else {
      onMonthChange(month - 1, year)
    }
  }

  const handleNextMonth = () => {
    if (month === 12) {
      onMonthChange(1, year + 1)
    } else {
      onMonthChange(month + 1, year)
    }
  }

  return (
    <header className="flex h-16 items-center justify-end gap-4 border-b border-border bg-background px-6">
      {/* Filter Section */}
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-1">
        <div className="flex items-center gap-2 px-3 py-1.5 text-xs">
          <span className="text-muted-foreground">FILTER BY</span>
          <span className="font-semibold">MONTH</span>
        </div>
        
        <Button
          variant="secondary"
          size="sm"
          className="h-8 rounded-lg px-3 text-xs font-medium"
          onClick={handlePrevMonth}
        >
          <ChevronDown className="mr-1 h-3 w-3 rotate-90" />
          {months[month - 1]?.slice(0, 3).toUpperCase()} {String(new Date().getDate()).padStart(2, '0')}
        </Button>
        
        <Button
          variant="secondary"
          size="sm"
          className="h-8 rounded-lg px-3 text-xs font-medium"
        >
          {months[month - 1]?.toUpperCase()} {year}
          <ChevronDown className="ml-1 h-3 w-3" />
        </Button>
      </div>

      {/* Currency Selector */}
      <Select value={currency} onValueChange={(value) => setCurrency(value as typeof currency)}>
        <SelectTrigger className="h-9 w-24 border-border bg-card text-xs">
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
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5" />
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
          3
        </span>
      </Button>

      {/* User Button */}
      <UserButton
        afterSignOutUrl="/"
        appearance={{
          elements: {
            avatarBox: 'h-9 w-9',
          },
        }}
      />
    </header>
  )
}
