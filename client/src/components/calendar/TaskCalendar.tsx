import { useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Repeat } from 'lucide-react'
import { cn } from '../../utils/cn'
import { useCalendar, type CalendarDay } from '../../hooks/useCalendar'
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

// Helper to calculate recurring task dates for a given month
const getRecurringDatesForMonth = (
    templates: RecurringTaskTemplate[],
    year: number,
    month: number
): Map<string, RecurringTaskTemplate[]> => {
    const map = new Map<string, RecurringTaskTemplate[]>()

    templates.forEach((template) => {
        if (!template.isActive) return

        const dates: Date[] = []
        const dueDays = template.dueDays || []

        switch (template.frequency) {
            case 'daily':
                // Every day of the month
                const daysInMonth = new Date(year, month + 1, 0).getDate()
                for (let d = 1; d <= daysInMonth; d++) {
                    dates.push(new Date(year, month, d))
                }
                break

            case 'weekly':
                // Every week on each day in dueDays (0 = Sunday, 1 = Monday, etc.)
                dueDays.forEach((dueDay) => {
                    const firstDay = new Date(year, month, 1)
                    const lastDay = new Date(year, month + 1, 0)
                    const current = new Date(firstDay)
                    // Find first occurrence of the day
                    while (current.getDay() !== dueDay) {
                        current.setDate(current.getDate() + 1)
                    }
                    while (current <= lastDay) {
                        dates.push(new Date(current))
                        current.setDate(current.getDate() + 7)
                    }
                })
                break

            case 'biweekly':
                // Every two weeks on each day in dueDays
                dueDays.forEach((dueDay) => {
                    const firstDayBi = new Date(year, month, 1)
                    const lastDayBi = new Date(year, month + 1, 0)
                    const currentBi = new Date(firstDayBi)
                    while (currentBi.getDay() !== dueDay) {
                        currentBi.setDate(currentBi.getDate() + 1)
                    }
                    while (currentBi <= lastDayBi) {
                        dates.push(new Date(currentBi))
                        currentBi.setDate(currentBi.getDate() + 14)
                    }
                })
                break

            case 'monthly':
                // On specific day of month (dueDays[0] = 1-31)
                const dayOfMonth = Math.min(dueDays[0] || 1, new Date(year, month + 1, 0).getDate())
                dates.push(new Date(year, month, dayOfMonth))
                break
        }

        dates.forEach((date) => {
            const dateKey = date.toDateString()
            const existing = map.get(dateKey) || []
            existing.push(template)
            map.set(dateKey, existing)
        })
    })

    return map
}

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
                                <TaskItem
                                    key={task.id}
                                    task={task}
                                    onClick={() => onTaskClick?.(task)}
                                />
                            ))}
                            {selectedDateRecurring.map((template) => (
                                <RecurringItem
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

interface TaskItemProps {
    task: Task
    onClick?: () => void
}

const TaskItem = ({ task, onClick }: TaskItemProps) => {
    const isOverdue =
        task.status !== 'completed' && new Date(task.dueDate) < new Date()

    return (
        <button
            onClick={onClick}
            className={cn(
                'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors',
                'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                'border-l-2',
                task.status === 'completed'
                    ? 'border-emerald-500'
                    : isOverdue
                      ? 'border-error-500'
                      : 'border-amber-500'
            )}
        >
            <div className="min-w-0 flex-1">
                <p
                    className={cn(
                        'truncate text-sm font-medium',
                        task.status === 'completed'
                            ? 'text-neutral-500 line-through'
                            : 'text-neutral-900 dark:text-white'
                    )}
                >
                    {task.title}
                </p>
            </div>
            <span
                className={cn(
                    'rounded px-1.5 py-0.5 text-xs font-medium',
                    task.priority === 'high'
                        ? 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400'
                        : task.priority === 'medium'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                )}
            >
                {task.priority === 'high'
                    ? 'Hoch'
                    : task.priority === 'medium'
                      ? 'Mittel'
                      : 'Niedrig'}
            </span>
        </button>
    )
}

interface RecurringItemProps {
    template: RecurringTaskTemplate
    onClick?: () => void
}

const FREQUENCY_LABELS: Record<string, string> = {
    daily: 'Täglich',
    weekly: 'Wöchentlich',
    biweekly: 'Alle 2 Wochen',
    monthly: 'Monatlich',
}

const RecurringItem = ({ template, onClick }: RecurringItemProps) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors',
                'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                'border-l-2 border-info-500'
            )}
        >
            <Repeat className="size-4 flex-shrink-0 text-info-500" />
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                    {template.title}
                </p>
            </div>
            <span className="rounded bg-info-100 px-1.5 py-0.5 text-xs font-medium text-info-700 dark:bg-info-900/30 dark:text-info-400">
                {FREQUENCY_LABELS[template.frequency] || template.frequency}
            </span>
        </button>
    )
}
