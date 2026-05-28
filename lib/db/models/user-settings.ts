import mongoose, { Schema, models } from "mongoose";
import { type IUserSettings } from "./user-settings-types";

export { type IUserSettings };

const userSettingsSchema = new Schema<IUserSettings>(
  {
    clerkUserId: { type: String, required: true, unique: true, index: true },
    displayCurrency: { type: String, default: "USD" },
  },
  { timestamps: true },
);

export const UserSettings =
  models.UserSettings ||
  mongoose.model<IUserSettings>("UserSettings", userSettingsSchema);
