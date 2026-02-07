import { Repeat } from 'lucide-react'
import { cn } from '../../utils/cn'
import { FREQUENCY_LABELS } from '../../constants'
import type { RecurringTaskTemplate } from '../../api/recurringTasks'

interface CalendarRecurringItemProps {
    template: RecurringTaskTemplate
    onClick?: () => void
}

export const CalendarRecurringItem = ({
    template,
    onClick,
}: CalendarRecurringItemProps) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors',
                'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                'border-l-2 border-info-500'
            )}
        >
            <Repeat className="size-4 flex-shrink-0 text-info-500" />
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                    {template.title}
                </p>
            </div>
            <span className="rounded bg-info-100 px-1.5 py-0.5 text-xs font-medium text-info-700 dark:bg-info-900/30 dark:text-info-400">
                {FREQUENCY_LABELS[template.frequency] || template.frequency}
            </span>
        </button>
    )
}
