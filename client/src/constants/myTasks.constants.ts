export type StatusFilter = 'pending' | 'in-progress'
export type SortOption = 'dueDate' | 'priority' | 'status' | 'groupName'

export const DEFAULT_MY_TASKS_SORT: SortOption = 'dueDate'

export const MY_TASKS_PRIORITY_ORDER: Record<string, number> = {
    high: 0,
    medium: 1,
    low: 2,
}

export const MY_TASKS_STATUS_ORDER: Record<string, number> = {
    'in-progress': 0,
    pending: 1,
    completed: 2,
}
