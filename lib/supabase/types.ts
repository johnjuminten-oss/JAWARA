import { CookieOptions } from "@supabase/ssr"

export interface CookieHandlerFunctions {
  name: string
  value: string
  options: CookieOptions
}

export interface CookieHandler {
  get(name: string): string | undefined
  getAll(): { name: string, value: string }[]
  set(name: string, value: string, options: CookieOptions): void
  remove(name: string, options?: CookieOptions): void
  setAll(cookiesToSet: CookieHandlerFunctions[]): void
}