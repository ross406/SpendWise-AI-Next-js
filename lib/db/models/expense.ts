import mongoose, { Schema, models } from 'mongoose'

export const EXPENSE_CATEGORIES = [
  'housing',
  'utilities',
  'gym',
  'food',
  'transport',
  'entertainment',
  'healthcare',
  'shopping',
  'other',
] as const

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number]

export interface IExpense {
  _id: string
  clerkUserId: string
  date: Date
  description: string
  amount: number
  currency: string
  category: ExpenseCategory
  createdAt: Date
  updatedAt: Date
}

const expenseSchema = new Schema<IExpense>(
  {
    clerkUserId: { type: String, required: true, index: true },
    date: { type: Date, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: 'USD' },
    category: { 
      type: String, 
      required: true,
      enum: EXPENSE_CATEGORIES,
      default: 'other'
    },
  },
  { timestamps: true }
)

expenseSchema.index({ clerkUserId: 1, date: -1 })
expenseSchema.index({ clerkUserId: 1, category: 1 })

export const Expense = models.Expense || mongoose.model<IExpense>('Expense', expenseSchema)
