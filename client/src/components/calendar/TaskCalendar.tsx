import { useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '../../utils/cn'
import { useCalendar, type CalendarDay } from '../../hooks/useCalendar'
import type { Task } from '../../api/tasks'

interface TaskCalendarProps {
    tasks: Task[]
    onTaskClick?: (task: Task) => void
    onDateClick?: (date: Date) => void
    className?: string
    compact?: boolean
}

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

export const TaskCalendar = ({
    tasks,
    onTaskClick,
    onDateClick,
    className,
    compact = false,
}: TaskCalendarProps) => {
    const {
        selectedDate,
        days,
        monthLabel,
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

    const getTasksForDate = (date: Date): Task[] => {
        return tasksByDate.get(date.toDateString()) || []
    }

    const handleDayClick = (day: CalendarDay) => {
        selectDate(day.date)
        onDateClick?.(day.date)
    }

    // Selected date's tasks
    const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : []

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
                            {dayTasks.length > 0 && !compact && (
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
                                </div>
                            )}
                            {dayTasks.length > 0 && compact && (
                                <div
                                    className={cn(
                                        'absolute bottom-0.5 size-1 rounded-full',
                                        hasOverdueTasks
                                            ? 'bg-error-500'
                                            : hasPendingTasks
                                              ? 'bg-amber-500'
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
                    {selectedDateTasks.length > 0 ? (
                        <div className="space-y-2">
                            {selectedDateTasks.map((task) => (
                                <TaskItem
                                    key={task.id}
                                    task={task}
                                    onClick={() => onTaskClick?.(task)}
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
