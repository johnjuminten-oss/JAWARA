'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes'
import { EventsProvider } from '@/hooks/use-events'

/**
 * Root provider component that wraps the application with necessary context providers
 * Currently includes:
 * - Theme provider for dark/light mode support
 *
 * @param props - Theme provider props from next-themes
 * @returns Provider wrapped application
 */
export function Providers({ children, ...props }: ThemeProviderProps): React.ReactElement {
  return (
    <React.Suspense fallback={null}>
      <ErrorBoundary>
        <NextThemesProvider {...props}>
          <EventsProvider>{children}</EventsProvider>
        </NextThemesProvider>
      </ErrorBoundary>
    </React.Suspense>
  )
}

/**
 * Error boundary component to catch and handle errors in theme provider
 */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true }
  }

  componentDidCatch(error: Error): void {
    console.error('Theme provider error:', error)
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="text-red-600">
          Something went wrong with the theme provider. Please refresh the page.
        </div>
      )
    }

    return this.props.children
  }
}
