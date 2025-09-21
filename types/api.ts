import { NextRequest } from "next/server"

export interface RouteContext {
  params: {
    id?: string
    [key: string]: string | undefined
  }
}

export type RouteHandler = (request: NextRequest, context: RouteContext) => Promise<Response>