import { useMemo } from 'react'
import type { TaskWithDetails } from '../api/tasks'

export type StatusFilter = 'pending' | 'in-progress'
export type SortOption = 'dueDate' | 'priority' | 'status' | 'groupName'

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 }
const STATUS_ORDER: Record<string, number> = { 'in-progress': 0, pending: 1, completed: 2 }

/**
 * Custom hook for filtering and sorting tasks
 */
export const useFilteredTasks = (
    tasks: TaskWithDetails[],
    searchQuery: string,
    statusFilter: StatusFilter | null,
    sortBy: SortOption
) => {
    return useMemo(() => {
        return tasks
            .filter((task) => {
                // Exclude completed tasks from main list (they go to history)
                if (task.status === 'completed') return false
                if (statusFilter && task.status !== statusFilter) return false
                if (searchQuery) {
                    const query = searchQuery.toLowerCase()
                    return (
                        task.title.toLowerCase().includes(query) ||
                        task.description?.toLowerCase().includes(query) ||
                        task.groupName?.toLowerCase().includes(query)
                    )
                }
                return true
            })
            .sort((a, b) => {
                switch (sortBy) {
                    case 'dueDate':
                        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
                    case 'priority':
                        return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
                    case 'status':
                        return STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
                    case 'groupName':
                        return (a.groupName || '').localeCompare(b.groupName || '')
                    default:
                        return 0
                }
            })
    }, [tasks, searchQuery, statusFilter, sortBy])
}

/**
 * Custom hook for task statistics
 */
export const useTaskStats = (tasks: TaskWithDetails[]) => {
    return useMemo(() => ({
        total: tasks.length,
        pending: tasks.filter((t) => t.status === 'pending').length,
        inProgress: tasks.filter((t) => t.status === 'in-progress').length,
        completed: tasks.filter((t) => t.status === 'completed').length,
    }), [tasks])
}

/**
 * Custom hook for grouping tasks by group name
 */
export const useTasksByGroup = (tasks: TaskWithDetails[]) => {
    return useMemo(() => {
        return tasks.reduce((acc, task) => {
            const groupName = task.groupName || 'Unbekannte Gruppe'
            if (!acc[groupName]) acc[groupName] = []
            acc[groupName].push(task)
            return acc
        }, {} as Record<string, TaskWithDetails[]>)
    }, [tasks])
}
