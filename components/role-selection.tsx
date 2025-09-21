"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, ShieldCheck, Users2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
export function RoleSelection() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-2 sm:p-4">
      <Card className="w-full max-w-md shadow-xl mx-2 sm:mx-0">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-24 h-24 bg-primary/5 rounded-2xl flex items-center justify-center">
            <Image
              src="/JAWARA.PNG"
              alt="JAWARA Logo"
              width={96}
              height={96}
              className="rounded-2xl"
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">EduSchedule Portal</CardTitle>
            <CardDescription className="text-gray-600 mt-2">Choose your role to get started</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <Link href="/auth/login?role=admin" className="block">
              <Button 
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium flex items-center justify-center"
              >
                <ShieldCheck className="w-5 h-5 mr-2" />
                Administrator Login
              </Button>
            </Link>

            <Link href="/auth/login?role=teacher" className="block">
              <Button
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium flex items-center justify-center"
              >
                <GraduationCap className="w-5 h-5 mr-2" />
                Teacher Login
              </Button>
            </Link>

            <Link href="/auth/login?role=student" className="block">
              <Button
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium flex items-center justify-center"
              >
                <Users2 className="w-5 h-5 mr-2 text-white" />
                Student Login
              </Button>
            </Link>
          </div>

          <div className="space-y-4 mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Quick Access</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <Link href="/auth/login?role=admin" className="text-gray-600 hover:text-primary transition-colors">
                Admin Portal
              </Link>
              <Link href="/auth/login?role=teacher" className="text-gray-600 hover:text-primary transition-colors">
                Teacher Portal
              </Link>
              <Link href="/auth/login?role=student" className="text-gray-600 hover:text-primary transition-colors">
                Student Portal
              </Link>
            </div>
          </div>

          <p className="text-sm text-gray-500 text-center mt-6">
            For assistance, please contact your system administrator
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
