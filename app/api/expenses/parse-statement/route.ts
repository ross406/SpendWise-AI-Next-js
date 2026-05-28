import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { DetectedExpense } from "@/components/expenses/types";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 },
      );
    }

    // Convert file to base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mimeType = file.type;

    const prompt = `You are a financial data extraction assistant. Analyze this bank statement and extract ALL expense/debit transactions.

Return ONLY a valid JSON array with no markdown, no explanation, no code fences. Each object must have:
- date: string in "YYYY-MM-DD" format
- description: string (merchant/payee name, cleaned up)
- amount: number (positive value, no currency symbol)
- currency: string (3-letter ISO code like "USD", "INR", "EUR" — detect from statement, default "USD")
- category: one of exactly these values: "housing", "utilities", "food", "gym", "transport", "entertainment", "healthcare", "shopping", "other"

Rules:
- Only include debits/expenses, skip credits/deposits/refunds
- Infer category from description (e.g. "ZOMATO" → "food", "UBER" → "transport", "NETFLIX" → "entertainment")
- If date year is ambiguous, use current year
- Clean up description (remove transaction IDs, trailing digits, etc.)

Example output:
[{"date":"2024-01-15","description":"Zomato","amount":450,"currency":"INR","category":"food"},{"date":"2024-01-16","description":"Uber","amount":200,"currency":"INR","category":"transport"}]`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64,
                  },
                },
                { text: prompt },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 8192,
          },
        }),
      },
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err?.error?.message || "Gemini API error");
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Strip any accidental markdown fences
    const cleaned = text.replace(/```json|```/g, "").trim();

    let parsed: Omit<DetectedExpense, "id" | "selected">[];
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error(
        "Could not parse Gemini response as JSON. Try a clearer image.",
      );
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error("No expense transactions detected in the statement.");
    }

    const expenses: DetectedExpense[] = parsed.map((item, i) => ({
      ...item,
      id: `gemini-${i}-${Date.now()}`,
      selected: true,
    }));

    return NextResponse.json({ expenses });
  } catch (error) {
    console.error("Parse statement error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to parse statement",
      },
      { status: 500 },
    );
  }
}
