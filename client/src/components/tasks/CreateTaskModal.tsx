import { useState } from 'react'
import { Button } from '../common'
import { BaseModal } from '../modal'
import {
    TaskForm,
    type TaskFormData,
    type TaskFormErrors,
    type RecurrenceType,
} from './TaskForm'
import { getTomorrowDateValue } from '../../utils/date.utils'
import type { TaskStatus, TaskPriority } from '../../constants/task.constants'
import type { GroupMember } from '../../api/groups'

interface CreateTaskModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (task: CreateTaskData) => Promise<void>
    onCreateRecurring?: (template: CreateRecurringData) => Promise<void>
    initialStatus?: TaskStatus
    members: GroupMember[]
}

export interface CreateTaskData {
    title: string
    description?: string
    status: TaskStatus
    priority: TaskPriority
    assignedTo: string | null
    dueDate: string
    image?: string
}

export interface CreateRecurringData {
    title: string
    description?: string
    priority: TaskPriority
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
    assignmentStrategy: 'fixed' | 'rotation'
    fixedAssignee?: string
    dueDay: number
}

const createInitialData = (initialStatus: TaskStatus): TaskFormData => ({
    title: '',
    description: '',
    status: initialStatus,
    priority: 'medium',
    assignedTo: null,
    dueDate: getTomorrowDateValue(),
    image: null,
    recurrence: 'none' as RecurrenceType,
})

export const CreateTaskModal = ({
    isOpen,
    onClose,
    onSubmit,
    onCreateRecurring,
    initialStatus = 'pending',
    members,
}: CreateTaskModalProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState<TaskFormData>(
        createInitialData(initialStatus)
    )
    const [errors, setErrors] = useState<TaskFormErrors>({})

    const resetForm = () => {
        setFormData(createInitialData(initialStatus))
        setErrors({})
    }

    const handleClose = () => {
        resetForm()
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

    const getDueDayFromDate = (dateString: string): number => {
        const date = new Date(dateString)
        // For weekly/biweekly: return day of week (0-6)
        // For monthly: return day of month (1-31)
        if (formData.recurrence === 'monthly') {
            return date.getDate()
        }
        return date.getDay()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validate()) return

        setIsSubmitting(true)
        try {
            if (formData.recurrence !== 'none' && onCreateRecurring) {
                // Create recurring task template
                await onCreateRecurring({
                    title: formData.title.trim(),
                    description: formData.description.trim() || undefined,
                    priority: formData.priority,
                    frequency: formData.recurrence,
                    assignmentStrategy: formData.assignedTo
                        ? 'fixed'
                        : 'rotation',
                    fixedAssignee: formData.assignedTo || undefined,
                    dueDay: getDueDayFromDate(formData.dueDate),
                })
            } else {
                // Create regular task
                await onSubmit({
                    title: formData.title.trim(),
                    description: formData.description.trim() || undefined,
                    status: formData.status,
                    priority: formData.priority,
                    assignedTo: formData.assignedTo,
                    dueDate: new Date(formData.dueDate).toISOString(),
                    image: formData.image || undefined,
                })
            }
            handleClose()
        } catch {
            // Error handling wird vom Parent übernommen
        } finally {
            setIsSubmitting(false)
        }
    }

    const isRecurring = formData.recurrence !== 'none'

    const footer = (
        <div className="flex justify-end gap-3">
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
                form="create-task-form"
                isLoading={isSubmitting}
            >
                {isRecurring ? 'Vorlage erstellen' : 'Aufgabe erstellen'}
            </Button>
        </div>
    )

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={handleClose}
            title={isRecurring ? 'Neue wiederkehrende Aufgabe' : 'Neue Aufgabe'}
            footer={footer}
        >
            <TaskForm
                formId="create-task-form"
                data={formData}
                errors={errors}
                members={members}
                onSubmit={handleSubmit}
                onChange={handleChange}
            />
        </BaseModal>
    )
}
