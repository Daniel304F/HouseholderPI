import { Circle, Clock, CheckCircle2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type TaskStatus = 'pending' | 'in-progress' | 'completed'
export type TaskPriority = 'low' | 'medium' | 'high'

export const PRIORITY_STYLES: Record<TaskPriority, string> = {
    low: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400',
    medium: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400',
    high: 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400',
}

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
    low: 'Niedrig',
    medium: 'Mittel',
    high: 'Hoch',
}

export const STATUS_ICONS: Record<TaskStatus, LucideIcon> = {
    pending: Circle,
    'in-progress': Clock,
    completed: CheckCircle2,
}

export const STATUS_STYLES: Record<TaskStatus, string> = {
    pending: 'text-neutral-400 dark:text-neutral-500',
    'in-progress': 'text-info-500 dark:text-info-400',
    completed: 'text-success-500 dark:text-success-400',
}

export const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
    { value: 'pending', label: 'Offen' },
    { value: 'in-progress', label: 'In Bearbeitung' },
    { value: 'completed', label: 'Erledigt' },
]

export const PRIORITY_OPTIONS: {
    value: TaskPriority
    label: string
    color: string
}[] = [
    {
        value: 'low',
        label: 'Niedrig',
        color: PRIORITY_STYLES.low,
    },
    {
        value: 'medium',
        label: 'Mittel',
        color: PRIORITY_STYLES.medium,
    },
    {
        value: 'high',
        label: 'Hoch',
        color: PRIORITY_STYLES.high,
    },
]
