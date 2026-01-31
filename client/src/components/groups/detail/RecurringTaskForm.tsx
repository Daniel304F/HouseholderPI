import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { cn } from '../../../utils/cn'
import { Button, Input } from '../../common'
import type {
    RecurringTaskTemplate,
    CreateRecurringTaskInput,
    RecurringFrequency,
    AssignmentStrategy,
    TaskPriority,
} from '../../../api/recurringTasks'
import type { GroupMember } from '../../../api/groups'

interface RecurringTaskFormProps {
    members: GroupMember[]
    template?: RecurringTaskTemplate
    onSubmit: (data: CreateRecurringTaskInput) => void | Promise<void>
    onCancel: () => void
    isSubmitting: boolean
}

const FREQUENCIES: { value: RecurringFrequency; label: string }[] = [
    { value: 'daily', label: 'Täglich' },
    { value: 'weekly', label: 'Wöchentlich' },
    { value: 'biweekly', label: 'Alle 2 Wochen' },
    { value: 'monthly', label: 'Monatlich' },
]

const PRIORITIES: { value: TaskPriority; label: string }[] = [
    { value: 'low', label: 'Niedrig' },
    { value: 'medium', label: 'Mittel' },
    { value: 'high', label: 'Hoch' },
]

const WEEKDAYS = [
    { value: 0, label: 'Sonntag' },
    { value: 1, label: 'Montag' },
    { value: 2, label: 'Dienstag' },
    { value: 3, label: 'Mittwoch' },
    { value: 4, label: 'Donnerstag' },
    { value: 5, label: 'Freitag' },
    { value: 6, label: 'Samstag' },
]

