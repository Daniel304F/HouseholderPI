import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
            retry: 1,
        },
        mutations: {
            onError: (error) => {
                console.error('Mutation error:', error)
            },
        },
    },
})
