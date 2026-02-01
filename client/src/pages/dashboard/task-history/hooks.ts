import { useMemo } from 'react'
import type { TaskWithDetails } from '../../../api/tasks'

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
    return useMemo(() => ({
        total: tasks.length,
        high: tasks.filter((t) => t.priority === 'high').length,
        medium: tasks.filter((t) => t.priority === 'medium').length,
        low: tasks.filter((t) => t.priority === 'low').length,
    }), [tasks])
}