export const RecurringTaskForm = ({
    members,
    template,
    onSubmit,
    onCancel,
    isSubmitting,
}: RecurringTaskFormProps) => {
    const [title, setTitle] = useState(template?.title || '')
    const [description, setDescription] = useState(template?.description || '')
    const [priority, setPriority] = useState<TaskPriority>(
        template?.priority || 'medium'
    )
    const [frequency, setFrequency] = useState<RecurringFrequency>(
        template?.frequency || 'weekly'
    )
    const [assignmentStrategy, setAssignmentStrategy] =
        useState<AssignmentStrategy>(template?.assignmentStrategy || 'rotation')
    const [fixedAssignee, setFixedAssignee] = useState(
        template?.fixedAssignee || ''
    )
    const [rotationOrder, setRotationOrder] = useState<string[]>(
        template?.rotationOrder || members.map((m) => m.userId)
    )
    const [dueDay, setDueDay] = useState(template?.dueDay || 1)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) return

        const data: CreateRecurringTaskInput = {
            title: title.trim(),
            description: description.trim() || undefined,
            priority,
            frequency,
            assignmentStrategy,
            dueDay,
        }

        if (assignmentStrategy === 'fixed' && fixedAssignee) {
            data.fixedAssignee = fixedAssignee
        } else if (assignmentStrategy === 'rotation') {
            data.rotationOrder = rotationOrder
        }

        await onSubmit(data)
    }

    const toggleMemberInRotation = (userId: string) => {
        if (rotationOrder.includes(userId)) {
            setRotationOrder(rotationOrder.filter((id) => id !== userId))
        } else {
            setRotationOrder([...rotationOrder, userId])
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-brand-200 bg-brand-50/50 p-4 dark:border-brand-800 dark:bg-brand-900/20"
        >
            <div className="mb-4 flex items-center justify-between">
                <h4 className="font-medium text-neutral-900 dark:text-white">
                    {template ? 'Vorlage bearbeiten' : 'Neue Vorlage'}
                </h4>
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                    <X className="size-4 text-neutral-500" />
                </button>
            </div>

            <div className="space-y-4">
                {/* Title */}
                <Input
                    label="Titel"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="z.B. Küche putzen"
                    required
                />

                {/* Description */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Beschreibung (optional)
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Weitere Details..."
                        rows={2}
                        className={cn(
                            'w-full rounded-lg border px-3 py-2 text-sm',
                            'border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800',
                            'focus:border-brand-500 focus:ring-brand-500/20 focus:outline-none focus:ring-2'
                        )}
                    />
                </div>

                {/* Priority */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Priorität
                    </label>
                    <div className="flex gap-2">
                        {PRIORITIES.map((p) => (
                            <button
                                key={p.value}
                                type="button"
                                onClick={() => setPriority(p.value)}
                                className={cn(
                                    'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                    priority === p.value
                                        ? 'bg-brand-500 text-white'
                                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
                                )}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Frequency */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Häufigkeit
                    </label>
                    <select
                        value={frequency}
                        onChange={(e) =>
                            setFrequency(e.target.value as RecurringFrequency)
                        }
                        className={cn(
                            'w-full rounded-lg border px-3 py-2 text-sm',
                            'border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800',
                            'focus:border-brand-500 focus:ring-brand-500/20 focus:outline-none focus:ring-2'
                        )}
                    >
                        {FREQUENCIES.map((f) => (
                            <option key={f.value} value={f.value}>
                                {f.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Due Day */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        {frequency === 'monthly'
                            ? 'Tag des Monats'
                            : 'Wochentag'}
                    </label>
                    {frequency === 'monthly' ? (
                        <Input
                            type="number"
                            value={dueDay}
                            onChange={(e) =>
                                setDueDay(
                                    Math.max(1, Math.min(31, parseInt(e.target.value) || 1))
                                )
                            }
                            min={1}
                            max={31}
                        />
                    ) : frequency === 'daily' ? (
                        <p className="text-sm text-neutral-500">
                            Aufgabe wird jeden Tag fällig
                        </p>
                    ) : (
                        <select
                            value={dueDay}
                            onChange={(e) => setDueDay(parseInt(e.target.value))}
                            className={cn(
                                'w-full rounded-lg border px-3 py-2 text-sm',
                                'border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800',
                                'focus:border-brand-500 focus:ring-brand-500/20 focus:outline-none focus:ring-2'
                            )}
                        >
                            {WEEKDAYS.map((d) => (
                                <option key={d.value} value={d.value}>
                                    {d.label}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Assignment Strategy */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Zuweisung
                    </label>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setAssignmentStrategy('rotation')}
                            className={cn(
                                'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                assignmentStrategy === 'rotation'
                                    ? 'bg-brand-500 text-white'
                                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
                            )}
                        >
                            Rotation
                        </button>
                        <button
                            type="button"
                            onClick={() => setAssignmentStrategy('fixed')}
                            className={cn(
                                'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                assignmentStrategy === 'fixed'
                                    ? 'bg-brand-500 text-white'
                                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
                            )}
                        >
                            Feste Person
                        </button>
                    </div>
                </div>

                {/* Fixed Assignee or Rotation Order */}
                {assignmentStrategy === 'fixed' ? (
                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            Zugewiesen an
                        </label>
                        <select
                            value={fixedAssignee}
                            onChange={(e) => setFixedAssignee(e.target.value)}
                            className={cn(
                                'w-full rounded-lg border px-3 py-2 text-sm',
                                'border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800',
                                'focus:border-brand-500 focus:ring-brand-500/20 focus:outline-none focus:ring-2'
                            )}
                        >
                            <option value="">Niemand</option>
                            {members.map((m) => (
                                <option key={m.userId} value={m.userId}>
                                    {m.userName}
                                </option>
                            ))}
                        </select>
                    </div>
                ) : (
                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            Rotationsreihenfolge
                        </label>
                        <div className="space-y-1">
                            {members.map((m) => (
                                <label
                                    key={m.userId}
                                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                >
                                    <input
                                        type="checkbox"
                                        checked={rotationOrder.includes(m.userId)}
                                        onChange={() =>
                                            toggleMemberInRotation(m.userId)
                                        }
                                        className="size-4 rounded border-neutral-300 text-brand-500 focus:ring-brand-500"
                                    />
                                    <span className="text-sm text-neutral-700 dark:text-neutral-300">
                                        {m.userName}
                                    </span>
                                </label>
                            ))}
                        </div>
                        {rotationOrder.length === 0 && (
                            <p className="mt-1 text-xs text-error-500">
                                Mindestens eine Person auswählen
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="mt-4 flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={onCancel}>
                    Abbrechen
                </Button>
                <Button
                    type="submit"
                    disabled={
                        isSubmitting ||
                        !title.trim() ||
                        (assignmentStrategy === 'rotation' &&
                            rotationOrder.length === 0)
                    }
                >
                    {isSubmitting ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : template ? (
                        'Speichern'
                    ) : (
                        'Erstellen'
                    )}
                </Button>
            </div>
        </form>
    )
}
