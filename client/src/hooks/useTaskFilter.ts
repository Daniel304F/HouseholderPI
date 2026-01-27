import { useMemo, useState, useCallback } from 'react'
import type { Task } from '../components/tasks'

export type Priority = 'low' | 'medium' | 'high'
export type ColumnStatus = 'pending' | 'in-progress' | 'completed'

export interface ColumnFilters {
    [columnId: string]: Priority[]
}

interface UseTaskFilterOptions {
    tasks: Task[]
    initialSearchQuery?: string
}

interface UseTaskFilterReturn {
    /** Aktueller Suchbegriff */
    searchQuery: string
    /** Suchbegriff setzen */
    setSearchQuery: (query: string) => void
    /** Suche zurücksetzen */
    clearSearch: () => void
    /** Ob gerade gesucht wird (Query nicht leer) */
    isSearching: boolean
    /** Gefilterte Tasks basierend auf Suche und Prioritätsfiltern */
    filteredTasks: Task[]
    /** Anzahl der Suchergebnisse */
    resultCount: number
    /** Suchergebnisse nach Status gruppiert */
    resultsByStatus: {
        pending: Task[]
        'in-progress': Task[]
        completed: Task[]
    }
    /** Aktive Filter pro Spalte */
    columnFilters: ColumnFilters
    /** Filter für eine Spalte setzen */
    setColumnFilter: (columnId: ColumnStatus, priorities: Priority[]) => void
    /** Einzelnen Filter für Spalte umschalten */
    toggleColumnFilter: (columnId: ColumnStatus, priority: Priority) => void
    /** Filter für eine Spalte zurücksetzen */
    clearColumnFilter: (columnId: ColumnStatus) => void
    /** Alle Filter zurücksetzen */
    clearAllFilters: () => void
    /** Prüfen ob ein Filter aktiv ist */
    isFilterActive: (columnId: ColumnStatus, priority: Priority) => boolean
    /** Prüfen ob Spalte gefiltert wird */
    hasActiveFilters: (columnId: ColumnStatus) => boolean
    /** Tasks für eine bestimmte Spalte abrufen (mit Filtern) */
    getFilteredTasksForColumn: (columnId: ColumnStatus) => Task[]
}

/**
 * Hook zum Filtern von Tasks nach Priorität innerhalb von Spalten
 * und globaler Suche über alle Spalten
 */
export const useTaskFilter = ({
    tasks,
    initialSearchQuery = '',
}: UseTaskFilterOptions): UseTaskFilterReturn => {
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
    const [columnFilters, setColumnFilters] = useState<ColumnFilters>({})

    // Globale Suche über alle Tasks
    const searchFilteredTasks = useMemo(() => {
        if (!searchQuery.trim()) return tasks

        const query = searchQuery.toLowerCase().trim()
        return tasks.filter(
            (task) =>
                task.title.toLowerCase().includes(query) ||
                task.description?.toLowerCase().includes(query) ||
                task.assignedTo?.toLowerCase().includes(query)
        )
    }, [tasks, searchQuery])

    // Tasks nach Spalten-Filtern filtern
    const filteredTasks = useMemo(() => {
        return searchFilteredTasks.filter((task) => {
            const columnFilter = columnFilters[task.status]
            // Wenn kein Filter für die Spalte gesetzt ist, Task anzeigen
            if (!columnFilter || columnFilter.length === 0) return true
            // Sonst nur anzeigen, wenn Priorität im Filter enthalten
            return columnFilter.includes(task.priority)
        })
    }, [searchFilteredTasks, columnFilters])

    // Suchergebnisse nach Status gruppiert
    const resultsByStatus = useMemo(() => {
        return {
            pending: filteredTasks.filter((t) => t.status === 'pending'),
            'in-progress': filteredTasks.filter(
                (t) => t.status === 'in-progress'
            ),
            completed: filteredTasks.filter((t) => t.status === 'completed'),
        }
    }, [filteredTasks])

    // Suche zurücksetzen
    const clearSearch = useCallback(() => {
        setSearchQuery('')
    }, [])

    // Filter für eine Spalte setzen
    const setColumnFilter = useCallback(
        (columnId: ColumnStatus, priorities: Priority[]) => {
            setColumnFilters((prev) => ({
                ...prev,
                [columnId]: priorities,
            }))
        },
        []
    )

    // Einzelnen Filter umschalten
    const toggleColumnFilter = useCallback(
        (columnId: ColumnStatus, priority: Priority) => {
            setColumnFilters((prev) => {
                const currentFilters = prev[columnId] || []
                const isActive = currentFilters.includes(priority)

                return {
                    ...prev,
                    [columnId]: isActive
                        ? currentFilters.filter((p) => p !== priority)
                        : [...currentFilters, priority],
                }
            })
        },
        []
    )

    // Filter für Spalte zurücksetzen
    const clearColumnFilter = useCallback((columnId: ColumnStatus) => {
        setColumnFilters((prev) => {
            const { [columnId]: _, ...rest } = prev
            return rest
        })
    }, [])

    // Alle Filter zurücksetzen
    const clearAllFilters = useCallback(() => {
        setColumnFilters({})
        setSearchQuery('')
    }, [])

    // Prüfen ob Filter aktiv
    const isFilterActive = useCallback(
        (columnId: ColumnStatus, priority: Priority) => {
            return columnFilters[columnId]?.includes(priority) ?? false
        },
        [columnFilters]
    )

    // Prüfen ob Spalte gefiltert wird
    const hasActiveFilters = useCallback(
        (columnId: ColumnStatus) => {
            return (columnFilters[columnId]?.length ?? 0) > 0
        },
        [columnFilters]
    )

    // Tasks für bestimmte Spalte abrufen
    const getFilteredTasksForColumn = useCallback(
        (columnId: ColumnStatus) => {
            return filteredTasks.filter((task) => task.status === columnId)
        },
        [filteredTasks]
    )

    return {
        searchQuery,
        setSearchQuery,
        clearSearch,
        isSearching: searchQuery.trim().length > 0,
        filteredTasks,
        resultCount: filteredTasks.length,
        resultsByStatus,
        columnFilters,
        setColumnFilter,
        toggleColumnFilter,
        clearColumnFilter,
        clearAllFilters,
        isFilterActive,
        hasActiveFilters,
        getFilteredTasksForColumn,
    }
}
