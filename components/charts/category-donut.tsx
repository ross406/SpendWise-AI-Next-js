'use client'

import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts'
import { useCurrency } from '@/lib/contexts/currency-context'

interface CategoryData {
  category: string
  amount: number
  currency: string
}

interface CategoryDonutProps {
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

export function CategoryDonut({ data }: CategoryDonutProps) {
  const { convertAmount, formatAmount } = useCurrency()

  const total = data.reduce((sum, item) => sum + convertAmount(item.amount, item.currency), 0)

  const chartData = data.map(item => {
    const converted = convertAmount(item.amount, item.currency)
    return {
      name: categoryLabels[item.category] || item.category.toUpperCase(),
      value: converted,
      color: categoryColors[item.category] || categoryColors.other,
      percentage: total > 0 ? ((converted / total) * 100).toFixed(1) : '0',
    }
  }).sort((a, b) => b.value - a.value)

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: { name: string; percentage: string } }> }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
          <p className="text-sm font-medium text-popover-foreground">
            {payload[0].payload.name}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatAmount(payload[0].value)} ({payload[0].payload.percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  const renderLegend = () => (
    <div className="ml-4 flex flex-col gap-2">
      {chartData.slice(0, 5).map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs font-medium text-foreground">{entry.name}</span>
          </div>
          <span className="text-xs font-semibold text-foreground">{entry.percentage}%</span>
        </div>
      ))}
    </div>
  )

  if (chartData.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-muted-foreground">
        No expense data for this period
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center">
      <ResponsiveContainer width={180} height={180}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      {renderLegend()}
    </div>
  )
}
