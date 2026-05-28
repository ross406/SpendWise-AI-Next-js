'use client'

import { useState, useCallback } from 'react'
import { TrendingUp, Plus, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { IncomeTable } from '@/components/income/income-table'
import { IncomeForm } from '@/components/income/income-form'
import { getIncomes } from '@/app/actions/income'

interface Income {
  _id: string
  date: string
  description: string
  amount: number
  currency: string
  isRecurring: boolean
  recurringFrequency?: 'monthly' | 'weekly' | 'yearly'
}

interface IncomeClientProps {
  initialIncomes: Income[]
  initialMonth: number
  initialYear: number
}

export function IncomeClient({ initialIncomes, initialMonth, initialYear }: IncomeClientProps) {
  const [incomes, setIncomes] = useState<Income[]>(initialIncomes)
  const [month] = useState(initialMonth)
  const [year] = useState(initialYear)

  const refreshIncomes = useCallback(async () => {
    const data = await getIncomes(month, year)
    setIncomes(data as Income[])
  }, [month, year])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold uppercase tracking-wider">Income</h1>
        <p className="text-sm text-muted-foreground">Managing Your Salaries</p>
      </div>

      {/* Income Card */}
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-income/10">
                <TrendingUp className="h-6 w-6 text-income" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">Income</h2>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Manage your income sources and history</p>
              </div>
            </div>

            <IncomeForm
              trigger={
                <Button className="bg-income text-white hover:bg-income/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Income
                </Button>
              }
              onSuccess={refreshIncomes}
            />
          </div>
        </CardContent>
      </Card>

      {/* Income Table */}
      <Card className="border-border bg-card">
        <CardContent className="p-0">
          <IncomeTable incomes={incomes} onRefresh={refreshIncomes} />
        </CardContent>
      </Card>
    </div>
  )
}
