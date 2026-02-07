import { useState } from 'react'
import { Loader2, X } from 'lucide-react'
import { cn } from '../../../utils/cn'
import { Button, IconButton, Input } from '../../common'
import { ToggleButton } from '../../ui'
import type { GroupMember } from '../../../api/groups'
import type {
    AssignmentStrategy,
    CreateRecurringTaskInput,
    RecurringFrequency,
    RecurringTaskTemplate,
    TaskPriority,
} from '../../../api/recurringTasks'
import {
    RECURRING_FREQUENCIES,
    RECURRING_PRIORITIES,
} from './recurringTaskForm.constants'
import { RecurringTaskAssignmentField } from './RecurringTaskAssignmentField'
import { RecurringTaskDueDaysField } from './RecurringTaskDueDaysField'
import {
    clampMonthDay,
    toggleNumberInList,
    toggleStringInList,
} from './recurringTaskForm.utils'

interface RecurringTaskFormProps {
    members: GroupMember[]
    template?: RecurringTaskTemplate
    onSubmit: (data: CreateRecurringTaskInput) => void | Promise<void>
    onCancel: () => void
    isSubmitting: boolean
}

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
    const [assignmentStrategy, setAssignmentStrategy] = useState<AssignmentStrategy>(
        template?.assignmentStrategy || 'rotation'
    )
    const [fixedAssignee, setFixedAssignee] = useState(template?.fixedAssignee || '')
    const [rotationOrder, setRotationOrder] = useState<string[]>(
        template?.rotationOrder || members.map((member) => member.userId)
    )
    const [dueDays, setDueDays] = useState<number[]>(template?.dueDays || [1])
    const [monthDay, setMonthDay] = useState(template?.dueDays?.[0] || 1)

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        if (!title.trim()) return

        const finalDueDays =
            frequency === 'daily'
                ? [0]
                : frequency === 'monthly'
                  ? [monthDay]
                  : dueDays

        if (finalDueDays.length === 0 && frequency !== 'daily') {
            return
        }

        const payload: CreateRecurringTaskInput = {
            title: title.trim(),
            description: description.trim() || undefined,
            priority,
            frequency,
            assignmentStrategy,
            dueDays: finalDueDays,
        }

        if (assignmentStrategy === 'fixed' && fixedAssignee) {
            payload.fixedAssignee = fixedAssignee
        } else if (assignmentStrategy === 'rotation') {
            payload.rotationOrder = rotationOrder
        }

        await onSubmit(payload)
    }

    const isSubmitDisabled =
        isSubmitting ||
        !title.trim() ||
        (assignmentStrategy === 'rotation' && rotationOrder.length === 0) ||
        (frequency !== 'daily' &&
            frequency !== 'monthly' &&
            dueDays.length === 0)

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-brand-200 bg-brand-50/50 p-4 dark:border-brand-800 dark:bg-brand-900/20"
        >
            <header className="mb-4 flex items-center justify-between">
                <h4 className="font-medium text-neutral-900 dark:text-white">
                    {template ? 'Vorlage bearbeiten' : 'Neue Vorlage'}
                </h4>
                <IconButton
                    icon={<X className="size-4" />}
                    variant="ghost"
                    size="sm"
                    onClick={onCancel}
                    aria-label="Schliessen"
                />
            </header>

            <div className="space-y-4">
                <Input
                    label="Titel"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="z.B. Kueche putzen"
                    required
                />

                <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Beschreibung (optional)
                    </label>
                    <textarea
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        placeholder="Weitere Details..."
                        rows={2}
                        className={cn(
                            'w-full rounded-lg border px-3 py-2 text-sm',
                            'border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800',
                            'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none'
                        )}
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Prioritaet
                    </label>
                    <div className="flex gap-2">
                        {RECURRING_PRIORITIES.map((option) => (
                            <ToggleButton
                                key={option.value}
                                selected={priority === option.value}
                                onClick={() => setPriority(option.value)}
                                className="flex-1"
                            >
                                {option.label}
                            </ToggleButton>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Haeufigkeit
                    </label>
                    <select
                        value={frequency}
                        onChange={(event) =>
                            setFrequency(event.target.value as RecurringFrequency)
                        }
                        className={cn(
                            'w-full rounded-lg border px-3 py-2 text-sm',
                            'border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800',
                            'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none'
                        )}
                    >
                        {RECURRING_FREQUENCIES.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <RecurringTaskDueDaysField
                    frequency={frequency}
                    dueDays={dueDays}
                    monthDay={monthDay}
                    onMonthDayChange={(value) =>
                        setMonthDay(clampMonthDay(Number.isFinite(value) ? value : 1))
                    }
                    onToggleWeekday={(day) =>
                        setDueDays((prev) => toggleNumberInList(prev, day))
                    }
                />

                <RecurringTaskAssignmentField
                    members={members}
                    strategy={assignmentStrategy}
                    fixedAssignee={fixedAssignee}
                    rotationOrder={rotationOrder}
                    onStrategyChange={setAssignmentStrategy}
                    onFixedAssigneeChange={setFixedAssignee}
                    onToggleRotationMember={(userId) =>
                        setRotationOrder((prev) => toggleStringInList(prev, userId))
                    }
                />
            </div>

            <footer className="mt-4 flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={onCancel}>
                    Abbrechen
                </Button>
                <Button type="submit" disabled={isSubmitDisabled}>
                    {isSubmitting ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : template ? (
                        'Speichern'
                    ) : (
                        'Erstellen'
                    )}
                </Button>
            </footer>
        </form>
    )
}
