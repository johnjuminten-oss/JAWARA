import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
  "flex h-9 w-full min-w-0 rounded-md border px-4 py-2 text-base outline-none transition-colors",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-2",
        "aria-invalid:ring-destructive/20",
        "bg-white text-black [color-scheme:light] placeholder:text-black placeholder:bg-white placeholder:opacity-100",
        className
      )}
      {...props}
    />
  )
}

export { Input }
