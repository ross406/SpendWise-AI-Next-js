import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db/connection'
import { UserSettings } from '@/lib/db/models/user-settings'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    
    let settings = await UserSettings.findOne({ clerkUserId: userId })
    
    if (!settings) {
      settings = await UserSettings.create({
        clerkUserId: userId,
        displayCurrency: 'USD',
      })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Failed to fetch user settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user settings' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { displayCurrency } = body

    await connectToDatabase()
    
    const settings = await UserSettings.findOneAndUpdate(
      { clerkUserId: userId },
      { displayCurrency },
      { new: true, upsert: true }
    )

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Failed to update user settings:', error)
    return NextResponse.json(
      { error: 'Failed to update user settings' },
      { status: 500 }
    )
  }
}
