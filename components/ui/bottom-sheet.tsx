import React, { ReactNode, useEffect } from "react"

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}

export function BottomSheet({ isOpen, onClose, children }: BottomSheetProps) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", onKeyDown)
    }
    return () => {
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-lg shadow-lg z-50 max-h-[70vh] overflow-y-auto p-4">
        {children}
      </div>
    </>
  )
}
