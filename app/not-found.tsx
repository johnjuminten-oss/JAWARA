'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">404 - Page Not Found</h2>
      <p className="text-gray-600 mb-4">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link
        href="/"
        className="px-4 py-2 bg-white text-black rounded hover:bg-gray-50 transition-colors border"
      >
        Go back home
      </Link>
    </div>
  )
}
