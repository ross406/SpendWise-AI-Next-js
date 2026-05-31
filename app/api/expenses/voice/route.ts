import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { EXPENSE_CATEGORIES } from "@/lib/db/models/expense";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const reqBody = await request.json();
    const transcript = reqBody?.transcript?.trim();
    console.log("Received request to parse voice expense", reqBody);

    if (!transcript) {
      return NextResponse.json(
        { error: "No transcript provided" },
        { status: 400 },
      );
    }

    const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 },
      );
    }

    console.log("Received transcript for voice expense:", transcript);

    const today = new Date().toISOString().split("T")[0];

    const prompt = `
You are an expense extraction assistant.

Convert the user's spoken expense into JSON.

Return ONLY valid JSON.
No markdown.
No explanation.
No code fences.

Schema:

{
  "date": "YYYY-MM-DD",
  "description": "string",
  "amount": number,
  "currency": "INR",
  "category": "housing|utilities|food|gym|transport|entertainment|healthcare|other"
}

Rules:

- Amount must be positive.
- Currency should default to INR.
- Infer category from the description.
- Convert natural language dates.
- If no date is mentioned, use today's date (${today}).
- Clean description.
- Return exactly one JSON object.

Examples:

Input:
"I spent 500 rupees on dinner on 2nd June"

Output:
{
  "date": "2026-06-02",
  "description": "Dinner",
  "amount": 500,
  "currency": "INR",
  "category": "food"
}

Input:
"Paid 1200 for Uber yesterday"

Output:
{
  "date": "2026-05-30",
  "description": "Uber",
  "amount": 1200,
  "currency": "INR",
  "category": "transport"
}

User Input:
"${transcript}"
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1024,
          },
        }),
      },
    );

    if (!response.ok) {
      const err = await response.json();

      throw new Error(err?.error?.message || "Gemini request failed");
    }

    const data = await response.json();

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    console.log("Raw Gemini response text:", text);
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    console.log("Cleaned Gemini response text:", cleaned);

    let expense;

    try {
      expense = JSON.parse(cleaned);
    } catch {
      throw new Error("Could not parse Gemini response as JSON");
    }

    if (!expense.amount || !expense.description || !expense.date) {
      throw new Error("Incomplete expense information detected");
    }

    if (!EXPENSE_CATEGORIES.includes(expense.category)) {
      expense.category = "other";
    }

    return NextResponse.json({
      expense,
    });
  } catch (error) {
    console.error("Voice expense parse error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to parse voice expense",
      },
      { status: 500 },
    );
  }
}
