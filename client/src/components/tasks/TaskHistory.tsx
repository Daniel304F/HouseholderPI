import { useRef, useState, useEffect } from 'react'
import { History, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../utils/cn'
import type { TaskWithDetails } from '../../api/tasks'

interface TaskHistoryProps {
    tasks: TaskWithDetails[]
    onTaskClick: (task: TaskWithDetails) => void
    maxVisible?: number
}

export const TaskHistory = ({
    tasks,
    onTaskClick,
    maxVisible = 10,
}: TaskHistoryProps) => {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(false)

    const useSwipe = tasks.length > maxVisible

    const checkScrollState = () => {
        if (!scrollRef.current) return
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
        setCanScrollLeft(scrollLeft > 0)
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }

    useEffect(() => {
        checkScrollState()
        window.addEventListener('resize', checkScrollState)
        return () => window.removeEventListener('resize', checkScrollState)
    }, [tasks])

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return
        const scrollAmount = 300
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        })
    }

    if (tasks.length === 0) return null

    const displayTasks = useSwipe ? tasks : tasks.slice(0, maxVisible)

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <History className="size-5 text-neutral-500 dark:text-neutral-400" />
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                        Historie
                    </h2>
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400">
                        {tasks.length}
                    </span>
                </div>

                {/* Scroll Controls */}
                {useSwipe && (
                    <div className="flex gap-1">
                        <button
                            onClick={() => scroll('left')}
                            disabled={!canScrollLeft}
                            className={cn(
                                'rounded-lg p-1.5 transition-colors',
                                canScrollLeft
                                    ? 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'
                                    : 'text-neutral-300 dark:text-neutral-600'
                            )}
                            aria-label="Nach links scrollen"
                        >
                            <ChevronLeft className="size-5" />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            disabled={!canScrollRight}
                            className={cn(
                                'rounded-lg p-1.5 transition-colors',
                                canScrollRight
                                    ? 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'
                                    : 'text-neutral-300 dark:text-neutral-600'
                            )}
                            aria-label="Nach rechts scrollen"
                        >
                            <ChevronRight className="size-5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Task Cards */}
            {useSwipe ? (
                <div className="relative">
                    {/* Gradient fade indicators */}
                    {canScrollLeft && (
                        <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-8 bg-gradient-to-r from-white dark:from-neutral-900" />
                    )}
                    {canScrollRight && (
                        <div className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-8 bg-gradient-to-l from-white dark:from-neutral-900" />
                    )}

                    {/* Scrollable Container */}
                    <div
                        ref={scrollRef}
                        onScroll={checkScrollState}
                        className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
                        style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                        }}
                    >
                        {displayTasks.map((task) => (
                            <HistoryCard
                                key={task.id}
                                task={task}
                                onClick={() => onTaskClick(task)}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {displayTasks.map((task) => (
                        <HistoryCard
                            key={task.id}
                            task={task}
                            onClick={() => onTaskClick(task)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

interface HistoryCardProps {
    task: TaskWithDetails
    onClick: () => void
}

const HistoryCard = ({ task, onClick }: HistoryCardProps) => {
    const completedDate = task.updatedAt
        ? new Date(task.updatedAt).toLocaleDateString('de-DE', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
          })
        : null

    return (
        <button
            onClick={onClick}
            className={cn(
                'flex-shrink-0 snap-start',
                'w-64 rounded-xl border p-4 text-left transition-all',
                'hover:border-brand-300 border-neutral-200 bg-white hover:shadow-md',
                'dark:hover:border-brand-600 dark:border-neutral-700 dark:bg-neutral-800'
            )}
        >
            {/* Group Badge */}
            {task.groupName && (
                <span className="mb-2 inline-block rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400">
                    {task.groupName}
                </span>
            )}

            {/* Title */}
            <h3 className="line-clamp-2 font-medium text-neutral-900 dark:text-white">
                {task.title}
            </h3>

            {/* Completed Date */}
            {completedDate && (
                <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                    Erledigt am {completedDate}
                </p>
            )}

            {/* Priority Badge */}
            <div className="mt-3 flex items-center justify-between">
                <span
                    className={cn(
                        'rounded px-2 py-0.5 text-xs font-medium',
                        task.priority === 'high'
                            ? 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400'
                            : task.priority === 'medium'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                              : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400'
                    )}
                >
                    {task.priority === 'high'
                        ? 'Hoch'
                        : task.priority === 'medium'
                          ? 'Mittel'
                          : 'Niedrig'}
                </span>

                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    Erledigt
                </span>
            </div>
        </button>
    )
}
