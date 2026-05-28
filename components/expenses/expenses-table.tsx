'use client'

import { format } from 'date-fns'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useCurrency } from '@/lib/contexts/currency-context'
import { ExpenseForm } from './expense-form'
import { deleteExpense } from '@/app/actions/expenses'
import type { ExpenseCategory } from '@/lib/db/models/expense'

interface Expense {
  _id: string
  date: string
  description: string
  amount: number
  currency: string
  category: ExpenseCategory
}

interface ExpensesTableProps {
  expenses: Expense[]
  onRefresh: () => void
}

const categoryLabels: Record<string, string> = {
  housing: 'HOUSING',
  utilities: 'UTILITIES',
  gym: 'GYM',
  food: 'FOOD',
  transport: 'TRANSPORT',
  entertainment: 'ENTERTAINMENT',
  healthcare: 'HEALTHCARE',
  shopping: 'SHOPPING',
  other: 'OTHER',
}

export function ExpensesTable({ expenses, onRefresh }: ExpensesTableProps) {
  const { formatAmount } = useCurrency()

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense(id)
      onRefresh()
    } catch (error) {
      console.error('Failed to delete expense:', error)
    }
  }

  if (expenses.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-muted-foreground">
        No expense records found for this period
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Date
          </TableHead>
          <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Description
          </TableHead>
          <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Category
          </TableHead>
          <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Amount
          </TableHead>
          <TableHead className="w-24" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.map((expense) => (
          <TableRow key={expense._id} className="border-border">
            <TableCell className="font-medium">
              {format(new Date(expense.date), 'MMM dd, yyyy')}
            </TableCell>
            <TableCell>{expense.description}</TableCell>
            <TableCell>
              <Badge className={`badge-${expense.category} text-xs uppercase`}>
                {categoryLabels[expense.category] || expense.category}
              </Badge>
            </TableCell>
            <TableCell className="text-right font-semibold text-expense">
              -{formatAmount(expense.amount, expense.currency)}
            </TableCell>
            <TableCell>
              <div className="flex items-center justify-end gap-1">
                <ExpenseForm
                  expense={expense}
                  trigger={
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  }
                  onSuccess={onRefresh}
                />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Expense</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this expense record? This action cannot be
                        undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(expense._id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
