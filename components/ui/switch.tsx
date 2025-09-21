"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
  // Neumorphic, fully rounded track matching thumb curvature
  "peer relative inline-flex h-6 w-12 shrink-0 items-center rounded-full transition-colors duration-300 ease-out outline-none",
  // Off = light gray, On = dark gray
  "data-[state=checked]:bg-gray-700 data-[state=unchecked]:bg-gray-200",
  // Soft inner shadow
  "shadow-inner",
  // Disabled state
  "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          // White circular thumb with drop shadow
          "pointer-events-none absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300",
          // Positions using left for precise alignment (w-12=48px, thumb=20px -> 48 - 20 - 2 = 26px)
          "data-[state=checked]:left-[26px] data-[state=unchecked]:left-[2px]"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
