import { useMemo, useState, useCallback } from 'react'
import type { Task } from '../components/tasks'

interface UseTaskSearchOptions {
    tasks: Task[]
    /** Debounce-Zeit in ms (optional) */
    debounceMs?: number
}

interface UseTaskSearchReturn {
    /** Aktueller Suchbegriff */
    searchQuery: string
    /** Suchbegriff setzen */
    setSearchQuery: (query: string) => void
    /** Suche zurücksetzen */
    clearSearch: () => void
    /** Gefilterte Tasks */
    filteredTasks: Task[]
    /** Anzahl der Suchergebnisse */
    resultCount: number
    /** Ob gerade gesucht wird (Query nicht leer) */
    isSearching: boolean
    /** Suchergebnisse nach Status gruppiert */
    resultsByStatus: {
        pending: Task[]
        'in-progress': Task[]
        completed: Task[]
    }
}

/**
 * Hook für die globale Suche nach Aufgaben über alle Spalten
 * Sucht in Titel, Beschreibung und zugewiesener Person
 */
export const useTaskSearch = ({
    tasks,
}: UseTaskSearchOptions): UseTaskSearchReturn => {
    const [searchQuery, setSearchQuery] = useState('')

    const filteredTasks = useMemo(() => {
        if (!searchQuery.trim()) return tasks

        const query = searchQuery.toLowerCase().trim()
        return tasks.filter(
            (task) =>
                task.title.toLowerCase().includes(query) ||
                task.description?.toLowerCase().includes(query) ||
                task.assignedTo?.toLowerCase().includes(query)
        )
    }, [tasks, searchQuery])

    const resultsByStatus = useMemo(() => {
        return {
            pending: filteredTasks.filter((t) => t.status === 'pending'),
            'in-progress': filteredTasks.filter(
                (t) => t.status === 'in-progress'
            ),
            completed: filteredTasks.filter((t) => t.status === 'completed'),
        }
    }, [filteredTasks])

    const clearSearch = useCallback(() => {
        setSearchQuery('')
    }, [])

    return {
        searchQuery,
        setSearchQuery,
        clearSearch,
        filteredTasks,
        resultCount: filteredTasks.length,
        isSearching: searchQuery.trim().length > 0,
        resultsByStatus,
    }
}
