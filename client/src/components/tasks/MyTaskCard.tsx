import {
    useMemo,
    useState,
    type KeyboardEvent,
    type MouseEvent,
} from 'react'
import {
    CheckCircle2,
    Circle,
    Clock,
    Pencil,
    Sparkles,
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { CardActionButton, GroupBadge, OverdueBadge } from '../ui'
import { PriorityBadge } from './PriorityBadge'
import { TaskMetadata } from './TaskMetadata'
import type { TaskWithDetails } from '../../api/tasks'

interface MyTaskCardProps {
    task: TaskWithDetails
    onClick: () => void
    onEditClick?: () => void
    onComplete?: () => void
    showGroupBadge?: boolean
    groupName?: string
    subtaskCount?: number
}

const completionDelayMs = 600
const celebrationDurationMs = 1500

export const MyTaskCard = ({
    task,
    onClick,
    onEditClick,
    onComplete,
    showGroupBadge = false,
    groupName,
    subtaskCount = 0,
}: MyTaskCardProps) => {
    const [isCompleting, setIsCompleting] = useState(false)
    const [showCelebration, setShowCelebration] = useState(false)

    const isCompleted = task.status === 'completed'

    const isOverdue = useMemo(() => {
        if (isCompleted) return false

        const dueDate = new Date(task.dueDate)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        dueDate.setHours(0, 0, 0, 0)

        return dueDate < today
    }, [task.dueDate, isCompleted])

    const celebrationParticles = useMemo(
        () =>
            Array.from({ length: 12 }, (_, index) => ({
                id: `particle-${index}`,
                left: `${8 + ((index * 7) % 84)}%`,
                top: `${12 + ((index * 13) % 72)}%`,
                delay: `${index * 0.06}s`,
                colorClass:
                    index % 3 === 0
                        ? 'text-warning-400'
                        : index % 3 === 1
                          ? 'text-success-400'
                          : 'text-info-400',
            })),
        []
    )

    const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        if (event.key !== 'Enter' && event.key !== ' ') return
        event.preventDefault()
        onClick()
    }

    const handleEditClick = (event: MouseEvent) => {
        event.stopPropagation()
        onEditClick?.()
    }

    const handleCheckboxClick = async (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation()
        if (isCompleted || isCompleting || !onComplete) return

        setIsCompleting(true)
        setShowCelebration(true)

        await new Promise((resolve) => setTimeout(resolve, completionDelayMs))
        onComplete()

        setTimeout(() => {
            setShowCelebration(false)
            setIsCompleting(false)
        }, celebrationDurationMs)
    }

    return (
        <article
            onClick={onClick}
            onKeyDown={handleCardKeyDown}
            role="button"
            tabIndex={0}
            aria-label={`Aufgabe ${task.title}`}
            className={cn(
                'group relative flex w-full cursor-pointer flex-col overflow-hidden rounded-xl border text-left',
                'bg-white/95 dark:bg-neutral-800/95',
                'border-neutral-200/85 dark:border-neutral-700/85',
                'shadow-[var(--shadow-sm)] transition-[transform,box-shadow,border-color,background-color] duration-200 ease-out',
                'hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/45',
                'active:scale-[0.99] active:shadow-[var(--shadow-sm)]',
                isCompleted && 'opacity-60',
                isOverdue &&
                    !isCompleted &&
                    'border-error-300 bg-error-50/35 dark:border-error-700 dark:bg-error-900/12 hover:border-error-400',
                !isOverdue &&
                    !isCompleted &&
                    'hover:border-brand-300 dark:hover:border-brand-600/60',
                isCompleting &&
                    'border-success-400 bg-success-50/60 dark:bg-success-900/20'
            )}
        >
            <div className="relative flex items-start gap-4 p-4">
                {showCelebration && (
                    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
                        {celebrationParticles.map((particle) => (
                            <span
                                key={particle.id}
                                className="absolute animate-bounce"
                                style={{
                                    left: particle.left,
                                    top: particle.top,
                                    animationDelay: particle.delay,
                                    animationDuration: '0.6s',
                                }}
                            >
                                <Sparkles
                                    className={cn('size-4', particle.colorClass)}
                                />
                            </span>
                        ))}
                        <div className="absolute inset-0 rounded-xl bg-success-400/25 animate-pulse" />
                    </div>
                )}

                {onEditClick && (
                    <CardActionButton
                        icon={<Pencil className="size-3.5" />}
                        onClick={handleEditClick}
                        title="Aufgabe bearbeiten"
                        className="absolute right-2 top-2 z-10 opacity-100 transition-opacity duration-200 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:opacity-100"
                    />
                )}

                <button
                    type="button"
                    onClick={handleCheckboxClick}
                    disabled={isCompleted || isCompleting}
                    className={cn(
                        'mt-0.5 shrink-0 transition-all duration-200',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/45',
                        !isCompleted &&
                            !isCompleting &&
                            'cursor-pointer hover:scale-110 active:scale-105',
                        isCompleting && 'scale-110'
                    )}
                    title={
                        isCompleted ? 'Bereits erledigt' : 'Als erledigt markieren'
                    }
                    aria-label={
                        isCompleted ? 'Bereits erledigt' : 'Als erledigt markieren'
                    }
                >
                    {isCompleted ? (
                        <CheckCircle2 className="size-5 text-success-500 dark:text-success-400" />
                    ) : isCompleting ? (
                        <span className="relative block">
                            <CheckCircle2 className="size-5 animate-pulse text-success-500" />
                            <span className="absolute inset-0 rounded-full bg-success-500 opacity-75 animate-ping" />
                        </span>
                    ) : task.status === 'in-progress' ? (
                        <Clock className="size-5 text-info-500 dark:text-info-400" />
                    ) : (
                        <Circle className="size-5 text-neutral-400 transition-colors hover:text-success-500 dark:text-neutral-500 dark:hover:text-success-400" />
                    )}
                </button>

                <div className="min-w-0 flex-1 pr-10">
                    <header className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                            <div className="mb-1 flex flex-wrap items-center gap-1">
                                {showGroupBadge && groupName && (
                                    <GroupBadge name={groupName} />
                                )}
                                {isOverdue && <OverdueBadge />}
                            </div>
                            <h3
                                className={cn(
                                    'font-medium text-neutral-900 transition-colors duration-200 dark:text-white',
                                    'group-hover:text-brand-700 dark:group-hover:text-brand-300',
                                    (isCompleted || isCompleting) && 'line-through',
                                    isCompleting && 'text-success-600 dark:text-success-400'
                                )}
                            >
                                {task.title}
                            </h3>
                        </div>

                        <PriorityBadge priority={task.priority} />
                    </header>

                    {task.description && (
                        <p className="mt-1 max-w-[44ch] line-clamp-2 text-sm leading-5 text-neutral-500 dark:text-neutral-400">
                            {task.description}
                        </p>
                    )}

                    <div className="mt-2">
                        <TaskMetadata
                            assignedTo={task.assignedTo}
                            assignedToName={task.assignedToName}
                            dueDate={task.dueDate}
                            status={task.status}
                            subtaskCount={subtaskCount}
                            linkedTasks={task.linkedTasks}
                        />
                    </div>
                </div>
            </div>
        </article>
    )
}
