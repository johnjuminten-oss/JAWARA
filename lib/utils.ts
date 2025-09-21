import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateTime(dateString: string) {
  const date = new Date(dateString)
  return {
    date: date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    time: date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    shortDate: date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }
}

export function getEventTypeColor(type: string) {
  switch (type) {
    case "lesson":
      return "bg-blue-100 text-blue-800"
    case "exam":
      return "bg-red-100 text-red-800"
    case "assignment":
      return "bg-yellow-100 text-yellow-800"
    case "personal":
      return "bg-purple-100 text-purple-800"
    case "broadcast":
      return "bg-green-100 text-green-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function getVisibilityScopeLabel(scope: string) {
  switch (scope) {
    case "personal":
      return "Only you"
    case "class":
      return "Class members"
    case "schoolwide":
      return "Everyone at school"
    default:
      return "Unknown"
  }
}

export function pluralize(count: number, singular: string, plural?: string) {
  return count === 1 ? singular : (plural || `${singular}s`)
}

export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }

    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
