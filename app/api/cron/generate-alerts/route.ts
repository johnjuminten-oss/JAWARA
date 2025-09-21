import { generateExamReminders } from "@/lib/alert-generator"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron (optional security check)
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await generateExamReminders()

    return NextResponse.json({ success: true, message: "Exam reminders generated" })
  } catch (error) {
    console.error("Error generating alerts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
