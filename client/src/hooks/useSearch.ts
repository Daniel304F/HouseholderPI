import { useState, useMemo, useCallback } from 'react'

interface UseSearchOptions<T> {
    items: T[]
    searchFields: (keyof T)[]
    initialQuery?: string
}

interface UseSearchReturn<T> {
    query: string
    setQuery: (query: string) => void
    filteredItems: T[]
    clearSearch: () => void
    hasQuery: boolean
}

export const useSearch = <T extends Record<string, unknown>>({
    items,
    searchFields,
    initialQuery = '',
}: UseSearchOptions<T>): UseSearchReturn<T> => {
    const [query, setQuery] = useState(initialQuery)

    const filteredItems = useMemo(() => {
        if (!query.trim()) return items

        const lowerQuery = query.toLowerCase()

        return items.filter((item) =>
            searchFields.some((field) => {
                const value = item[field]
                if (typeof value === 'string') {
                    return value.toLowerCase().includes(lowerQuery)
                }
                if (typeof value === 'number') {
                    return value.toString().includes(lowerQuery)
                }
                return false
            })
        )
    }, [items, query, searchFields])

    const clearSearch = useCallback(() => {
        setQuery('')
    }, [])

    return {
        query,
        setQuery,
        filteredItems,
        clearSearch,
        hasQuery: query.trim().length > 0,
    }
}
