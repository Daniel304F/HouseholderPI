import { useState, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '../Button'
import { BaseModal } from '../modal'
import { TaskForm, type TaskFormData, type TaskFormErrors } from './TaskForm'
import { toDateInputValue } from '../../utils/date.utils'
import type { TaskStatus, TaskPriority } from '../../constants/task.constants'
import type { Task } from './TaskCard'
import type { GroupMember } from '../../api/groups'

interface EditTaskModalProps {
    task: Task | null
    onClose: () => void
    onSubmit: (taskId: string, data: EditTaskData) => Promise<void>
    onDelete: (taskId: string) => Promise<void>
    members: GroupMember[]
}

export interface EditTaskData {
    title?: string
    description?: string
    status?: TaskStatus
    priority?: TaskPriority
    assignedTo?: string | null
    dueDate?: string
    image?: string | null
}

const createFormDataFromTask = (task: Task): TaskFormData => ({
    title: task.title,
    description: task.description || '',
    status: task.status,
    priority: task.priority,
    assignedTo: task.assignedTo,
    dueDate: toDateInputValue(task.dueDate),
    image: (task as Task & { image?: string }).image || null,
})

export const EditTaskModal = ({
    task,
    onClose,
    onSubmit,
    onDelete,
    members,
}: EditTaskModalProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [formData, setFormData] = useState<TaskFormData>({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        assignedTo: null,
        dueDate: '',
        image: null,
    })
    const [errors, setErrors] = useState<TaskFormErrors>({})

    useEffect(() => {
        if (task) {
            setFormData(createFormDataFromTask(task))
            setErrors({})
            setShowDeleteConfirm(false)
        }
    }, [task])

    const handleClose = () => {
        setShowDeleteConfirm(false)
        onClose()
    }

    const handleChange = <K extends keyof TaskFormData>(
        field: K,
        value: TaskFormData[K]
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const validate = (): boolean => {
        const newErrors: TaskFormErrors = {}

        if (!formData.title.trim()) {
            newErrors.title = 'Titel ist erforderlich'
        } else if (formData.title.length > 100) {
            newErrors.title = 'Titel darf maximal 100 Zeichen lang sein'
        }

        if (!formData.dueDate) {
            newErrors.dueDate = 'Fälligkeitsdatum ist erforderlich'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!task || !validate()) return

        setIsSubmitting(true)
        try {
            await onSubmit(task.id, {
                title: formData.title.trim(),
                description: formData.description.trim() || undefined,
                status: formData.status,
                priority: formData.priority,
                assignedTo: formData.assignedTo,
                dueDate: new Date(formData.dueDate).toISOString(),
                image: formData.image,
            })
            handleClose()
        } catch {
            // Error handling wird vom Parent übernommen
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!task) return

        setIsDeleting(true)
        try {
            await onDelete(task.id)
            handleClose()
        } catch {
            // Error handling wird vom Parent übernommen
        } finally {
            setIsDeleting(false)
        }
    }

    if (!task) return null

    const footer = (
        <div className="flex items-center justify-between">
            {/* Delete Button */}
            <Button
                type="button"
                variant="ghost"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isSubmitting || showDeleteConfirm}
                icon={<Trash2 className="size-4" />}
                className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
            >
                Löschen
            </Button>

            {/* Save/Cancel */}
            <div className="flex gap-3">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={handleClose}
                    disabled={isSubmitting}
                >
                    Abbrechen
                </Button>
                <Button
                    type="submit"
                    form="edit-task-form"
                    isLoading={isSubmitting}
                    disabled={showDeleteConfirm}
                >
                    Speichern
                </Button>
            </div>
        </div>
    )

    return (
        <BaseModal
            isOpen={!!task}
            onClose={handleClose}
            title="Aufgabe bearbeiten"
            footer={footer}
        >
            <TaskForm
                formId="edit-task-form"
                data={formData}
                errors={errors}
                members={members}
                onSubmit={handleSubmit}
                onChange={handleChange}
            >
                {/* Delete Confirmation */}
                {showDeleteConfirm && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
                        <p className="mb-3 text-sm text-red-700 dark:text-red-400">
                            Möchtest du diese Aufgabe wirklich löschen? Diese
                            Aktion kann nicht rückgängig gemacht werden.
                        </p>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                Abbrechen
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleDelete}
                                isLoading={isDeleting}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Endgültig löschen
                            </Button>
                        </div>
                    </div>
                )}
            </TaskForm>
        </BaseModal>
    )
}
