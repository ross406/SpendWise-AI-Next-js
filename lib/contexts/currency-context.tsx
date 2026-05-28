"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import useSWR from "swr";
import { CURRENCIES, type CurrencyCode } from "@/lib/services/currency";

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  rates: Record<string, number>;
  isLoading: boolean;
  convertAmount: (amount: number, fromCurrency: string) => number;
  formatAmount: (amount: number, fromCurrency?: string) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined,
);

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function CurrencyProvider({
  children,
  initialCurrency = "USD",
}: {
  children: ReactNode;
  initialCurrency?: string;
}) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(
    initialCurrency as CurrencyCode,
  );
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch user's saved currency from DB on mount
  useEffect(() => {
    const fetchUserCurrency = async () => {
      try {
        const response = await fetch("/api/user-settings");
        if (response.ok) {
          const data = await response.json();
          const savedCurrency = data.settings?.displayCurrency || "USD";
          setCurrencyState(savedCurrency as CurrencyCode);
        }
      } catch (error) {
        console.error("Failed to fetch user currency:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    fetchUserCurrency();
  }, []);

  const { data: ratesData, isLoading } = useSWR(
    "/api/exchange-rates",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 3600000, // 1 hour
    },
  );

  const rates = ratesData?.rates || {};

  const setCurrency = useCallback((newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    // Persist to server
    fetch("/api/user-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayCurrency: newCurrency }),
    });
  }, []);

  const convertAmount = useCallback(
    (amount: number, fromCurrency: string): number => {
      if (
        fromCurrency === currency ||
        !rates[fromCurrency] ||
        !rates[currency]
      ) {
        return amount;
      }
      // Convert through USD (rates are USD-based)
      const usdAmount = amount / (rates[fromCurrency] || 1);
      return usdAmount * (rates[currency] || 1);
    },
    [currency, rates],
  );

  const formatAmount = useCallback(
    (amount: number, fromCurrency?: string): string => {
      const finalAmount = fromCurrency
        ? convertAmount(amount, fromCurrency)
        : amount;

      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(finalAmount);
    },
    [currency, convertAmount],
  );

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        rates,
        isLoading,
        convertAmount,
        formatAmount,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return context;
}
