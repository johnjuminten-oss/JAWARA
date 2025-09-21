import { NextRequest } from "next/server"

// Updated for Next.js 15 compatibility
export interface RouteContext {
  params: {
    id?: string
    [key: string]: string | string[] | undefined
  }
}

export type RouteHandler = (request: NextRequest, context: RouteContext) => Promise<Response>
