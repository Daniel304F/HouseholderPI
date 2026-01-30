import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link2, Plus, X, ExternalLink } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Button } from '../common'
import { tasksApi, type Task, type TaskLinkType } from '../../api/tasks'

interface TaskLink {
    taskId: string
    linkType: TaskLinkType
}

interface TaskLinksProps {
    groupId: string
    taskId: string
    linkedTasks: TaskLink[] | undefined
    allTasks: Task[]
}

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

/**
 * Task links section for TaskDetailView
 * Displays linked tasks and allows creating/removing links
 */
export const TaskLinks = ({
    groupId,
    taskId,
    linkedTasks = [],
    allTasks,
}: TaskLinksProps) => {
    const queryClient = useQueryClient()
    const [showForm, setShowForm] = useState(false)
    const [targetId, setTargetId] = useState('')
    const [linkType, setLinkType] = useState<TaskLinkType>('relates-to')

    // Filter out already linked tasks and self
    const availableTasks = allTasks.filter(
        (t) =>
            t.id !== taskId &&
            !linkedTasks.some((link) => link.taskId === t.id)
    )

    const linkTaskMutation = useMutation({
        mutationFn: (data: { targetTaskId: string; linkType: TaskLinkType }) =>
            tasksApi.linkTasks(groupId, taskId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['taskDetails', groupId, taskId],
            })
            resetForm()
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

    const resetForm = () => {
        setShowForm(false)
        setTargetId('')
        setLinkType('relates-to')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!targetId) return
        await linkTaskMutation.mutateAsync({
            targetTaskId: targetId,
            linkType,
        })
    }

    return (
        <div>
            <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    <Link2 className="size-4" />
                    Verknüpfte Aufgaben ({linkedTasks.length})
                </h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowForm(!showForm)}
                    disabled={availableTasks.length === 0}
                >
                    <Plus className="mr-1 size-4" />
                    Verknüpfen
                </Button>
            </div>

            {/* Link Form */}
            {showForm && (
                <form
                    onSubmit={handleSubmit}
                    className="mb-4 rounded-lg border border-neutral-200 p-4 dark:border-neutral-700"
                >
                    <div className="space-y-3">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Aufgabe
                            </label>
                            <select
                                value={targetId}
                                onChange={(e) => setTargetId(e.target.value)}
                                className={cn(
                                    'w-full rounded-lg border px-3 py-2',
                                    'border-neutral-300 dark:border-neutral-600',
                                    'bg-white dark:bg-neutral-800',
                                    'text-neutral-900 dark:text-white',
                                    'focus:border-brand-500 focus:ring-brand-500/20 focus:ring-2'
                                )}
                                required
                            >
                                <option value="">Aufgabe auswählen...</option>
                                {availableTasks.map((task) => (
                                    <option key={task.id} value={task.id}>
                                        {task.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Verknüpfungsart
                            </label>
                            <select
                                value={linkType}
                                onChange={(e) =>
                                    setLinkType(e.target.value as TaskLinkType)
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
                                isLoading={linkTaskMutation.isPending}
                            >
                                Verknüpfen
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={resetForm}
                            >
                                Abbrechen
                            </Button>
                        </div>
                    </div>
                </form>
            )}

            {/* Linked Tasks List */}
            <div className="space-y-2">
                {linkedTasks.map((link) => {
                    const linkedTask = allTasks.find(
                        (t) => t.id === link.taskId
                    )
                    return (
                        <LinkedTaskItem
                            key={link.taskId}
                            title={linkedTask?.title || 'Unbekannte Aufgabe'}
                            linkType={link.linkType}
                            onRemove={() =>
                                unlinkTaskMutation.mutate(link.taskId)
                            }
                            isRemoving={unlinkTaskMutation.isPending}
                        />
                    )
                })}
                {linkedTasks.length === 0 && !showForm && (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Keine verknüpften Aufgaben.
                    </p>
                )}
            </div>
        </div>
    )
}

/**
 * Individual linked task item display
 */
interface LinkedTaskItemProps {
    title: string
    linkType: TaskLinkType
    onRemove: () => void
    isRemoving: boolean
}

const LinkedTaskItem = ({
    title,
    linkType,
    onRemove,
    isRemoving,
}: LinkedTaskItemProps) => {
    return (
        <div
            className={cn(
                'flex items-center gap-3 rounded-lg border p-3',
                'border-neutral-200 dark:border-neutral-700',
                'bg-neutral-50 dark:bg-neutral-800/50'
            )}
        >
            <ExternalLink className="text-brand-500 size-4" />
            <div className="flex-1">
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                    {title}
                </span>
                <span className="ml-2 text-xs text-neutral-500">
                    ({getLinkTypeLabel(linkType)})
                </span>
            </div>
            <button
                onClick={onRemove}
                disabled={isRemoving}
                className="hover:bg-error-100 hover:text-error-600 dark:hover:bg-error-900/30 rounded p-1 text-neutral-400 disabled:opacity-50"
                title="Verknüpfung entfernen"
            >
                <X className="size-4" />
            </button>
        </div>
    )
}
