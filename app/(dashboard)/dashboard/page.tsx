import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { DashboardClient } from './dashboard-client'
import { getIncomes, getTotalIncome } from '@/app/actions/income'
import { getExpenses, getTotalExpenses, getExpensesByCategory } from '@/app/actions/expenses'

export default async function DashboardPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  const user = await currentUser()
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  // Fetch data in parallel
  const [incomes, totalIncome, expenses, totalExpenses, expensesByCategory] = await Promise.all([
    getIncomes(month, year),
    getTotalIncome(month, year),
    getExpenses(month, year),
    getTotalExpenses(month, year),
    getExpensesByCategory(month, year),
  ])

  return (
    <DashboardClient
      userName={user?.firstName || 'User'}
      initialIncomes={incomes}
      initialTotalIncome={totalIncome}
      initialExpenses={expenses}
      initialTotalExpenses={totalExpenses}
      initialExpensesByCategory={expensesByCategory}
      initialMonth={month}
      initialYear={year}
    />
  )
}
