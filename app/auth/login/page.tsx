"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams.get("role")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error: signInError, data: signInData } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (signInError) throw signInError

      // Get user profile to determine redirect
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", signInData.user?.id)
        .single()

      if (profileError) throw profileError

      console.log("Login successful, user profile:", profile)
      
      // Verify role matches the requested role from URL
      const requestedRole = searchParams.get("role")
      if (requestedRole && requestedRole !== profile.role) {
        setError(`You don't have ${requestedRole} privileges. Redirecting to your dashboard...`)
        setTimeout(() => {
          window.location.href = `/${profile.role}/dashboard`
        }, 2000)
        return
      }

      const dashboardPath = `/${profile.role}/dashboard`
      console.log("Redirecting to:", dashboardPath)
      // Use router.push for client-side navigation
      router.push(dashboardPath)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  // Determine gradient class based on role
  const getGradientClass = (role: string | null) => {
    switch (role) {
      case 'student':
        return 'login-gradient-student'
      case 'teacher':
        return 'login-gradient-teacher'
      case 'admin':
        return 'login-gradient-admin'
      default:
        return 'login-gradient' // fallback to default
    }
  }

  const gradientClass = getGradientClass(role)

  return (
    <div className={`min-h-screen flex ${gradientClass}`}>
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-white items-center justify-center p-12">
        <div className="max-w-lg text-center">
          <div className="w-40 h-40 bg-primary/5 rounded-2xl flex items-center justify-center mb-8 mx-auto">
            <Image
              src="/JAWARA.PNG"
              alt="JAWARA Logo"
              width={160}
              height={160}
              className="rounded-2xl"
            />
          </div>
          <h1 className="text-4xl font-semibold text-gray-900 mb-4">Welcome back</h1>
          <p className="text-lg text-gray-600">Sign in to your account to continue your learning journey.</p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 animate-fade-in">
        <div className="w-full max-w-sm bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="w-24 h-24 bg-primary/5 rounded-xl inline-flex items-center justify-center mb-4">
              <Image
                src="/JAWARA.PNG"
                alt="JAWARA Logo"
                width={96}
                height={96}
                className="rounded-xl"
              />
            </div>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900">
              Login {role ? `as ${role.charAt(0).toUpperCase() + role.slice(1)}` : ""}
            </h2>
            <p className="text-gray-600 mt-2">Enter your credentials to continue</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-white border-gray-200 hover:border-gray-300 focus:border-primary/50 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="text-sm text-gray-700">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 bg-white border-gray-200 hover:border-gray-300 focus:border-primary/50 focus:ring-primary/20"
              />
            </div>

            {error && (
              <div className="p-3 text-sm bg-red-50 border border-red-100 text-red-600 rounded-lg">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-11 bg-primary hover:bg-primary/90 transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
