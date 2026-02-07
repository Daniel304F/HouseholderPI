import { useMemo } from 'react'
import type { TaskWithDetails } from '../api/tasks'

/**
 * Filter and sort completed tasks
 */
export const useCompletedTasks = (tasks: TaskWithDetails[]) => {
    return useMemo(() => {
        return tasks
            .filter((task) => task.status === 'completed')
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    }, [tasks])
}

/**
 * Get statistics for completed tasks
 */
export const useCompletedTaskStats = (tasks: TaskWithDetails[]) => {
    return useMemo(() => {
        return tasks.reduce(
            (acc, task) => {
                acc.total += 1
                if (task.priority === 'high') acc.high += 1
                if (task.priority === 'medium') acc.medium += 1
                if (task.priority === 'low') acc.low += 1
                return acc
            },
            { total: 0, high: 0, medium: 0, low: 0 }
        )
    }, [tasks])
}
