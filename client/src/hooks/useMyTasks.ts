import { useMemo } from 'react'
import type { TaskPriority, TaskStatus, TaskWithDetails } from '../api/tasks'
import {
    MY_TASKS_PRIORITY_ORDER,
    MY_TASKS_STATUS_ORDER,
    type SortOption,
    type StatusFilter,
} from '../constants/myTasks.constants'

const UNKNOWN_GROUP_LABEL = 'Unbekannte Gruppe'

const matchesQuery = (task: TaskWithDetails, normalizedQuery: string) => {
    if (!normalizedQuery) return true

    return (
        task.title.toLowerCase().includes(normalizedQuery) ||
        task.description?.toLowerCase().includes(normalizedQuery) ||
        task.groupName?.toLowerCase().includes(normalizedQuery)
    )
}

const compareTasks = (sortBy: SortOption, a: TaskWithDetails, b: TaskWithDetails) => {
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
}

export const useFilteredTasks = (
    tasks: TaskWithDetails[],
    searchQuery: string,
    statusFilter: StatusFilter | null,
    sortBy: SortOption
) => {
    return useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase()

        return tasks
            .filter((task) => {
                if (task.status === 'completed') return false
                if (statusFilter && task.status !== statusFilter) return false
                return matchesQuery(task, normalizedQuery)
            })
            .sort((a, b) => compareTasks(sortBy, a, b))
    }, [tasks, searchQuery, statusFilter, sortBy])
}

export const useTaskStats = (tasks: TaskWithDetails[]) => {
    return useMemo(() => {
        return tasks.reduce(
            (acc, task) => {
                acc.total += 1
                if (task.status === 'pending') acc.pending += 1
                if (task.status === 'in-progress') acc.inProgress += 1
                if (task.status === 'completed') acc.completed += 1
                return acc
            },
            { total: 0, pending: 0, inProgress: 0, completed: 0 }
        )
    }, [tasks])
}

export const useTasksByGroup = (tasks: TaskWithDetails[]) => {
    return useMemo(() => {
        const grouped = tasks.reduce((acc, task) => {
            const groupName = task.groupName || UNKNOWN_GROUP_LABEL
            if (!acc[groupName]) acc[groupName] = []
            acc[groupName].push(task)
            return acc
        }, {} as Record<string, TaskWithDetails[]>)

        const sortedGroups = Object.keys(grouped).sort((a, b) =>
            a.localeCompare(b)
        )

        return sortedGroups.reduce((acc, groupName) => {
            acc[groupName] = grouped[groupName].sort(
                (a, b) =>
                    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
            )
            return acc
        }, {} as Record<string, TaskWithDetails[]>)
    }, [tasks])
}

export type MyTasksPriorityOrder = Record<TaskPriority, number>
export type MyTasksStatusOrder = Record<TaskStatus, number>
