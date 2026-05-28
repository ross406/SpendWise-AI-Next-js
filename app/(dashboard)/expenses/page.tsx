import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { ExpensesClient } from './expenses-client'
import { getExpenses } from '@/app/actions/expenses'

export default async function ExpensesPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const expenses = await getExpenses(month, year)

  return (
    <ExpensesClient
      initialExpenses={expenses}
      initialMonth={month}
      initialYear={year}
    />
  )
}
