'use client'

import { useState, useCallback } from 'react'
import { TrendingDown, Plus, ExternalLink, Search, Download } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ExpensesTable } from '@/components/expenses/expenses-table'
import { ExpenseForm } from '@/components/expenses/expense-form'
import { getExpenses, exportExpensesToCSV } from '@/app/actions/expenses'
import type { ExpenseCategory } from '@/lib/db/models/expense'

interface Expense {
  _id: string
  date: string
  description: string
  amount: number
  currency: string
  category: ExpenseCategory
}

interface ExpensesClientProps {
  initialExpenses: Expense[]
  initialMonth: number
  initialYear: number
}

export function ExpensesClient({ initialExpenses, initialMonth, initialYear }: ExpensesClientProps) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses)
  const [search, setSearch] = useState('')
  const [month] = useState(initialMonth)
  const [year] = useState(initialYear)

  const refreshExpenses = useCallback(async () => {
    const data = await getExpenses(month, year, search || undefined)
    setExpenses(data as Expense[])
  }, [month, year, search])

  const handleSearch = async (value: string) => {
    setSearch(value)
    const data = await getExpenses(month, year, value || undefined)
    setExpenses(data as Expense[])
  }

  const handleExport = async () => {
    try {
      const csv = await exportExpensesToCSV(month, year)
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `expenses-${year}-${month.toString().padStart(2, '0')}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export expenses:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold uppercase tracking-wider">Expenses</h1>
        <p className="text-sm text-muted-foreground">Managing Your Expenses</p>
      </div>

      {/* Expenses Card */}
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-expense/10">
                <TrendingDown className="h-6 w-6 text-expense" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">Expenses</h2>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Manage and track your daily spending</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Filter transactions..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-48 pl-9"
                />
              </div>

              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>

              <ExpenseForm
                trigger={
                  <Button className="bg-expense text-white hover:bg-expense/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Record
                  </Button>
                }
                onSuccess={refreshExpenses}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card className="border-border bg-card">
        <CardContent className="p-0">
          <ExpensesTable expenses={expenses} onRefresh={refreshExpenses} />
        </CardContent>
      </Card>
    </div>
  )
}
