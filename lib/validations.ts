import { z } from 'zod'
import { VisibilityScope } from '@/types/database'

export const updateClassCapacitySchema = z.object({
  classId: z.string().uuid(),
  capacity: z.number().min(1),
})

export const updateEventVisibilitySchema = z.object({
  eventId: z.string().uuid(),
  visibility_scope: z.enum(['personal', 'class', 'schoolwide'] as [VisibilityScope, ...VisibilityScope[]]),
})

export const updateProfileSchema = z.object({
  phone_number: z.string().optional(),
  avatar_url: z.string().url().optional(),
  metadata: z.record(z.unknown()).optional(),
}).partial()

// Helper function to validate request body against a schema
export async function validateRequestBody<T>(
  request: Request,
  schema: z.Schema<T>
): Promise<T> {
  try {
    const body = await request.json()
    return schema.parse(body)
  } catch (error) {
    throw new Error('Invalid request body')
  }
}
