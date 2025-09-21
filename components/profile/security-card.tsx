'use client'

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { ChangePasswordModal } from "@/components/profile/change-password-modal"

export function SecurityCard() {
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)

  return (
    <>
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Password</h4>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-white"
          onClick={() => setIsChangePasswordOpen(true)}
        >
          Change Password
        </Button>
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Two-Factor Authentication</h4>
        <p className="text-sm text-gray-500 mb-2">Add an extra layer of security to your account</p>
        <Button variant="outline" size="sm" className="bg-white">
          Enable 2FA
        </Button>
      </div>

      <ChangePasswordModal 
        isOpen={isChangePasswordOpen} 
        onClose={() => setIsChangePasswordOpen(false)} 
      />
    </>
  )
}