import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
    Clock,
    User,
    Calendar,
    Flag,
    Users,
    CheckCircle2,
    Circle,
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { tasksApi, type Task } from '../../api/tasks'
import { formatDate, isOverdue } from '../../utils/date.utils'

type TaskStatus = Task['status']
type TaskPriority = Task['priority']

interface TaskDetails {
    status: TaskStatus
    priority: TaskPriority
    assignedTo?: string | null
    assignedToName?: string
    dueDate: string
    groupName?: string
    createdBy: string
    createdByName?: string
    createdAt: string
}

interface TaskDetailSidebarProps {
    groupId: string
    taskId: string
    taskDetails: TaskDetails
}

const statusOptions = [
    { value: 'pending' as const, label: 'Offen', icon: Circle },
    { value: 'in-progress' as const, label: 'In Bearbeitung', icon: Clock },
    { value: 'completed' as const, label: 'Erledigt', icon: CheckCircle2 },
]

const priorityOptions = [
    {
        value: 'low' as const,
        label: 'Niedrig',
        color: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400',
    },
    {
        value: 'medium' as const,
        label: 'Mittel',
        color: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400',
    },
    {
        value: 'high' as const,
        label: 'Hoch',
        color: 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400',
    },
]

/**
 * Sidebar component for TaskDetailView
 * Displays status controls and task metadata
 */
export const TaskDetailSidebar = ({
    groupId,
    taskId,
    taskDetails,
}: TaskDetailSidebarProps) => {
    const queryClient = useQueryClient()

    const updateStatusMutation = useMutation({
        mutationFn: (status: TaskStatus) =>
            tasksApi.updateTask(groupId, taskId, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['taskDetails', groupId, taskId],
            })
            queryClient.invalidateQueries({ queryKey: ['tasks', groupId] })
        },
    })

    const currentPriority = priorityOptions.find(
        (p) => p.value === taskDetails.priority
    )

    const taskIsOverdue =
        taskDetails.status !== 'completed' && isOverdue(taskDetails.dueDate)

    return (
        <div className="space-y-4">
            {/* Status Section */}
            <StatusSection
                currentStatus={taskDetails.status}
                onStatusChange={(status) => updateStatusMutation.mutate(status)}
                isUpdating={updateStatusMutation.isPending}
            />

            {/* Details Section */}
            <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
                <h4 className="mb-3 text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                    Details
                </h4>
                <div className="space-y-3">
                    {/* Priority */}
                    <DetailRow
                        icon={Flag}
                        label="Priorität"
                        value={
                            <span
                                className={cn(
                                    'rounded-full px-2 py-0.5 text-xs font-medium',
                                    currentPriority?.color
                                )}
                            >
                                {currentPriority?.label}
                            </span>
                        }
                    />

                    {/* Assigned To */}
                    <DetailRow
                        icon={User}
                        label="Zugewiesen an"
                        value={
                            taskDetails.assignedToName ||
                            taskDetails.assignedTo ||
                            'Niemand'
                        }
                    />

                    {/* Due Date */}
                    <DetailRow
                        icon={Calendar}
                        label="Fällig am"
                        value={formatDate(taskDetails.dueDate)}
                        valueClassName={
                            taskIsOverdue
                                ? 'text-error-600 dark:text-error-400'
                                : undefined
                        }
                    />

                    {/* Group */}
                    {taskDetails.groupName && (
                        <DetailRow
                            icon={Users}
                            label="Gruppe"
                            value={taskDetails.groupName}
                        />
                    )}

                    {/* Created By */}
                    <DetailRow
                        icon={User}
                        label="Erstellt von"
                        value={
                            taskDetails.createdByName || taskDetails.createdBy
                        }
                    />

                    {/* Created At */}
                    <DetailRow
                        icon={Clock}
                        label="Erstellt am"
                        value={formatDate(taskDetails.createdAt)}
                    />
                </div>
            </div>
        </div>
    )
}

/**
 * Status buttons section
 */
interface StatusSectionProps {
    currentStatus: TaskStatus
    onStatusChange: (status: TaskStatus) => void
    isUpdating: boolean
}

const StatusSection = ({
    currentStatus,
    onStatusChange,
    isUpdating,
}: StatusSectionProps) => {
    return (
        <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
            <h4 className="mb-3 text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                Status
            </h4>
            <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => {
                    const Icon = option.icon
                    const isActive = currentStatus === option.value
                    return (
                        <button
                            key={option.value}
                            onClick={() => onStatusChange(option.value)}
                            disabled={isUpdating}
                            className={cn(
                                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm',
                                'border transition-all',
                                'disabled:cursor-not-allowed disabled:opacity-50',
                                isActive
                                    ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
                                    : 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600'
                            )}
                        >
                            <Icon className="size-4" />
                            {option.label}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

/**
 * Individual detail row
 */
interface DetailRowProps {
    icon: typeof Flag
    label: string
    value: React.ReactNode
    valueClassName?: string
}

const DetailRow = ({
    icon: Icon,
    label,
    value,
    valueClassName,
}: DetailRowProps) => {
    return (
        <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                <Icon className="size-4" />
                {label}
            </span>
            <span
                className={cn(
                    'text-sm text-neutral-900 dark:text-white',
                    valueClassName
                )}
            >
                {value}
            </span>
        </div>
    )
}
