import { useState } from 'react'
import {
    Clock,
    User,
    AlertCircle,
    CheckCircle2,
    Circle,
    Pencil,
    Link2,
    ListTree,
    Sparkles,
} from 'lucide-react'
import { cn } from '../../utils/cn'
import type { TaskLink } from '../../api/tasks'

export interface Task {
    id: string
    title: string
    description?: string
    status: 'pending' | 'in-progress' | 'completed'
    priority: 'low' | 'medium' | 'high'
    assignedTo: string | null
    dueDate: string
    groupId?: string
    createdBy?: string
    createdAt?: string
    updatedAt?: string
    parentTaskId?: string | null
    linkedTasks?: TaskLink[]
    assignedToName?: string
    createdByName?: string
}

interface MyTaskCardProps {
    task: Task
    onClick: () => void
    onEditClick?: () => void
    onComplete?: () => void
    showGroupBadge?: boolean
    groupName?: string
    subtaskCount?: number
}

const priorityStyles = {
    low: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400',
    medium: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400',
    high: 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400',
}

const priorityLabels = {
    low: 'Niedrig',
    medium: 'Mittel',
    high: 'Hoch',
}

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

    const isOverdue =
        task.status !== 'completed' && new Date(task.dueDate) < new Date()
    const hasLinks = task.linkedTasks && task.linkedTasks.length > 0
    const isCompleted = task.status === 'completed'

    const formatDueDate = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diffDays = Math.ceil(
            (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )

        if (diffDays < 0) return `${Math.abs(diffDays)} Tag(e) überfällig`
        if (diffDays === 0) return 'Heute'
        if (diffDays === 1) return 'Morgen'
        if (diffDays < 7) return `In ${diffDays} Tagen`
        return date.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
        })
    }

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        onEditClick?.()
    }

    const handleCheckboxClick = async (e: React.MouseEvent) => {
        e.stopPropagation()
        if (isCompleted || isCompleting || !onComplete) return

        setIsCompleting(true)
        setShowCelebration(true)

        // Delay for animation
        await new Promise((resolve) => setTimeout(resolve, 600))

        onComplete()

        // Hide celebration after animation
        setTimeout(() => {
            setShowCelebration(false)
            setIsCompleting(false)
        }, 1500)
    }

    return (
        <div
            onClick={onClick}
            className={cn(
                'group relative flex w-full cursor-pointer items-start gap-4 p-4 text-left',
                'rounded-xl border',
                'bg-white dark:bg-neutral-800',
                'border-neutral-200 dark:border-neutral-700',
                'transition-all duration-300 ease-out',
                'hover:border-brand-300 dark:hover:border-brand-600',
                'hover:shadow-brand-500/10 hover:shadow-lg',
                'hover:-translate-y-0.5',
                'active:translate-y-0 active:shadow-md',
                isCompleted && 'opacity-60',
                isCompleting &&
                    'border-success-400 bg-success-50/50 dark:bg-success-900/20'
            )}
        >
            {/* Celebration Animation */}
            {showCelebration && (
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
                    {/* Confetti particles */}
                    {[...Array(12)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute animate-bounce"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${i * 0.1}s`,
                                animationDuration: '0.6s',
                            }}
                        >
                            <Sparkles
                                className={cn(
                                    'size-4',
                                    i % 3 === 0
                                        ? 'text-yellow-400'
                                        : i % 3 === 1
                                          ? 'text-green-400'
                                          : 'text-blue-400'
                                )}
                            />
                        </div>
                    ))}
                    {/* Success glow */}
                    <div className="bg-success-400/30 absolute inset-0 animate-pulse rounded-xl" />
                </div>
            )}

            {/* Edit Button */}
            {onEditClick && (
                <button
                    onClick={handleEditClick}
                    className={cn(
                        'absolute top-2 right-2 z-10',
                        'flex h-7 w-7 items-center justify-center rounded-md',
                        'bg-neutral-100 dark:bg-neutral-700',
                        'text-neutral-500 dark:text-neutral-400',
                        'opacity-0 group-hover:opacity-100',
                        'hover:bg-brand-100 hover:text-brand-600',
                        'dark:hover:bg-brand-900/30 dark:hover:text-brand-400',
                        'transition-all duration-200'
                    )}
                    title="Aufgabe bearbeiten"
                >
                    <Pencil className="size-3.5" />
                </button>
            )}

            {/* Checkbox / Status Icon */}
            <button
                onClick={handleCheckboxClick}
                disabled={isCompleted || isCompleting}
                className={cn(
                    'mt-0.5 shrink-0 transition-all duration-300',
                    !isCompleted &&
                        !isCompleting &&
                        'cursor-pointer hover:scale-125',
                    isCompleting && 'scale-125'
                )}
                title={
                    isCompleted ? 'Bereits erledigt' : 'Als erledigt markieren'
                }
            >
                {isCompleted ? (
                    <CheckCircle2 className="text-success-500 dark:text-success-400 size-5" />
                ) : isCompleting ? (
                    <div className="relative">
                        <CheckCircle2 className="text-success-500 size-5 animate-pulse" />
                        <div className="bg-success-500 absolute inset-0 animate-ping rounded-full opacity-75" />
                    </div>
                ) : task.status === 'in-progress' ? (
                    <Clock className="text-info-500 dark:text-info-400 size-5" />
                ) : (
                    <Circle className="hover:text-success-500 dark:hover:text-success-400 size-5 text-neutral-400 transition-colors dark:text-neutral-500" />
                )}
            </button>

            {/* Content */}
            <div className="min-w-0 flex-1 pr-6">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        {/* Group Badge */}
                        {showGroupBadge && groupName && (
                            <span className="bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 mb-1 inline-block rounded px-1.5 py-0.5 text-xs font-medium">
                                {groupName}
                            </span>
                        )}
                        <h3
                            className={cn(
                                'font-medium text-neutral-900 dark:text-white',
                                'transition-all duration-300',
                                'group-hover:text-brand-600 dark:group-hover:text-brand-400',
                                (isCompleted || isCompleting) && 'line-through',
                                isCompleting && 'text-success-600'
                            )}
                        >
                            {task.title}
                        </h3>
                    </div>

                    {/* Priority Badge */}
                    <span
                        className={cn(
                            'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                            priorityStyles[task.priority]
                        )}
                    >
                        {priorityLabels[task.priority]}
                    </span>
                </div>

                {task.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
                        {task.description}
                    </p>
                )}

                {/* Meta Info */}
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                    {/* Assigned To - Show name instead of ID */}
                    <div className="flex items-center gap-1">
                        <User className="size-3.5" />
                        <span>
                            {task.assignedToName ||
                                task.assignedTo ||
                                'Nicht zugewiesen'}
                        </span>
                    </div>

                    {/* Due Date */}
                    <div
                        className={cn(
                            'flex items-center gap-1',
                            isOverdue && 'text-error-500 dark:text-error-400'
                        )}
                    >
                        {isOverdue ? (
                            <AlertCircle className="size-3.5" />
                        ) : (
                            <Clock className="size-3.5" />
                        )}
                        <span>{formatDueDate(task.dueDate)}</span>
                    </div>

                    {/* Subtask Counter */}
                    {subtaskCount > 0 && (
                        <div className="text-info-500 dark:text-info-400 flex items-center gap-1">
                            <ListTree className="size-3.5" />
                            <span>
                                {subtaskCount} Unteraufgabe
                                {subtaskCount > 1 ? 'n' : ''}
                            </span>
                        </div>
                    )}

                    {/* Links Indicator */}
                    {hasLinks && (
                        <div className="text-brand-500 dark:text-brand-400 flex items-center gap-1">
                            <Link2 className="size-3.5" />
                            <span>
                                {task.linkedTasks?.length} Verknüpfung
                                {task.linkedTasks!.length > 1 ? 'en' : ''}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
