export interface IIncome {
  _id: string;
  clerkUserId: string;
  date: Date;
  description: string;
  amount: number;
  currency: string;
  isRecurring: boolean;
  recurringFrequency?: "monthly" | "weekly" | "yearly";
  createdAt: Date;
  updatedAt: Date;
}
