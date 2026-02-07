import { useCallback, useMemo, useState } from 'react'
import type { Task } from '../api/tasks'

export type Priority = 'low' | 'medium' | 'high'
export type ColumnStatus = 'pending' | 'in-progress' | 'completed'

export interface ColumnFilters {
    [columnId: string]: Priority[]
}

interface UseTaskFilterOptions {
    tasks: Task[]
    searchQuery?: string
    initialSearchQuery?: string
}

interface UseTaskFilterReturn {
    searchQuery: string
    setSearchQuery: (query: string) => void
    clearSearch: () => void
    isSearching: boolean
    filteredTasks: Task[]
    resultCount: number
    resultsByStatus: {
        pending: Task[]
        'in-progress': Task[]
        completed: Task[]
    }
    columnFilters: ColumnFilters
    setColumnFilter: (columnId: ColumnStatus, priorities: Priority[]) => void
    toggleColumnFilter: (columnId: ColumnStatus, priority: Priority) => void
    clearColumnFilter: (columnId: ColumnStatus) => void
    clearAllFilters: () => void
    isFilterActive: (columnId: ColumnStatus, priority: Priority) => boolean
    hasActiveFilters: (columnId: ColumnStatus) => boolean
    getFilteredTasksForColumn: (columnId: ColumnStatus) => Task[]
}

export const useTaskFilter = ({
    tasks,
    searchQuery: externalSearchQuery,
    initialSearchQuery = '',
}: UseTaskFilterOptions): UseTaskFilterReturn => {
    const [internalSearchQuery, setInternalSearchQuery] = useState(initialSearchQuery)
    const [columnFilters, setColumnFilters] = useState<ColumnFilters>({})

    const isControlled = externalSearchQuery !== undefined
    const searchQuery = externalSearchQuery ?? internalSearchQuery

    const setSearchQuery = useCallback(
        (query: string) => {
            if (isControlled) return
            setInternalSearchQuery(query)
        },
        [isControlled]
    )

    const searchFilteredTasks = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase()
        if (!normalizedQuery) return tasks

        return tasks.filter((task) => {
            return (
                task.title.toLowerCase().includes(normalizedQuery) ||
                task.description?.toLowerCase().includes(normalizedQuery) ||
                task.assignedTo?.toLowerCase().includes(normalizedQuery)
            )
        })
    }, [tasks, searchQuery])

    const filteredTasks = useMemo(() => {
        return searchFilteredTasks.filter((task) => {
            const filtersForColumn = columnFilters[task.status]
            if (!filtersForColumn || filtersForColumn.length === 0) return true
            return filtersForColumn.includes(task.priority)
        })
    }, [searchFilteredTasks, columnFilters])

    const resultsByStatus = useMemo(() => {
        return filteredTasks.reduce(
            (acc, task) => {
                acc[task.status].push(task)
                return acc
            },
            {
                pending: [],
                'in-progress': [],
                completed: [],
            } as {
                pending: Task[]
                'in-progress': Task[]
                completed: Task[]
            }
        )
    }, [filteredTasks])

    const clearSearch = useCallback(() => {
        if (isControlled) return
        setInternalSearchQuery('')
    }, [isControlled])

    const setColumnFilter = useCallback(
        (columnId: ColumnStatus, priorities: Priority[]) => {
            setColumnFilters((prev) => ({
                ...prev,
                [columnId]: priorities,
            }))
        },
        []
    )

    const toggleColumnFilter = useCallback(
        (columnId: ColumnStatus, priority: Priority) => {
            setColumnFilters((prev) => {
                const current = prev[columnId] || []
                const isActive = current.includes(priority)

                return {
                    ...prev,
                    [columnId]: isActive
                        ? current.filter((item) => item !== priority)
                        : [...current, priority],
                }
            })
        },
        []
    )

    const clearColumnFilter = useCallback((columnId: ColumnStatus) => {
        setColumnFilters((prev) => {
            const next = { ...prev }
            delete next[columnId]
            return next
        })
    }, [])

    const clearAllFilters = useCallback(() => {
        setColumnFilters({})
        if (!isControlled) {
            setInternalSearchQuery('')
        }
    }, [isControlled])

    const isFilterActive = useCallback(
        (columnId: ColumnStatus, priority: Priority) => {
            return columnFilters[columnId]?.includes(priority) ?? false
        },
        [columnFilters]
    )

    const hasActiveFilters = useCallback(
        (columnId: ColumnStatus) => {
            return (columnFilters[columnId]?.length ?? 0) > 0
        },
        [columnFilters]
    )

    const getFilteredTasksForColumn = useCallback(
        (columnId: ColumnStatus) => resultsByStatus[columnId],
        [resultsByStatus]
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
