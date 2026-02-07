import type { TaskWithDetails } from '../../api/tasks'

export interface MyTaskStats {
    total: number
    pending: number
    inProgress: number
    completed: number
}

export interface TaskListActions {
    onTaskClick: (task: TaskWithDetails) => void
    onEditClick: (task: TaskWithDetails) => void
    onComplete: (task: TaskWithDetails) => void
}
