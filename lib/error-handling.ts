import { toast } from "@/hooks/use-toast"

export function handleError(error: unknown, fallbackMessage: string = "An error occurred") {
  const message = error instanceof Error ? error.message : fallbackMessage
  
  toast({
    title: "Error",
    description: message,
    variant: "destructive",
  })
  
  return message
}

export function handleSuccess(message: string) {
  toast({
    title: "Success",
    description: message,
  })
}

export type AsyncActionResult<T> = {
  data?: T
  error?: string
}

export async function handleAsyncAction<T>(
  action: () => Promise<T>,
  options: {
    successMessage?: string
    errorMessage?: string
    onSuccess?: (data: T) => void
    onError?: (error: string) => void
  } = {}
): Promise<AsyncActionResult<T>> {
  try {
    const data = await action()
    
    if (options.successMessage) {
      handleSuccess(options.successMessage)
    }
    
    options.onSuccess?.(data)
    return { data }
  } catch (error) {
    const errorMessage = handleError(error, options.errorMessage)
    options.onError?.(errorMessage)
    return { error: errorMessage }
  }
}
