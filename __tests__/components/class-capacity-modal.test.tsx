import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ClassCapacityModal } from '@/components/admin/class-capacity-modal'
import { createClient } from '@/lib/supabase/client'

// Mock Supabase client responses with full response structure
const mockSupabaseResponse = {
  data: { capacity: 30, current_enrollment: [{ count: 15 }] },
  error: null,
  count: null,
  status: 200,
  statusText: 'OK',
}

const mockUpdateResponse = {
  data: { capacity: 40 },
  error: null,
  count: null,
  status: 200,
  statusText: 'OK',
}

// helper to build a minimal chainable query builder used in tests
const createMockQueryBuilder = () => {
  const builder: any = {
    select: vi.fn(),
    update: vi.fn(),
    insert: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    single: vi.fn(),
  }
  // chainable methods return the builder
  Object.keys(builder).forEach((k) => {
    if (typeof builder[k] === 'function') builder[k].mockReturnValue(builder)
  })
  // default single resolves to mockSupabaseResponse
  builder.single.mockResolvedValue(mockSupabaseResponse)
  return builder
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => {
    const queryBuilder = createMockQueryBuilder()
    queryBuilder.select.mockReturnValue(queryBuilder)
    queryBuilder.eq.mockReturnValue(queryBuilder)
    queryBuilder.single.mockResolvedValue(mockSupabaseResponse)
    queryBuilder.update.mockReturnValue(queryBuilder)

    return {
      from: () => queryBuilder,
    }
  },
}))

describe('ClassCapacityModal', () => {
  const mockProps = {
    classId: '123',
    open: true,
    onOpenChange: vi.fn(),
    onCapacityUpdate: vi.fn(),
  }

  it('renders correctly with initial capacity', async () => {
    render(<ClassCapacityModal {...mockProps} />)
    
    await waitFor(() => {
      expect(screen.getByLabelText(/capacity/i)).toHaveValue(30)
    })
  })

  it('shows current enrollment information', async () => {
    render(<ClassCapacityModal {...mockProps} />)
    
    await waitFor(() => {
      expect(screen.getByText(/15 students enrolled/i)).toBeInTheDocument()
    })
  })

  it('handles capacity update', async () => {
    render(<ClassCapacityModal {...mockProps} />)
    
    const input = await screen.findByLabelText(/capacity/i)
    await userEvent.clear(input)
    await userEvent.type(input, '40')
    
    const updateButton = screen.getByRole('button', { name: /update/i })
    await userEvent.click(updateButton)
    
    await waitFor(() => {
      expect(mockProps.onCapacityUpdate).toHaveBeenCalled()
      expect(mockProps.onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('disables update button when capacity is invalid', async () => {
    render(<ClassCapacityModal {...mockProps} />)
    
    const input = await screen.findByLabelText(/capacity/i)
    await userEvent.clear(input)
    await userEvent.type(input, '0')
    
    expect(screen.getByRole('button', { name: /update/i })).toBeDisabled()
  })

  it('shows error when update fails', async () => {
    // Mock a failed update
    vi.mocked(createClient).mockImplementationOnce(() => {
      const queryBuilder = createMockQueryBuilder()
      
      // Mock initial load success
      queryBuilder.select.mockReturnValue(queryBuilder)
      queryBuilder.eq.mockReturnValue(queryBuilder)
      queryBuilder.single
        .mockResolvedValueOnce(mockSupabaseResponse) // First call - initial load
        .mockResolvedValueOnce({ // Second call - update failure
          data: null,
          error: {
            message: 'Update failed',
            code: 'CAPACITY_UPDATE_ERROR'
          },
          status: 400,
          statusText: 'Bad Request',
          count: null
        })

      return {
        from: () => queryBuilder,
        // Add required Supabase client properties
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        },
        supabaseUrl: 'http://localhost:54321',
        supabaseKey: 'test-key',
        headers: {},
        realtime: { connect: vi.fn() },
        rest: { baseUrl: '' },
      } as unknown as ReturnType<typeof createClient>
    })

    render(<ClassCapacityModal {...mockProps} />)
    
    const input = await screen.findByLabelText(/capacity/i)
    await userEvent.clear(input)
    await userEvent.type(input, '40')
    
    const updateButton = screen.getByRole('button', { name: /update/i })
    await userEvent.click(updateButton)
    
    await waitFor(() => {
      expect(screen.getByText(/failed to update class capacity/i)).toBeInTheDocument()
    })
  })
})
