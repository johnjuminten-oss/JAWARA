import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-purple-700 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-black" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">Authentication Error</CardTitle>
            <CardDescription className="text-gray-600">There was a problem confirming your account</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            The confirmation link may have expired or been used already. Please try signing up again or contact support.
          </p>
          <div className="mt-6 space-y-2">
            <Link href="/auth/sign-up" className="block text-blue-600 hover:text-blue-700 font-medium text-sm">
              Try signing up again
            </Link>
            <Link href="/" className="block text-gray-500 hover:text-gray-700 text-sm">
              ← Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
