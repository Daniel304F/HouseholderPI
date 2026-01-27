import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    X,
    Clock,
    User,
    Calendar,
    Flag,
    Users,
    Link2,
    Plus,
    CheckCircle2,
    Circle,
    ArrowLeft,
    ListTree,
    AlertCircle,
    ExternalLink,
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { Button } from '../Button'
import { Input } from '../Input'
import { BaseModal } from '../modal'
import { ModalWidth, ModalHeight } from '../modal/types'
import { tasksApi, type Task, type TaskLinkType } from '../../api/tasks'

interface TaskDetailViewProps {
    groupId: string
    taskId: string
    onClose: () => void
    onEditClick: () => void
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

const linkTypeOptions: { value: TaskLinkType; label: string }[] = [
    { value: 'blocks', label: 'Blockiert' },
    { value: 'blocked-by', label: 'Wird blockiert von' },
    { value: 'relates-to', label: 'Verwandt mit' },
    { value: 'duplicates', label: 'Dupliziert' },
    { value: 'duplicated-by', label: 'Dupliziert von' },
]

const getLinkTypeLabel = (linkType: TaskLinkType): string => {
    const option = linkTypeOptions.find((o) => o.value === linkType)
    return option?.label || linkType
}

export const TaskDetailView = ({
    groupId,
    taskId,
    onClose,
    onEditClick,
}: TaskDetailViewProps) => {
    const queryClient = useQueryClient()
    const [showSubtaskForm, setShowSubtaskForm] = useState(false)
    const [showLinkForm, setShowLinkForm] = useState(false)
    const [subtaskTitle, setSubtaskTitle] = useState('')
    const [subtaskDueDate, setSubtaskDueDate] = useState('')
    const [linkTargetId, setLinkTargetId] = useState('')
    const [linkType, setLinkType] = useState<TaskLinkType>('relates-to')

    const { data: taskDetails, isLoading } = useQuery({
        queryKey: ['taskDetails', groupId, taskId],
        queryFn: () => tasksApi.getTaskWithDetails(groupId, taskId),
        enabled: !!groupId && !!taskId,
    })

    const { data: allTasks = [] } = useQuery({
        queryKey: ['tasks', groupId],
        queryFn: () => tasksApi.getGroupTasks(groupId),
        enabled: !!groupId,
    })

    const updateStatusMutation = useMutation({
        mutationFn: (status: Task['status']) =>
            tasksApi.updateTask(groupId, taskId, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['taskDetails', groupId, taskId],
            })
            queryClient.invalidateQueries({ queryKey: ['tasks', groupId] })
        },
    })

    const createSubtaskMutation = useMutation({
        mutationFn: (data: { title: string; dueDate: string }) =>
            tasksApi.createSubtask(groupId, taskId, {
                title: data.title,
                dueDate: data.dueDate,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['taskDetails', groupId, taskId],
            })
            queryClient.invalidateQueries({ queryKey: ['tasks', groupId] })
            setShowSubtaskForm(false)
            setSubtaskTitle('')
            setSubtaskDueDate('')
        },
    })

    const linkTaskMutation = useMutation({
        mutationFn: (data: { targetTaskId: string; linkType: TaskLinkType }) =>
            tasksApi.linkTasks(groupId, taskId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['taskDetails', groupId, taskId],
            })
            setShowLinkForm(false)
            setLinkTargetId('')
            setLinkType('relates-to')
        },
    })

    const unlinkTaskMutation = useMutation({
        mutationFn: (linkedTaskId: string) =>
            tasksApi.unlinkTasks(groupId, taskId, linkedTaskId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['taskDetails', groupId, taskId],
            })
        },
    })

    const handleCreateSubtask = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!subtaskTitle.trim() || !subtaskDueDate) return
        await createSubtaskMutation.mutateAsync({
            title: subtaskTitle.trim(),
            dueDate: new Date(subtaskDueDate).toISOString(),
        })
    }

    const handleLinkTask = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!linkTargetId) return
        await linkTaskMutation.mutateAsync({
            targetTaskId: linkTargetId,
            linkType,
        })
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
    }

    const isOverdue =
        taskDetails &&
        taskDetails.status !== 'completed' &&
        new Date(taskDetails.dueDate) < new Date()

    // Filter out already linked tasks and self
    const availableTasksForLinking = allTasks.filter(
        (t) =>
            t.id !== taskId &&
            !taskDetails?.linkedTasks?.some((link) => link.taskId === t.id)
    )

    if (isLoading) {
        return (
            <BaseModal
                isOpen={true}
                onClose={onClose}
                title="Aufgabe lädt..."
                width={ModalWidth.XLarge}
                height={ModalHeight.Large}
            >
                <div className="flex items-center justify-center py-12">
                    <div className="border-brand-500 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
                </div>
            </BaseModal>
        )
    }

    if (!taskDetails) {
        return (
            <BaseModal
                isOpen={true}
                onClose={onClose}
                title="Fehler"
                width={ModalWidth.Medium}
            >
                <div className="flex flex-col items-center gap-4 py-8">
                    <AlertCircle className="text-error-500 size-12" />
                    <p className="text-neutral-500 dark:text-neutral-400">
                        Aufgabe konnte nicht geladen werden.
                    </p>
                    <Button onClick={onClose}>Schließen</Button>
                </div>
            </BaseModal>
        )
    }

    const currentPriority = priorityOptions.find(
        (p) => p.value === taskDetails.priority
    )

    return (
        <BaseModal
            isOpen={true}
            onClose={onClose}
            title={taskDetails.title}
            width={ModalWidth.XLarge}
            height={ModalHeight.Large}
            footer={
                <div className="flex justify-between">
                    <Button variant="secondary" onClick={onClose}>
                        <ArrowLeft className="mr-2 size-4" />
                        Zurück
                    </Button>
                    <Button onClick={onEditClick}>Bearbeiten</Button>
                </div>
            }
        >
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Main Content - Left 2 Columns */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Description */}
                    <div>
                        <h3 className="mb-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                            Beschreibung
                        </h3>
                        <p className="text-neutral-600 dark:text-neutral-400">
                            {taskDetails.description ||
                                'Keine Beschreibung vorhanden.'}
                        </p>
                    </div>

                    {/* Subtasks Section */}
                    <div>
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                <ListTree className="size-4" />
                                Unteraufgaben (
                                {taskDetails.subtasks?.length || 0})
                            </h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                    setShowSubtaskForm(!showSubtaskForm)
                                }
                            >
                                <Plus className="mr-1 size-4" />
                                Hinzufügen
                            </Button>
                        </div>

                        {/* Subtask Form */}
                        {showSubtaskForm && (
                            <form
                                onSubmit={handleCreateSubtask}
                                className="mb-4 rounded-lg border border-neutral-200 p-4 dark:border-neutral-700"
                            >
                                <div className="space-y-3">
                                    <Input
                                        label="Titel"
                                        value={subtaskTitle}
                                        onChange={(e) =>
                                            setSubtaskTitle(e.target.value)
                                        }
                                        placeholder="Titel der Unteraufgabe"
                                        required
                                    />
                                    <Input
                                        type="date"
                                        label="Fälligkeitsdatum"
                                        value={subtaskDueDate}
                                        onChange={(e) =>
                                            setSubtaskDueDate(e.target.value)
                                        }
                                        required
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            type="submit"
                                            size="sm"
                                            isLoading={
                                                createSubtaskMutation.isPending
                                            }
                                        >
                                            Erstellen
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                setShowSubtaskForm(false)
                                            }
                                        >
                                            Abbrechen
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        )}

                        {/* Subtasks List */}
                        <div className="space-y-2">
                            {taskDetails.subtasks?.map((subtask) => (
                                <div
                                    key={subtask.id}
                                    className={cn(
                                        'flex items-center gap-3 rounded-lg border p-3',
                                        'border-neutral-200 dark:border-neutral-700',
                                        'bg-neutral-50 dark:bg-neutral-800/50',
                                        subtask.status === 'completed' &&
                                            'opacity-60'
                                    )}
                                >
                                    <div
                                        className={cn(
                                            subtask.status === 'completed'
                                                ? 'text-success-500'
                                                : 'text-neutral-400'
                                        )}
                                    >
                                        {subtask.status === 'completed' ? (
                                            <CheckCircle2 className="size-5" />
                                        ) : (
                                            <Circle className="size-5" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <span
                                            className={cn(
                                                'text-sm text-neutral-700 dark:text-neutral-300',
                                                subtask.status ===
                                                    'completed' &&
                                                    'line-through'
                                            )}
                                        >
                                            {subtask.title}
                                        </span>
                                    </div>
                                    <span className="text-xs text-neutral-500">
                                        {formatDate(subtask.dueDate)}
                                    </span>
                                </div>
                            ))}
                            {(!taskDetails.subtasks ||
                                taskDetails.subtasks.length === 0) &&
                                !showSubtaskForm && (
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                        Keine Unteraufgaben vorhanden.
                                    </p>
                                )}
                        </div>
                    </div>

                    {/* Linked Tasks Section */}
                    <div>
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                <Link2 className="size-4" />
                                Verknüpfte Aufgaben (
                                {taskDetails.linkedTasks?.length || 0})
                            </h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowLinkForm(!showLinkForm)}
                                disabled={availableTasksForLinking.length === 0}
                            >
                                <Plus className="mr-1 size-4" />
                                Verknüpfen
                            </Button>
                        </div>

                        {/* Link Form */}
                        {showLinkForm && (
                            <form
                                onSubmit={handleLinkTask}
                                className="mb-4 rounded-lg border border-neutral-200 p-4 dark:border-neutral-700"
                            >
                                <div className="space-y-3">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                            Aufgabe
                                        </label>
                                        <select
                                            value={linkTargetId}
                                            onChange={(e) =>
                                                setLinkTargetId(e.target.value)
                                            }
                                            className={cn(
                                                'w-full rounded-lg border px-3 py-2',
                                                'border-neutral-300 dark:border-neutral-600',
                                                'bg-white dark:bg-neutral-800',
                                                'text-neutral-900 dark:text-white',
                                                'focus:border-brand-500 focus:ring-brand-500/20 focus:ring-2'
                                            )}
                                            required
                                        >
                                            <option value="">
                                                Aufgabe auswählen...
                                            </option>
                                            {availableTasksForLinking.map(
                                                (task) => (
                                                    <option
                                                        key={task.id}
                                                        value={task.id}
                                                    >
                                                        {task.title}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                            Verknüpfungsart
                                        </label>
                                        <select
                                            value={linkType}
                                            onChange={(e) =>
                                                setLinkType(
                                                    e.target
                                                        .value as TaskLinkType
                                                )
                                            }
                                            className={cn(
                                                'w-full rounded-lg border px-3 py-2',
                                                'border-neutral-300 dark:border-neutral-600',
                                                'bg-white dark:bg-neutral-800',
                                                'text-neutral-900 dark:text-white',
                                                'focus:border-brand-500 focus:ring-brand-500/20 focus:ring-2'
                                            )}
                                        >
                                            {linkTypeOptions.map((option) => (
                                                <option
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            type="submit"
                                            size="sm"
                                            isLoading={
                                                linkTaskMutation.isPending
                                            }
                                        >
                                            Verknüpfen
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                setShowLinkForm(false)
                                            }
                                        >
                                            Abbrechen
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        )}

                        {/* Linked Tasks List */}
                        <div className="space-y-2">
                            {taskDetails.linkedTasks?.map((link) => {
                                const linkedTask = allTasks.find(
                                    (t) => t.id === link.taskId
                                )
                                return (
                                    <div
                                        key={link.taskId}
                                        className={cn(
                                            'flex items-center gap-3 rounded-lg border p-3',
                                            'border-neutral-200 dark:border-neutral-700',
                                            'bg-neutral-50 dark:bg-neutral-800/50'
                                        )}
                                    >
                                        <ExternalLink className="text-brand-500 size-4" />
                                        <div className="flex-1">
                                            <span className="text-sm text-neutral-700 dark:text-neutral-300">
                                                {linkedTask?.title ||
                                                    'Unbekannte Aufgabe'}
                                            </span>
                                            <span className="ml-2 text-xs text-neutral-500">
                                                (
                                                {getLinkTypeLabel(
                                                    link.linkType
                                                )}
                                                )
                                            </span>
                                        </div>
                                        <button
                                            onClick={() =>
                                                unlinkTaskMutation.mutate(
                                                    link.taskId
                                                )
                                            }
                                            className="hover:bg-error-100 hover:text-error-600 dark:hover:bg-error-900/30 rounded p-1 text-neutral-400"
                                            title="Verknüpfung entfernen"
                                        >
                                            <X className="size-4" />
                                        </button>
                                    </div>
                                )
                            })}
                            {(!taskDetails.linkedTasks ||
                                taskDetails.linkedTasks.length === 0) &&
                                !showLinkForm && (
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                        Keine verknüpften Aufgaben.
                                    </p>
                                )}
                        </div>
                    </div>
                </div>

                {/* Sidebar - Right Column */}
                <div className="space-y-4">
                    {/* Status */}
                    <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
                        <h4 className="mb-3 text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                            Status
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {statusOptions.map((option) => {
                                const Icon = option.icon
                                const isActive =
                                    taskDetails.status === option.value
                                return (
                                    <button
                                        key={option.value}
                                        onClick={() =>
                                            updateStatusMutation.mutate(
                                                option.value
                                            )
                                        }
                                        disabled={
                                            updateStatusMutation.isPending
                                        }
                                        className={cn(
                                            'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm',
                                            'border transition-all',
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

                    {/* Details */}
                    <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
                        <h4 className="mb-3 text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                            Details
                        </h4>
                        <div className="space-y-3">
                            {/* Priority */}
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                                    <Flag className="size-4" />
                                    Priorität
                                </span>
                                <span
                                    className={cn(
                                        'rounded-full px-2 py-0.5 text-xs font-medium',
                                        currentPriority?.color
                                    )}
                                >
                                    {currentPriority?.label}
                                </span>
                            </div>

                            {/* Assigned To */}
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                                    <User className="size-4" />
                                    Zugewiesen an
                                </span>
                                <span className="text-sm text-neutral-900 dark:text-white">
                                    {taskDetails.assignedToName ||
                                        taskDetails.assignedTo ||
                                        'Niemand'}
                                </span>
                            </div>

                            {/* Due Date */}
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                                    <Calendar className="size-4" />
                                    Fällig am
                                </span>
                                <span
                                    className={cn(
                                        'text-sm',
                                        isOverdue
                                            ? 'text-error-600 dark:text-error-400'
                                            : 'text-neutral-900 dark:text-white'
                                    )}
                                >
                                    {formatDate(taskDetails.dueDate)}
                                </span>
                            </div>

                            {/* Group */}
                            {taskDetails.groupName && (
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                                        <Users className="size-4" />
                                        Gruppe
                                    </span>
                                    <span className="text-sm text-neutral-900 dark:text-white">
                                        {taskDetails.groupName}
                                    </span>
                                </div>
                            )}

                            {/* Created By */}
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                                    <User className="size-4" />
                                    Erstellt von
                                </span>
                                <span className="text-sm text-neutral-900 dark:text-white">
                                    {taskDetails.createdByName ||
                                        taskDetails.createdBy}
                                </span>
                            </div>

                            {/* Created At */}
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                                    <Clock className="size-4" />
                                    Erstellt am
                                </span>
                                <span className="text-sm text-neutral-900 dark:text-white">
                                    {formatDate(taskDetails.createdAt)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </BaseModal>
    )
}
