// ─── Gemini Parser ────────────────────────────────────────────────────────────

import { DetectedExpense } from "./types";

export async function parseStatementWithGemini(
  file: File,
): Promise<DetectedExpense[]> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/expenses/parse-statement", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error?.error || "Failed to parse statement");
  }

  const data = await response.json();
  return data.expenses;
}
