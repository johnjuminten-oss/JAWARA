import { vi } from 'vitest'
import type { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js'

export function createMockSupabaseClient() {
  const mockSingle = <T>(data: T): Promise<PostgrestSingleResponse<T>> => {
    return Promise.resolve({ data, error: null, count: null, status: 200, statusText: 'OK' })
  }

  const mockError = (message: string): Promise<PostgrestResponse<any>> => {
    return Promise.reject({ error: { message }, data: null, count: null, status: 500, statusText: 'ERROR' })
  }

  const createQueryBuilder = (finalResponse?: Promise<any> | any) => {
    const methodNames = [
      'select', 'update', 'insert', 'upsert', 'delete', 'eq', 'neq', 'gt', 'gte', 'lt', 'lte',
      'like', 'ilike', 'is', 'in', 'contains', 'containedBy', 'range', 'textSearch', 'match', 'not', 'or',
      'filter', 'order', 'limit', 'offset',
    ]

    const builder: Record<string, any> = {}
    methodNames.forEach((m) => {
      builder[m] = vi.fn().mockReturnThis()
    })

    // final method returns the provided response (or default successful response)
    builder.single = vi.fn().mockImplementation(() => {
      if (finalResponse instanceof Promise) return finalResponse
      return Promise.resolve(finalResponse ?? { data: null, error: null, count: null, status: 200, statusText: 'OK' })
    })

    return builder
  }

  return {
    mockSingle,
    mockError,
    createQueryBuilder,
  }
}
