import { cn } from '../../../utils/cn'
import type { RecurringFrequency } from '../../../api/recurringTasks'
import { Input } from '../../common'
import { ToggleButton } from '../../ui'
import { WEEKDAYS } from './recurringTaskForm.constants'
import { formatSelectedWeekdays } from './recurringTaskForm.utils'

interface RecurringTaskDueDaysFieldProps {
    frequency: RecurringFrequency
    dueDays: number[]
    monthDay: number
    onMonthDayChange: (value: number) => void
    onToggleWeekday: (day: number) => void
}

export const RecurringTaskDueDaysField = ({
    frequency,
    dueDays,
    monthDay,
    onMonthDayChange,
    onToggleWeekday,
}: RecurringTaskDueDaysFieldProps) => {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {frequency === 'monthly' ? 'Tag des Monats' : 'Wochentage'}
            </label>

            {frequency === 'monthly' ? (
                <Input
                    type="number"
                    value={monthDay}
                    onChange={(event) => onMonthDayChange(Number(event.target.value))}
                    min={1}
                    max={31}
                />
            ) : frequency === 'daily' ? (
                <p className="text-sm text-neutral-500">Aufgabe wird jeden Tag faellig</p>
            ) : (
                <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                        {WEEKDAYS.map((day) => (
                            <ToggleButton
                                key={day.value}
                                selected={dueDays.includes(day.value)}
                                onClick={() => onToggleWeekday(day.value)}
                                title={day.fullLabel}
                                className="flex size-10 items-center justify-center px-0"
                            >
                                {day.label}
                            </ToggleButton>
                        ))}
                    </div>
                    {dueDays.length === 0 && (
                        <p className="text-xs text-error-500">
                            Mindestens einen Tag auswaehlen
                        </p>
                    )}
                    {dueDays.length > 0 && (
                        <p className={cn('text-xs text-neutral-500')}>
                            Ausgewaehlt: {formatSelectedWeekdays(dueDays)}
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}
