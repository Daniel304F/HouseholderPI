import { useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '../../utils/cn'
import { useCalendar, type CalendarDay } from '../../hooks/useCalendar'
import { getRecurringDatesForMonth } from './calendar.utils'
import { CalendarTaskItem } from './CalendarTaskItem'
import { CalendarRecurringItem } from './CalendarRecurringItem'
import type { Task } from '../../api/tasks'
import type { RecurringTaskTemplate } from '../../api/recurringTasks'

export interface RecurringDateInfo {
    template: RecurringTaskTemplate
    date: Date
}

interface TaskCalendarProps {
    tasks: Task[]
    recurringTasks?: RecurringTaskTemplate[]
    onTaskClick?: (task: Task) => void
    onRecurringClick?: (template: RecurringTaskTemplate) => void
    onDateClick?: (date: Date) => void
    className?: string
    compact?: boolean
}

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

export const TaskCalendar = ({
    tasks,
    recurringTasks = [],
    onTaskClick,
    onRecurringClick,
    onDateClick,
    className,
    compact = false,
}: TaskCalendarProps) => {
    const {
        selectedDate,
        days,
        monthLabel,
        currentMonth,
        currentYear,
        previousMonth,
        nextMonth,
        selectDate,
    } = useCalendar()

    // Group tasks by date
    const tasksByDate = useMemo(() => {
        const map = new Map<string, Task[]>()
        tasks.forEach((task) => {
            if (task.dueDate) {
                const dateKey = new Date(task.dueDate).toDateString()
                const existing = map.get(dateKey) || []
                existing.push(task)
                map.set(dateKey, existing)
            }
        })
        return map
    }, [tasks])

    // Calculate recurring task dates for the current month view
    const recurringByDate = useMemo(() => {
        return getRecurringDatesForMonth(recurringTasks, currentYear, currentMonth)
    }, [recurringTasks, currentYear, currentMonth])

    const getTasksForDate = (date: Date): Task[] => {
        return tasksByDate.get(date.toDateString()) || []
    }

    const getRecurringForDate = (date: Date): RecurringTaskTemplate[] => {
        return recurringByDate.get(date.toDateString()) || []
    }

    const handleDayClick = (day: CalendarDay) => {
        selectDate(day.date)
        onDateClick?.(day.date)
    }

    // Selected date's tasks and recurring
    const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : []
    const selectedDateRecurring = selectedDate ? getRecurringForDate(selectedDate) : []

    return (
        <div className={cn('flex flex-col', className)}>
            {/* Header */}
            <div className="flex items-center justify-between pb-4">
                <h3 className="font-semibold text-neutral-900 dark:text-white">
                    {monthLabel}
                </h3>
                <div className="flex gap-1">
                    <button
                        onClick={previousMonth}
                        className={cn(
                            'rounded-lg p-1.5 transition-colors',
                            'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                            'text-neutral-600 dark:text-neutral-400'
                        )}
                        aria-label="Vorheriger Monat"
                    >
                        <ChevronLeft className="size-4" />
                    </button>
                    <button
                        onClick={nextMonth}
                        className={cn(
                            'rounded-lg p-1.5 transition-colors',
                            'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                            'text-neutral-600 dark:text-neutral-400'
                        )}
                        aria-label="Nächster Monat"
                    >
                        <ChevronRight className="size-4" />
                    </button>
                </div>
            </div>

            {/* Weekday headers */}
            <div className="mb-1 grid grid-cols-7 gap-1">
                {WEEKDAYS.map((day) => (
                    <div
                        key={day}
                        className="text-center text-xs font-medium text-neutral-500 dark:text-neutral-400"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                    const dayTasks = getTasksForDate(day.date)
                    const dayRecurring = getRecurringForDate(day.date)
                    const hasOverdueTasks = dayTasks.some(
                        (t) =>
                            t.status !== 'completed' &&
                            new Date(t.dueDate) < new Date()
                    )
                    const hasCompletedTasks = dayTasks.some(
                        (t) => t.status === 'completed'
                    )
                    const hasPendingTasks = dayTasks.some(
                        (t) => t.status !== 'completed'
                    )
                    const hasRecurring = dayRecurring.length > 0
                    const hasAnyItems = dayTasks.length > 0 || hasRecurring

                    return (
                        <button
                            key={index}
                            onClick={() => handleDayClick(day)}
                            className={cn(
                                'relative flex flex-col items-center justify-center rounded-lg p-1 transition-colors',
                                compact ? 'h-8' : 'h-10',
                                day.isCurrentMonth
                                    ? 'text-neutral-900 dark:text-white'
                                    : 'text-neutral-400 dark:text-neutral-600',
                                day.isToday &&
                                    'ring-2 ring-brand-500 ring-offset-1 dark:ring-offset-neutral-900',
                                day.isSelected &&
                                    'bg-brand-500 text-white dark:bg-brand-600',
                                !day.isSelected &&
                                    'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                            )}
                        >
                            <span className="text-sm">{day.day}</span>
                            {/* Task indicators */}
                            {hasAnyItems && !compact && (
                                <div className="absolute bottom-1 flex gap-0.5">
                                    {hasOverdueTasks && (
                                        <div className="size-1.5 rounded-full bg-error-500" />
                                    )}
                                    {hasPendingTasks && !hasOverdueTasks && (
                                        <div className="size-1.5 rounded-full bg-amber-500" />
                                    )}
                                    {hasCompletedTasks && (
                                        <div className="size-1.5 rounded-full bg-emerald-500" />
                                    )}
                                    {hasRecurring && (
                                        <div className="size-1.5 rounded-full bg-info-500" />
                                    )}
                                </div>
                            )}
                            {hasAnyItems && compact && (
                                <div
                                    className={cn(
                                        'absolute bottom-0.5 size-1 rounded-full',
                                        hasOverdueTasks
                                            ? 'bg-error-500'
                                            : hasPendingTasks
                                              ? 'bg-amber-500'
                                              : hasRecurring
                                                ? 'bg-info-500'
                                                : 'bg-emerald-500'
                                    )}
                                />
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Selected date tasks */}
            {!compact && selectedDate && (
                <div className="mt-4 border-t border-neutral-200 pt-4 dark:border-neutral-700">
                    <div className="mb-2 flex items-center gap-2">
                        <CalendarIcon className="size-4 text-neutral-500" />
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            {selectedDate.toLocaleDateString('de-DE', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                            })}
                        </span>
                    </div>
                    {selectedDateTasks.length > 0 || selectedDateRecurring.length > 0 ? (
                        <div className="space-y-2">
                            {selectedDateTasks.map((task) => (
                                <CalendarTaskItem
                                    key={task.id}
                                    task={task}
                                    onClick={() => onTaskClick?.(task)}
                                />
                            ))}
                            {selectedDateRecurring.map((template) => (
                                <CalendarRecurringItem
                                    key={template.id}
                                    template={template}
                                    onClick={() => onRecurringClick?.(template)}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Keine Aufgaben an diesem Tag
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}
