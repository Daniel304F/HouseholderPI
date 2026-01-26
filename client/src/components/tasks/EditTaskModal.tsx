import { useState, useEffect } from 'react'
import { Calendar, Flag, User, Trash2, ImagePlus, X } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Button } from '../Button'
import { Input } from '../Input'
import { BaseModal } from '../modal'
import type { Task } from './TaskCard'
import type { GroupMember } from '../../api/groups'

type TaskStatus = Task['status']
type TaskPriority = Task['priority']

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

const statusOptions: { value: TaskStatus; label: string }[] = [
    { value: 'pending', label: 'Offen' },
    { value: 'in-progress', label: 'In Bearbeitung' },
    { value: 'completed', label: 'Erledigt' },
]

const priorityOptions: { value: TaskPriority; label: string; color: string }[] =
    [
        {
            value: 'low',
            label: 'Niedrig',
            color: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400',
        },
        {
            value: 'medium',
            label: 'Mittel',
            color: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400',
        },
        {
            value: 'high',
            label: 'Hoch',
            color: 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400',
        },
    ]

// Helper: Get display name for member
const getMemberDisplayName = (member: GroupMember): string => {
    if (member.userName) return member.userName
    // Fallback: First 8 characters of userId
    return member.userId.substring(0, 8) + '...'
}

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
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [status, setStatus] = useState<TaskStatus>('pending')
    const [priority, setPriority] = useState<TaskPriority>('medium')
    const [assignedTo, setAssignedTo] = useState<string | null>(null)
    const [dueDate, setDueDate] = useState('')
    const [image, setImage] = useState<string | null>(null)
    const [errors, setErrors] = useState<{ title?: string; dueDate?: string }>(
        {}
    )

    // Populate form when task changes
    useEffect(() => {
        if (task) {
            setTitle(task.title)
            setDescription(task.description || '')
            setStatus(task.status)
            setPriority(task.priority)
            setAssignedTo(task.assignedTo)
            setDueDate(new Date(task.dueDate).toISOString().split('T')[0])
            setImage((task as Task & { image?: string }).image || null)
            setErrors({})
            setShowDeleteConfirm(false)
        }
    }, [task])

    const handleClose = () => {
        setShowDeleteConfirm(false)
        onClose()
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('Bild darf maximal 5MB groß sein')
                return
            }
            const reader = new FileReader()
            reader.onloadend = () => {
                setImage(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const removeImage = () => {
        setImage(null)
    }

    const validate = (): boolean => {
        const newErrors: { title?: string; dueDate?: string } = {}

        if (!title.trim()) {
            newErrors.title = 'Titel ist erforderlich'
        } else if (title.length > 100) {
            newErrors.title = 'Titel darf maximal 100 Zeichen lang sein'
        }

        if (!dueDate) {
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
                title: title.trim(),
                description: description.trim() || undefined,
                status,
                priority,
                assignedTo,
                dueDate: new Date(dueDate).toISOString(),
                image,
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
            <form id="edit-task-form" onSubmit={handleSubmit}>
                <div className="space-y-4">
                    {/* Title */}
                    <Input
                        label="Titel"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Was muss erledigt werden?"
                        error={errors.title}
                        autoFocus
                    />

                    {/* Description */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            Beschreibung (optional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Details zur Aufgabe..."
                            rows={3}
                            className={cn(
                                'w-full rounded-xl border px-4 py-2.5 text-sm',
                                'bg-white dark:bg-neutral-800',
                                'text-neutral-900 dark:text-neutral-100',
                                'placeholder:text-neutral-400',
                                'outline-none transition-all duration-200',
                                'focus:border-brand-500 focus:ring-brand-500/20 border-neutral-300 focus:ring-2 dark:border-neutral-700',
                                'resize-none'
                            )}
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            <ImagePlus className="size-4" />
                            Bild (optional)
                        </label>
                        {image ? (
                            <div className="relative inline-block">
                                <img
                                    src={image}
                                    alt="Vorschau"
                                    className="h-32 w-auto rounded-lg object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className={cn(
                                        'absolute -right-2 -top-2 rounded-full p-1',
                                        'bg-red-500 text-white',
                                        'hover:bg-red-600 transition-colors'
                                    )}
                                >
                                    <X className="size-4" />
                                </button>
                            </div>
                        ) : (
                            <label
                                className={cn(
                                    'flex cursor-pointer items-center justify-center gap-2',
                                    'h-24 rounded-xl border-2 border-dashed',
                                    'border-neutral-300 dark:border-neutral-600',
                                    'hover:border-brand-500 hover:bg-brand-50/50 dark:hover:bg-brand-900/10',
                                    'transition-colors'
                                )}
                            >
                                <ImagePlus className="size-6 text-neutral-400" />
                                <span className="text-sm text-neutral-500">
                                    Bild hochladen
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>

                    {/* Status & Priority Row */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Status */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) =>
                                    setStatus(e.target.value as TaskStatus)
                                }
                                className={cn(
                                    'w-full rounded-xl border px-4 py-2.5 text-sm',
                                    'bg-white dark:bg-neutral-800',
                                    'text-neutral-900 dark:text-neutral-100',
                                    'outline-none transition-all duration-200',
                                    'focus:border-brand-500 focus:ring-brand-500/20 border-neutral-300 focus:ring-2 dark:border-neutral-700'
                                )}
                            >
                                {statusOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Priority */}
                        <div>
                            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                <Flag className="size-4" />
                                Priorität
                            </label>
                            <div className="flex gap-2">
                                {priorityOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setPriority(opt.value)}
                                        className={cn(
                                            'flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all',
                                            priority === opt.value
                                                ? opt.color
                                                : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400',
                                            priority === opt.value &&
                                                'ring-2 ring-offset-2 ring-neutral-400 dark:ring-offset-neutral-800'
                                        )}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Assigned To */}
                    <div>
                        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            <User className="size-4" />
                            Zuweisen an
                        </label>
                        <select
                            value={assignedTo || ''}
                            onChange={(e) =>
                                setAssignedTo(e.target.value || null)
                            }
                            className={cn(
                                'w-full rounded-xl border px-4 py-2.5 text-sm',
                                'bg-white dark:bg-neutral-800',
                                'text-neutral-900 dark:text-neutral-100',
                                'outline-none transition-all duration-200',
                                'focus:border-brand-500 focus:ring-brand-500/20 border-neutral-300 focus:ring-2 dark:border-neutral-700'
                            )}
                        >
                            <option value="">Nicht zugewiesen</option>
                            {members.map((member) => (
                                <option
                                    key={member.userId}
                                    value={member.userId}
                                >
                                    {getMemberDisplayName(member)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Due Date */}
                    <div>
                        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            <Calendar className="size-4" />
                            Fällig am
                        </label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className={cn(
                                'w-full rounded-xl border px-4 py-2.5 text-sm',
                                'bg-white dark:bg-neutral-800',
                                'text-neutral-900 dark:text-neutral-100',
                                'outline-none transition-all duration-200',
                                errors.dueDate
                                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                    : 'focus:border-brand-500 focus:ring-brand-500/20 border-neutral-300 focus:ring-2 dark:border-neutral-700'
                            )}
                        />
                        {errors.dueDate && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.dueDate}
                            </p>
                        )}
                    </div>

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
                </div>
            </form>
        </BaseModal>
    )
}
