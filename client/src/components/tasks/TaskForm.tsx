import { Calendar, Flag, User } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Input } from '../Input'
import { ImageUpload } from '../ui/ImageUpload'
import {
    STATUS_OPTIONS,
    PRIORITY_OPTIONS,
    type TaskStatus,
    type TaskPriority,
} from '../../constants/task.constants'
import type { GroupMember } from '../../api/groups'

export interface TaskFormData {
    title: string
    description: string
    status: TaskStatus
    priority: TaskPriority
    assignedTo: string | null
    dueDate: string
    image: string | null
}

export interface TaskFormErrors {
    title?: string
    dueDate?: string
}

interface TaskFormProps {
    formId: string
    data: TaskFormData
    errors: TaskFormErrors
    members: GroupMember[]
    onSubmit: (e: React.FormEvent) => void
    onChange: <K extends keyof TaskFormData>(
        field: K,
        value: TaskFormData[K]
    ) => void
    children?: React.ReactNode
}

const getMemberDisplayName = (member: GroupMember): string => {
    if (member.userName) return member.userName
    return member.userId.substring(0, 8) + '...'
}

const inputStyles = cn(
    'w-full rounded-xl border px-4 py-2.5 text-sm',
    'bg-white dark:bg-neutral-800',
    'text-neutral-900 dark:text-neutral-100',
    'outline-none transition-all duration-200'
)

const normalBorderStyles =
    'focus:border-brand-500 focus:ring-brand-500/20 border-neutral-300 focus:ring-2 dark:border-neutral-700'
const errorBorderStyles =
    'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'

export const TaskForm = ({
    formId,
    data,
    errors,
    members,
    onSubmit,
    onChange,
    children,
}: TaskFormProps) => {
    return (
        <form id={formId} onSubmit={onSubmit}>
            <div className="space-y-4">
                {/* Title */}
                <Input
                    label="Titel"
                    value={data.title}
                    onChange={(e) => onChange('title', e.target.value)}
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
                        value={data.description}
                        onChange={(e) => onChange('description', e.target.value)}
                        placeholder="Details zur Aufgabe..."
                        rows={3}
                        className={cn(
                            inputStyles,
                            normalBorderStyles,
                            'placeholder:text-neutral-400 resize-none'
                        )}
                    />
                </div>

                {/* Image Upload */}
                <ImageUpload
                    image={data.image}
                    onImageChange={(img) => onChange('image', img)}
                />

                {/* Status & Priority Row */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Status */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            Status
                        </label>
                        <select
                            value={data.status}
                            onChange={(e) =>
                                onChange('status', e.target.value as TaskStatus)
                            }
                            className={cn(inputStyles, normalBorderStyles)}
                        >
                            {STATUS_OPTIONS.map((opt) => (
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
                            {PRIORITY_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() =>
                                        onChange('priority', opt.value)
                                    }
                                    className={cn(
                                        'flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all',
                                        data.priority === opt.value
                                            ? opt.color
                                            : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400',
                                        data.priority === opt.value &&
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
                        value={data.assignedTo || ''}
                        onChange={(e) =>
                            onChange('assignedTo', e.target.value || null)
                        }
                        className={cn(inputStyles, normalBorderStyles)}
                    >
                        <option value="">Nicht zugewiesen</option>
                        {members.map((member) => (
                            <option key={member.userId} value={member.userId}>
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
                        value={data.dueDate}
                        onChange={(e) => onChange('dueDate', e.target.value)}
                        className={cn(
                            inputStyles,
                            errors.dueDate ? errorBorderStyles : normalBorderStyles
                        )}
                    />
                    {errors.dueDate && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.dueDate}
                        </p>
                    )}
                </div>

                {/* Additional content (e.g., delete confirmation) */}
                {children}
            </div>
        </form>
    )
}
