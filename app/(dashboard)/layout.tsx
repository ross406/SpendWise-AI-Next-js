'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { CurrencyProvider } from '@/lib/contexts/currency-context'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())

  const handleMonthChange = (newMonth: number, newYear: number) => {
    setMonth(newMonth)
    setYear(newYear)
  }

  return (
    <CurrencyProvider>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="ml-56">
          <Header month={month} year={year} onMonthChange={handleMonthChange} />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </CurrencyProvider>
  )
}
