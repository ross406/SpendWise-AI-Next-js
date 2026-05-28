'use client'

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts'
import { useCurrency } from '@/lib/contexts/currency-context'

interface CategoryData {
  category: string
  amount: number
  currency: string
}

interface ExpenditureChartProps {
  data: CategoryData[]
}

const categoryColors: Record<string, string> = {
  housing: '#4f7cff',
  utilities: '#c4a83f',
  gym: '#3fb58f',
  food: '#e57652',
  transport: '#9b5de5',
  entertainment: '#e5609b',
  healthcare: '#3fb57c',
  shopping: '#e5a852',
  other: '#6b7280',
}

const categoryLabels: Record<string, string> = {
  housing: 'Housing',
  utilities: 'Utilities',
  gym: 'Gym',
  food: 'Food',
  transport: 'Transport',
  entertainment: 'Entertainment',
  healthcare: 'Healthcare',
  shopping: 'Shopping',
  other: 'Other',
}

export function ExpenditureChart({ data }: ExpenditureChartProps) {
  const { formatAmount, convertAmount, currency } = useCurrency()

  const chartData = data.map(item => ({
    name: categoryLabels[item.category] || item.category,
    value: convertAmount(item.amount, item.currency),
    color: categoryColors[item.category] || categoryColors.other,
  }))

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: { name: string } }> }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
          <p className="text-sm font-medium text-popover-foreground">
            {payload[0].payload.name}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatAmount(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        No expense data for this period
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: '#9ca3af', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#9ca3af', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => `${currency === 'INR' ? '₹' : '$'}${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
