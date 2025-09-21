"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { createClient } from "@/lib/supabase/client"
import { LogOut, Settings, User, Send, Users, Database } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"

import { Profile } from "@/types"

interface HeaderProps {
  user: Profile
}

export function Header({ user }: HeaderProps) {
  const router = useRouter()
  const supabase = createClient()
  // Build a safe display name to avoid rendering "undefined undefined"
  const displayName = user?.full_name || [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.email || 'User'

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const getRoleDisplay = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1)
  }

  return (
    <header className="bg-white border-b border-gray-300 px-2 sm:px-4 py-2 sm:py-3" role="banner">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center" aria-hidden="true">
              <Image
                src="/JAWARA.PNG"
                alt="JAWARA Logo"
                width={48}
                height={48}
                className="rounded-lg sm:hidden"
              />
              <Image
                src="/JAWARA.PNG"
                alt="JAWARA Logo"
                width={64}
                height={64}
                className="rounded-lg hidden sm:block"
              />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">JAWARA</h1>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">{getRoleDisplay(user.role)} Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="flex items-center space-x-1 sm:space-x-2" role="navigation" aria-label="Main navigation">
          {user.role === "teacher" && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hover:bg-blue-50 border-gray-300 text-gray-700 hover:text-blue-700"
            >
              <Link href="/teacher/broadcast" aria-label="Go to broadcast page">
                <Send className="w-4 h-4 sm:mr-2" aria-hidden="true" />
                <span className="hidden sm:inline">Broadcast</span>
              </Link>
            </Button>
          )}

          {user.role === "admin" && (
            <>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="hover:bg-blue-50 border-gray-300 text-gray-700 hover:text-blue-700"
              >
                <Link href="/admin/users" aria-label="Go to users management">
                  <Users className="w-4 h-4 sm:mr-2" aria-hidden="true" />
                  <span className="hidden sm:inline">Users</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="hover:bg-blue-50 border-gray-300 text-gray-700 hover:text-blue-700"
              >
                <Link href="/admin/system-settings" aria-label="Go to system settings">
                  <Database className="w-4 h-4 sm:mr-2" aria-hidden="true" />
                  <span className="hidden sm:inline">System</span>
                </Link>
              </Button>
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="User menu"
              >
                <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center mr-1" aria-hidden="true">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">{displayName}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 shadow-lg border-gray-200">
              <DropdownMenuItem asChild className="hover:bg-gray-50">
                <Link href="/settings" className="flex items-center">
                  <Settings className="w-4 h-4 mr-3" aria-hidden="true" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-red-600 hover:bg-red-50 focus:bg-red-50"
                aria-label="Sign out of account"
              >
                <LogOut className="w-4 h-4 mr-3" aria-hidden="true" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <NotificationCenter userId={user.id} />
        </nav>
      </div>
    </header>
  )
}
