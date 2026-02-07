import { useMemo } from 'react'
import type { TaskWithDetails } from '../api/tasks'
import {
    MY_TASKS_PRIORITY_ORDER,
    MY_TASKS_STATUS_ORDER,
    type SortOption,
    type StatusFilter,
} from '../constants/myTasks.constants'

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
                        return MY_TASKS_PRIORITY_ORDER[a.priority] - MY_TASKS_PRIORITY_ORDER[b.priority]
                    case 'status':
                        return MY_TASKS_STATUS_ORDER[a.status] - MY_TASKS_STATUS_ORDER[b.status]
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
