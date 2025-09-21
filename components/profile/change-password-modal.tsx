'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const { toast } = useToast()

  const validatePassword = (password: string): string | null => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long'
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter'
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter'
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number'
    }
    return null
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNewPassword(value)
    if (value) {
      const error = validatePassword(value)
      setValidationError(error)
    } else {
      setValidationError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)
    
    // Validate password
    const error = validatePassword(newPassword)
    if (error) {
      setValidationError(error)
      toast({
        title: "Validation Error",
        description: error,
        variant: "destructive",
      })
      return
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setValidationError("Passwords do not match")
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/settings/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update password')
      }

      toast({
        title: "Success",
        description: "Password has been updated successfully. Please use your new password for future logins.",
        duration: 5000,
      })
      onClose()
      setNewPassword('')
      setConfirmPassword('')
      setValidationError(null)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      })
      console.error('Password update error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter your new password below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={handlePasswordChange}
              className={`w-full ${validationError && newPassword ? 'border-red-500' : ''}`}
              placeholder="Enter new password"
              required
            />
            {validationError && newPassword && (
              <p className="mt-1 text-sm text-red-500">{validationError}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full ${confirmPassword && newPassword !== confirmPassword ? 'border-red-500' : ''}`}
              placeholder="Confirm new password"
              required
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="mt-1 text-sm text-red-500">Passwords do not match</p>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Password requirements:</p>
            <ul className="list-none space-y-1 text-sm">
              <li className={`flex items-center ${newPassword.length >= 6 ? 'text-green-600' : 'text-muted-foreground'}`}>
                <span className="mr-2">{newPassword.length >= 6 ? '✓' : '○'}</span>
                At least 6 characters
              </li>
              <li className={`flex items-center ${/[A-Z]/.test(newPassword) ? 'text-green-600' : 'text-muted-foreground'}`}>
                <span className="mr-2">{/[A-Z]/.test(newPassword) ? '✓' : '○'}</span>
                One uppercase letter
              </li>
              <li className={`flex items-center ${/[a-z]/.test(newPassword) ? 'text-green-600' : 'text-muted-foreground'}`}>
                <span className="mr-2">{/[a-z]/.test(newPassword) ? '✓' : '○'}</span>
                One lowercase letter
              </li>
              <li className={`flex items-center ${/[0-9]/.test(newPassword) ? 'text-green-600' : 'text-muted-foreground'}`}>
                <span className="mr-2">{/[0-9]/.test(newPassword) ? '✓' : '○'}</span>
                One number
              </li>
            </ul>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" onClick={onClose} className="bg-white">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !!validationError || newPassword !== confirmPassword}
              className={`${isLoading ? 'opacity-50' : ''} bg-primary text-white`}
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}