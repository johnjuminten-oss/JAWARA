import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-purple-700 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-black" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">Check Your Email</CardTitle>
            <CardDescription className="text-gray-600">We've sent you a confirmation link</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            Please check your email and click the confirmation link to activate your EduSchedule account.
          </p>
          <p className="text-xs text-gray-500">Don't see the email? Check your spam folder or contact support.</p>
          <div className="mt-6">
            <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              ← Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
