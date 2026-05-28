import mongoose, { Schema, models } from 'mongoose'

export interface IUserSettings {
  _id: string
  clerkUserId: string
  displayCurrency: string
  createdAt: Date
  updatedAt: Date
}

const userSettingsSchema = new Schema<IUserSettings>(
  {
    clerkUserId: { type: String, required: true, unique: true, index: true },
    displayCurrency: { type: String, default: 'USD' },
  },
  { timestamps: true }
)

export const UserSettings = models.UserSettings || mongoose.model<IUserSettings>('UserSettings', userSettingsSchema)
