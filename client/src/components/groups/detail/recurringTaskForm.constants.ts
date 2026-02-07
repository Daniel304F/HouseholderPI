import type { RecurringFrequency, TaskPriority } from '../../../api/recurringTasks'

export const RECURRING_FREQUENCIES: {
    value: RecurringFrequency
    label: string
}[] = [
    { value: 'daily', label: 'Taeglich' },
    { value: 'weekly', label: 'Woechentlich' },
    { value: 'biweekly', label: 'Alle 2 Wochen' },
    { value: 'monthly', label: 'Monatlich' },
]

export const RECURRING_PRIORITIES: {
    value: TaskPriority
    label: string
}[] = [
    { value: 'low', label: 'Niedrig' },
    { value: 'medium', label: 'Mittel' },
    { value: 'high', label: 'Hoch' },
]

export const WEEKDAYS = [
    { value: 1, label: 'Mo', fullLabel: 'Montag' },
    { value: 2, label: 'Di', fullLabel: 'Dienstag' },
    { value: 3, label: 'Mi', fullLabel: 'Mittwoch' },
    { value: 4, label: 'Do', fullLabel: 'Donnerstag' },
    { value: 5, label: 'Fr', fullLabel: 'Freitag' },
    { value: 6, label: 'Sa', fullLabel: 'Samstag' },
    { value: 0, label: 'So', fullLabel: 'Sonntag' },
]
