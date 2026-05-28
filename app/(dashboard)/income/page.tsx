import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { IncomeClient } from './income-client'
import { getIncomes } from '@/app/actions/income'

export default async function IncomePage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const incomes = await getIncomes(month, year)

  return (
    <IncomeClient
      initialIncomes={incomes}
      initialMonth={month}
      initialYear={year}
    />
  )
}
