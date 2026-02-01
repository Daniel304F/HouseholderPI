import { Circle, Clock } from 'lucide-react'

export type StatusFilter = 'pending' | 'in-progress'
export type SortOption = 'dueDate' | 'priority' | 'status' | 'groupName'

export const STATUS_FILTERS: { value: StatusFilter; label: string; icon: typeof Circle }[] = [
    { value: 'pending', label: 'Offen', icon: Circle },
    { value: 'in-progress', label: 'In Bearbeitung', icon: Clock },
]

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: 'dueDate', label: 'Fälligkeit' },
    { value: 'priority', label: 'Priorität' },
    { value: 'status', label: 'Status' },
    { value: 'groupName', label: 'Gruppe' },
]

export const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 }
export const STATUS_ORDER: Record<string, number> = { 'in-progress': 0, pending: 1, completed: 2 }
