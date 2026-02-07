import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { cn } from '../../../utils/cn'
import { Button, Input, IconButton } from '../../common'
import { ToggleButton } from '../../ui'
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
    { value: 1, label: 'Mo', fullLabel: 'Montag' },
    { value: 2, label: 'Di', fullLabel: 'Dienstag' },
    { value: 3, label: 'Mi', fullLabel: 'Mittwoch' },
    { value: 4, label: 'Do', fullLabel: 'Donnerstag' },
    { value: 5, label: 'Fr', fullLabel: 'Freitag' },
    { value: 6, label: 'Sa', fullLabel: 'Samstag' },
    { value: 0, label: 'So', fullLabel: 'Sonntag' },
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
    // Changed from dueDay to dueDays (array)
    const [dueDays, setDueDays] = useState<number[]>(
        template?.dueDays || [1] // Default: Monday
    )
    // For monthly, keep a single value input
    const [monthDay, setMonthDay] = useState(
        template?.dueDays?.[0] || 1
    )

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) return

        // Determine dueDays based on frequency
        let finalDueDays: number[]
        if (frequency === 'daily') {
            finalDueDays = [0] // Not really used for daily
        } else if (frequency === 'monthly') {
            finalDueDays = [monthDay]
        } else {
            finalDueDays = dueDays
        }

        if (finalDueDays.length === 0 && frequency !== 'daily') {
            return // Prevent submission without selected days
        }

        const data: CreateRecurringTaskInput = {
            title: title.trim(),
            description: description.trim() || undefined,
            priority,
            frequency,
            assignmentStrategy,
            dueDays: finalDueDays,
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

    const toggleWeekday = (day: number) => {
        if (dueDays.includes(day)) {
            setDueDays(dueDays.filter((d) => d !== day))
        } else {
            setDueDays([...dueDays, day].sort((a, b) => a - b))
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
                <IconButton
                    icon={<X className="size-4" />}
                    variant="ghost"
                    size="sm"
                    onClick={onCancel}
                    aria-label="Schließen"
                />
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
                            <ToggleButton
                                key={p.value}
                                selected={priority === p.value}
                                onClick={() => setPriority(p.value)}
                                className="flex-1"
                            >
                                {p.label}
                            </ToggleButton>
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

                {/* Due Days */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        {frequency === 'monthly'
                            ? 'Tag des Monats'
                            : 'Wochentage'}
                    </label>
                    {frequency === 'monthly' ? (
                        <Input
                            type="number"
                            value={monthDay}
                            onChange={(e) =>
                                setMonthDay(
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
                        <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                                {WEEKDAYS.map((day) => (
                                    <ToggleButton
                                        key={day.value}
                                        selected={dueDays.includes(day.value)}
                                        onClick={() => toggleWeekday(day.value)}
                                        title={day.fullLabel}
                                        className="flex size-10 items-center justify-center px-0"
                                    >
                                        {day.label}
                                    </ToggleButton>
                                ))}
                            </div>
                            {dueDays.length === 0 && (
                                <p className="text-xs text-error-500">
                                    Mindestens einen Tag auswählen
                                </p>
                            )}
                            {dueDays.length > 0 && (
                                <p className="text-xs text-neutral-500">
                                    Ausgewählt: {dueDays.map(d => WEEKDAYS.find(w => w.value === d)?.fullLabel).join(', ')}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Assignment Strategy */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Zuweisung
                    </label>
                    <div className="flex gap-2">
                        <ToggleButton
                            selected={assignmentStrategy === 'rotation'}
                            onClick={() => setAssignmentStrategy('rotation')}
                            className="flex-1"
                        >
                            Rotation
                        </ToggleButton>
                        <ToggleButton
                            selected={assignmentStrategy === 'fixed'}
                            onClick={() => setAssignmentStrategy('fixed')}
                            className="flex-1"
                        >
                            Feste Person
                        </ToggleButton>
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
                            rotationOrder.length === 0) ||
                        (frequency !== 'daily' && frequency !== 'monthly' && dueDays.length === 0)
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
