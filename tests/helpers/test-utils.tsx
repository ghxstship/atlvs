import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Helper to wait for async operations
export const waitForLoadingToFinish = () => {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

// Helper to create mock API handlers
export function createMockApiHandler(endpoint: string, response: Record<string, unknown>, status = 200) {
  return {
    url: endpoint,
    method: 'GET',
    status,
    response,
  }
}

// Helper to simulate user interactions
export async function fillForm(form: HTMLFormElement, data: Record<string, string>) {
  const { getByLabelText } = await import('@testing-library/react')
  
  for (const [key, value] of Object.entries(data)) {
    const input = getByLabelText(form, key)
    if (input) {
      const { fireEvent } = await import('@testing-library/react')
      fireEvent.change(input, { target: { value } })
    }
  }
}
