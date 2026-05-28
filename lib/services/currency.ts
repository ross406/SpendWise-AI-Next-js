export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
] as const

export type CurrencyCode = typeof CURRENCIES[number]['code']

interface ExchangeRates {
  [key: string]: number
}

let cachedRates: ExchangeRates | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

export async function getExchangeRates(baseCurrency: string = 'USD'): Promise<ExchangeRates> {
  const now = Date.now()
  
  if (cachedRates && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedRates
  }

  try {
    // Using Frankfurter API - free, no API key required
    // Uses European Central Bank data
    const response = await fetch(
      `https://api.frankfurter.app/latest?from=${baseCurrency}`,
      { next: { revalidate: 3600 } }
    )

    if (!response.ok) {
      console.error('Exchange rate API error:', response.status)
      return getFallbackRates()
    }

    const data = await response.json()
    
    if (data.rates) {
      // Add the base currency with rate 1
      cachedRates = { [baseCurrency]: 1, ...data.rates }
      cacheTimestamp = now
      return cachedRates!
    }
    
    return getFallbackRates()
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error)
    return getFallbackRates()
  }
}

function getFallbackRates(): ExchangeRates {
  // Approximate fallback rates (USD base) - May 2026
  return {
    USD: 1,
    EUR: 0.91,
    GBP: 0.78,
    INR: 84.2,
    JPY: 156.5,
    CAD: 1.38,
    AUD: 1.55,
    CHF: 0.89,
    CNY: 7.26,
    BRL: 5.12,
  }
}

export function convertAmount(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: ExchangeRates
): number {
  if (fromCurrency === toCurrency) return amount
  
  // Convert to USD first, then to target currency
  const usdAmount = amount / (rates[fromCurrency] || 1)
  const convertedAmount = usdAmount * (rates[toCurrency] || 1)
  
  return convertedAmount
}

export function formatCurrency(
  amount: number,
  currencyCode: string,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function getCurrencySymbol(currencyCode: string): string {
  const currency = CURRENCIES.find(c => c.code === currencyCode)
  return currency?.symbol || currencyCode
}
