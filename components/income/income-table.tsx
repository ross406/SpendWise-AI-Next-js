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
import { IncomeForm } from './income-form'
import { deleteIncome } from '@/app/actions/income'

interface Income {
  _id: string
  date: string
  description: string
  amount: number
  currency: string
  isRecurring: boolean
  recurringFrequency?: 'monthly' | 'weekly' | 'yearly'
}

interface IncomeTableProps {
  incomes: Income[]
  onRefresh: () => void
}

export function IncomeTable({ incomes, onRefresh }: IncomeTableProps) {
  const { formatAmount } = useCurrency()

  const handleDelete = async (id: string) => {
    try {
      await deleteIncome(id)
      onRefresh()
    } catch (error) {
      console.error('Failed to delete income:', error)
    }
  }

  if (incomes.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-muted-foreground">
        No income records found for this period
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
            Recurring
          </TableHead>
          <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Amount
          </TableHead>
          <TableHead className="w-24" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {incomes.map((income) => (
          <TableRow key={income._id} className="border-border">
            <TableCell className="font-medium">
              {format(new Date(income.date), 'MMM dd, yyyy')}
            </TableCell>
            <TableCell>{income.description}</TableCell>
            <TableCell>
              {income.isRecurring && (
                <Badge variant="secondary" className="bg-primary/20 text-primary text-xs uppercase">
                  Recurring
                </Badge>
              )}
            </TableCell>
            <TableCell className="text-right font-semibold text-income">
              +{formatAmount(income.amount, income.currency)}
            </TableCell>
            <TableCell>
              <div className="flex items-center justify-end gap-1">
                <IncomeForm
                  income={income}
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
                      <AlertDialogTitle>Delete Income</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this income record? This action cannot be
                        undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(income._id)}
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
