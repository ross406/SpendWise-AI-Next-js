import mongoose, { Schema, models } from "mongoose";
import { type IIncome } from "./income-types";

export { type IIncome };

const incomeSchema = new Schema<IIncome>(
  {
    clerkUserId: { type: String, required: true, index: true },
    date: { type: Date, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: "USD" },
    isRecurring: { type: Boolean, default: false },
    recurringFrequency: {
      type: String,
      enum: ["monthly", "weekly", "yearly"],
      required: false,
    },
  },
  { timestamps: true },
);

incomeSchema.index({ clerkUserId: 1, date: -1 });

export const Income =
  models.Income || mongoose.model<IIncome>("Income", incomeSchema);
