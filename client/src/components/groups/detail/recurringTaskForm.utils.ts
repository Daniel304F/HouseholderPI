import { WEEKDAYS } from './recurringTaskForm.constants'

export const clampMonthDay = (value: number) => {
    return Math.max(1, Math.min(31, value))
}

export const toggleNumberInList = (items: number[], value: number) => {
    if (items.includes(value)) {
        return items.filter((item) => item !== value)
    }
    return [...items, value].sort((a, b) => a - b)
}

export const toggleStringInList = (items: string[], value: string) => {
    if (items.includes(value)) {
        return items.filter((item) => item !== value)
    }
    return [...items, value]
}

export const formatSelectedWeekdays = (days: number[]) => {
    return days
        .map((day) => WEEKDAYS.find((item) => item.value === day)?.fullLabel)
        .filter(Boolean)
        .join(', ')
}
