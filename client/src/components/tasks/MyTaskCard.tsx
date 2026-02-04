import { useState, useMemo } from 'react'
import { Clock, CheckCircle2, Circle, Pencil, Sparkles, ImageIcon, AlertTriangle } from 'lucide-react'
import { cn } from '../../utils/cn'
import { PriorityBadge } from './PriorityBadge'
import { TaskMetadata } from './TaskMetadata'
import type { TaskLink } from '../../api/tasks'

// Helper to check if a mime type is an image
const isImageMimeType = (mimeType: string) => mimeType.startsWith('image/')

export interface TaskAttachment {
    id: string
    filename: string
    originalName: string
    mimeType: string
    size: number
    uploadedBy: string
    uploadedAt: string
    url: string
}

export interface CompletionProof {
    filename: string
    originalName: string
    mimeType: string
    uploadedBy: string
    uploadedAt: string
    note?: string
    url: string
}

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
    attachments?: TaskAttachment[]
    completionProof?: CompletionProof | null
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

    // Check if task is overdue
    const isOverdue = useMemo(() => {
        if (isCompleted) return false
        const dueDate = new Date(task.dueDate)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        dueDate.setHours(0, 0, 0, 0)
        return dueDate < today
    }, [task.dueDate, isCompleted])

    // Get first image from attachments or completion proof
    const taskImage = useMemo(() => {
        // First check completion proof
        if (task.completionProof && isImageMimeType(task.completionProof.mimeType)) {
            return task.completionProof.url
        }
        // Then check attachments
        const imageAttachment = task.attachments?.find((a) => isImageMimeType(a.mimeType))
        return imageAttachment?.url || null
    }, [task.attachments, task.completionProof])

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
                'group relative flex w-full cursor-pointer flex-col text-left',
                'rounded-xl border overflow-hidden',
                'bg-white dark:bg-neutral-800',
                'transition-all duration-300 ease-out',
                'hover:shadow-lg',
                'hover:-translate-y-0.5',
                'active:translate-y-0 active:shadow-md',
                isCompleted && 'opacity-60 border-neutral-200 dark:border-neutral-700',
                isOverdue && !isCompleted && 'border-error-300 bg-error-50/30 dark:border-error-700 dark:bg-error-900/10 hover:border-error-400',
                !isOverdue && !isCompleted && 'border-neutral-200 dark:border-neutral-700 hover:border-brand-300 dark:hover:border-brand-600 hover:shadow-brand-500/10',
                isCompleting &&
                    'border-success-400 bg-success-50/50 dark:bg-success-900/20'
            )}
        >
            {/* Task Image */}
            {taskImage && (
                <div className="relative h-32 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-700">
                    <img
                        src={taskImage}
                        alt={task.title}
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    {task.completionProof && (
                        <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-success-500/80 px-1.5 py-0.5 text-xs font-medium text-white">
                            <ImageIcon className="size-3" />
                            Beweis
                        </div>
                    )}
                </div>
            )}

            <div className="flex items-start gap-4 p-4">
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
                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-1 mb-1">
                            {showGroupBadge && groupName && (
                                <span className="bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 inline-block rounded px-1.5 py-0.5 text-xs font-medium">
                                    {groupName}
                                </span>
                            )}
                            {isOverdue && (
                                <span className="bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium">
                                    <AlertTriangle className="size-3" />
                                    Überfällig
                                </span>
                            )}
                        </div>
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
                    <PriorityBadge priority={task.priority} />
                </div>

                {task.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
                        {task.description}
                    </p>
                )}

                {/* Meta Info */}
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
        </div>
    )
}
