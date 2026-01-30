import { Pencil } from 'lucide-react'
import { cn } from '../../utils/cn'
import { STATUS_ICONS, STATUS_STYLES } from '../../constants/task.constants'
import { PriorityBadge } from './PriorityBadge'
import { TaskMetadata } from './TaskMetadata'
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
}

interface TaskCardProps {
    task: Task
    onClick: () => void
    onEditClick?: () => void
    showGroupBadge?: boolean
    groupName?: string
    subtaskCount?: number
}

export const TaskCard = ({
    task,
    onClick,
    onEditClick,
    showGroupBadge = false,
    groupName,
    subtaskCount = 0,
}: TaskCardProps) => {
    const StatusIcon = STATUS_ICONS[task.status]

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        onEditClick?.()
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
                task.status === 'completed' && 'opacity-60'
            )}
        >
            {/* Edit Button*/}
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

            {/* Status Icon */}
            <div
                className={cn(
                    'mt-0.5 transition-transform duration-300 group-hover:scale-110',
                    STATUS_STYLES[task.status]
                )}
            >
                <StatusIcon className="size-5" />
            </div>

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
                                'transition-colors duration-300',
                                'group-hover:text-brand-600 dark:group-hover:text-brand-400',
                                task.status === 'completed' && 'line-through'
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
                        dueDate={task.dueDate}
                        status={task.status}
                        subtaskCount={subtaskCount}
                        linkedTasks={task.linkedTasks}
                    />
                </div>
            </div>
        </div>
    )
}
