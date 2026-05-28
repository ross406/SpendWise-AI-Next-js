import { getExchangeRates } from '@/lib/services/currency'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const rates = await getExchangeRates('USD')
    
    return NextResponse.json({ 
      rates,
      base: 'USD',
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exchange rates' },
      { status: 500 }
    )
  }
}
