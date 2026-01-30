import { useState, useMemo, useCallback } from 'react'

export interface CalendarDay {
    date: Date
    day: number
    isCurrentMonth: boolean
    isToday: boolean
    isSelected: boolean
}

export interface UseCalendarReturn {
    currentDate: Date
    selectedDate: Date | null
    days: CalendarDay[]
    monthLabel: string
    previousMonth: () => void
    nextMonth: () => void
    selectDate: (date: Date) => void
    goToToday: () => void
}

const MONTH_NAMES_DE = [
    'Januar',
    'Februar',
    'März',
    'April',
    'Mai',
    'Juni',
    'Juli',
    'August',
    'September',
    'Oktober',
    'November',
    'Dezember',
]

export const useCalendar = (
    initialDate: Date = new Date()
): UseCalendarReturn => {
    const [currentDate, setCurrentDate] = useState(() => {
        const d = new Date(initialDate)
        d.setDate(1)
        return d
    })
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)

    const days = useMemo(() => {
        const result: CalendarDay[] = []
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()

        // First day of the month (0 = Sunday, we want Monday = 0)
        const firstDay = new Date(year, month, 1)
        const firstDayOfWeek = (firstDay.getDay() + 6) % 7 // Monday = 0

        // Last day of the month
        const lastDay = new Date(year, month + 1, 0)
        const daysInMonth = lastDay.getDate()

        // Last day of previous month
        const prevMonthLastDay = new Date(year, month, 0).getDate()

        // Today
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Days from previous month
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const day = prevMonthLastDay - i
            const date = new Date(year, month - 1, day)
            result.push({
                date,
                day,
                isCurrentMonth: false,
                isToday: date.getTime() === today.getTime(),
                isSelected: selectedDate
                    ? date.getTime() === selectedDate.getTime()
                    : false,
            })
        }

        // Days in current month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day)
            result.push({
                date,
                day,
                isCurrentMonth: true,
                isToday: date.getTime() === today.getTime(),
                isSelected: selectedDate
                    ? date.getTime() === selectedDate.getTime()
                    : false,
            })
        }

        // Days from next month (fill to 42 days = 6 rows)
        const remainingDays = 42 - result.length
        for (let day = 1; day <= remainingDays; day++) {
            const date = new Date(year, month + 1, day)
            result.push({
                date,
                day,
                isCurrentMonth: false,
                isToday: date.getTime() === today.getTime(),
                isSelected: selectedDate
                    ? date.getTime() === selectedDate.getTime()
                    : false,
            })
        }

        return result
    }, [currentDate, selectedDate])

    const monthLabel = useMemo(() => {
        return `${MONTH_NAMES_DE[currentDate.getMonth()]} ${currentDate.getFullYear()}`
    }, [currentDate])

    const previousMonth = useCallback(() => {
        setCurrentDate((prev) => {
            const d = new Date(prev)
            d.setMonth(d.getMonth() - 1)
            return d
        })
    }, [])

    const nextMonth = useCallback(() => {
        setCurrentDate((prev) => {
            const d = new Date(prev)
            d.setMonth(d.getMonth() + 1)
            return d
        })
    }, [])

    const selectDate = useCallback((date: Date) => {
        setSelectedDate(date)
    }, [])

    const goToToday = useCallback(() => {
        const today = new Date()
        today.setDate(1)
        setCurrentDate(today)
        setSelectedDate(new Date())
    }, [])

    return {
        currentDate,
        selectedDate,
        days,
        monthLabel,
        previousMonth,
        nextMonth,
        selectDate,
        goToToday,
    }
}
