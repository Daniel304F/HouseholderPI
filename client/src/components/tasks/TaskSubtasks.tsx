import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ListTree, Plus, CheckCircle2, Circle } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Button, Input } from '../common'
import { tasksApi } from '../../api/tasks'
import { formatDate } from '../../utils/date.utils'

interface Subtask {
    id: string
    title: string
    status: 'pending' | 'in-progress' | 'completed'
    dueDate: string
}

interface TaskSubtasksProps {
    groupId: string
    taskId: string
    subtasks: Subtask[] | undefined
    readOnly?: boolean
}

/**
 * Subtasks section for TaskDetailView
 * Displays existing subtasks and allows creating new ones
 */
export const TaskSubtasks = ({
    groupId,
    taskId,
    subtasks = [],
    readOnly = false,
}: TaskSubtasksProps) => {
    const queryClient = useQueryClient()
    const [showForm, setShowForm] = useState(false)
    const [title, setTitle] = useState('')
    const [dueDate, setDueDate] = useState('')

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
            resetForm()
        },
    })

    const resetForm = () => {
        setShowForm(false)
        setTitle('')
        setDueDate('')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim() || !dueDate) return
        await createSubtaskMutation.mutateAsync({
            title: title.trim(),
            dueDate: new Date(dueDate).toISOString(),
        })
    }

    return (
        <div>
            <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    <ListTree className="size-4" />
                    Unteraufgaben ({subtasks.length})
                </h3>
                {!readOnly && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowForm(!showForm)}
                    >
                        <Plus className="mr-1 size-4" />
                        Hinzufügen
                    </Button>
                )}
            </div>

            {/* Create Form */}
            {showForm && (
                <form
                    onSubmit={handleSubmit}
                    className="mb-4 rounded-lg border border-neutral-200 p-4 dark:border-neutral-700"
                >
                    <div className="space-y-3">
                        <Input
                            label="Titel"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Titel der Unteraufgabe"
                            required
                        />
                        <Input
                            type="date"
                            label="Fälligkeitsdatum"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            required
                        />
                        <div className="flex gap-2">
                            <Button
                                type="submit"
                                size="sm"
                                isLoading={createSubtaskMutation.isPending}
                            >
                                Erstellen
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

            {/* Subtasks List */}
            <div className="space-y-2">
                {subtasks.map((subtask) => (
                    <SubtaskItem key={subtask.id} subtask={subtask} />
                ))}
                {subtasks.length === 0 && !showForm && (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Keine Unteraufgaben vorhanden.
                    </p>
                )}
            </div>
        </div>
    )
}

/**
 * Individual subtask item display
 */
const SubtaskItem = ({ subtask }: { subtask: Subtask }) => {
    const isCompleted = subtask.status === 'completed'

    return (
        <div
            className={cn(
                'flex items-center gap-3 rounded-lg border p-3',
                'border-neutral-200 dark:border-neutral-700',
                'bg-neutral-50 dark:bg-neutral-800/50',
                isCompleted && 'opacity-60'
            )}
        >
            <div
                className={cn(
                    isCompleted ? 'text-success-500' : 'text-neutral-400'
                )}
            >
                {isCompleted ? (
                    <CheckCircle2 className="size-5" />
                ) : (
                    <Circle className="size-5" />
                )}
            </div>
            <div className="flex-1">
                <span
                    className={cn(
                        'text-sm text-neutral-700 dark:text-neutral-300',
                        isCompleted && 'line-through'
                    )}
                >
                    {subtask.title}
                </span>
            </div>
            <span className="text-xs text-neutral-500">
                {formatDate(subtask.dueDate)}
            </span>
        </div>
    )
}
