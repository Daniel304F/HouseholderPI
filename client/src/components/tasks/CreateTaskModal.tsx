import { useState } from 'react'
import { X, Calendar, Flag, User } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Button } from '../Button'
import { Input } from '../Input'
import type { Task } from './TaskCard'
import type { GroupMember } from '../../api/groups'

type TaskStatus = Task['status']
type TaskPriority = Task['priority']

interface CreateTaskModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (task: CreateTaskData) => Promise<void>
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

export const CreateTaskModal = ({
    isOpen,
    onClose,
    onSubmit,
    initialStatus = 'pending',
    members,
}: CreateTaskModalProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [status, setStatus] = useState<TaskStatus>(initialStatus)
    const [priority, setPriority] = useState<TaskPriority>('medium')
    const [assignedTo, setAssignedTo] = useState<string | null>(null)
    const [dueDate, setDueDate] = useState(
        new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    )
    const [errors, setErrors] = useState<{ title?: string; dueDate?: string }>(
        {}
    )

    const resetForm = () => {
        setTitle('')
        setDescription('')
        setStatus(initialStatus)
        setPriority('medium')
        setAssignedTo(null)
        setDueDate(
            new Date(Date.now() + 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0]
        )
        setErrors({})
    }

    const handleClose = () => {
        resetForm()
        onClose()
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

        if (!validate()) return

        setIsSubmitting(true)
        try {
            await onSubmit({
                title: title.trim(),
                description: description.trim() || undefined,
                status,
                priority,
                assignedTo,
                dueDate: new Date(dueDate).toISOString(),
            })
            handleClose()
        } catch {
            // Error handling wird vom Parent übernommen
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-20">
            <div
                className={cn(
                    'w-full max-w-lg rounded-2xl',
                    'bg-white dark:bg-neutral-800',
                    'animate-in slide-in-from-top-4 fade-in duration-300'
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-700">
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                        Neue Aufgabe
                    </h2>
                    <button
                        onClick={handleClose}
                        className={cn(
                            'rounded-lg p-2 transition-colors',
                            'hover:bg-neutral-100 dark:hover:bg-neutral-700'
                        )}
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
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
                                        {member.userId}
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
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Abbrechen
                        </Button>
                        <Button type="submit" isLoading={isSubmitting}>
                            Aufgabe erstellen
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
