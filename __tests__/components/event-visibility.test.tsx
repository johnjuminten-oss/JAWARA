import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EventVisibility } from '@/components/schedule/event-visibility'
import { createClient } from '@/lib/supabase/client'

// Mock responses
const mockUpdateResponse = {
  data: { visibility_scope: 'class' },
  error: null,
}

// simple chainable builder used across tests
const createChain = (response = mockUpdateResponse) => {
  const builder: any = {
    select: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(response),
  }
  return builder
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn().mockReturnValue({
    from: vi.fn().mockImplementation(() => createChain()),
  }),
}))

describe('EventVisibility', () => {
  const mockProps = {
    eventId: '123',
    initialVisibility: 'personal' as const,
    onVisibilityChange: vi.fn(),
    className: '',
  }

  it('renders with initial visibility', () => {
    render(<EventVisibility {...mockProps} />)
    expect(screen.getByText(/personal/i)).toBeInTheDocument()
  })

  it('handles visibility change', async () => {
    render(<EventVisibility {...mockProps} />)

    const trigger = screen.getByRole('combobox')
    await userEvent.click(trigger)

    const classOption = screen.getByText(/class/i)
    await userEvent.click(classOption)

    await waitFor(() => {
      expect(mockProps.onVisibilityChange).toHaveBeenCalled()
    })
  })

  it('disables controls while updating', async () => {
    render(<EventVisibility {...mockProps} />)

    const trigger = screen.getByRole('combobox')
    await userEvent.click(trigger)

    const classOption = screen.getByText(/class/i)
    await userEvent.click(classOption)

    expect(trigger).toBeDisabled()

    await waitFor(() => {
      expect(trigger).not.toBeDisabled()
    })
  })

  it('shows error when update fails', async () => {
    // Mock a failed update
    vi.mocked(createClient).mockImplementationOnce(() => {
      const failing = createChain()
      // make the update call reject
      failing.single = vi.fn().mockRejectedValue(new Error('Update failed'))
      return {
        from: () => failing,
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null }) },
        supabaseUrl: 'http://localhost',
        supabaseKey: 'test-key',
        realtime: { connect: vi.fn() },
      } as unknown as ReturnType<typeof createClient>
    })

    render(<EventVisibility {...mockProps} />)

    const trigger = screen.getByRole('combobox')
    await userEvent.click(trigger)

    const classOption = screen.getByText(/class/i)
    await userEvent.click(classOption)

    await waitFor(() => {
      expect(screen.getByText(/failed to update event visibility/i)).toBeInTheDocument()
    })
  })
})
