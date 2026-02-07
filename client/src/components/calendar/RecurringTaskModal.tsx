import { X, RefreshCw, UserCircle, Paperclip } from 'lucide-react'
import { cn } from '../../utils/cn'
import { FREQUENCY_LABELS, WEEKDAY_LABELS } from '../../constants'
import type { RecurringTaskTemplate } from '../../api/recurringTasks'

interface RecurringTaskModalProps {
    template: RecurringTaskTemplate
    members: { userId: string; userName?: string }[]
    onClose: () => void
}

export const RecurringTaskModal = ({
    template,
    members,
    onClose,
}: RecurringTaskModalProps) => {
    const getMemberName = (userId: string) => {
        const member = members.find((m) => m.userId === userId)
        return member?.userName || 'Unbekannt'
    }

    const getDueDaysLabel = () => {
        if (template.frequency === 'daily') return 'Jeden Tag'
        if (
            template.frequency === 'weekly' ||
            template.frequency === 'biweekly'
        ) {
            const days = template.dueDays || []
            if (days.length === 0) return '-'
            if (days.length === 7) return 'Jeden Tag'
            return days.map((d) => WEEKDAY_LABELS[d]).join(', ')
        }
        return `${template.dueDays?.[0] || 1}. des Monats`
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div
                className={cn(
                    'w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-neutral-900',
                    'animate-in fade-in zoom-in-95 duration-200'
                )}
            >
                {/* Header */}
                <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <RefreshCw className="size-5 text-brand-500" />
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                            Wiederkehrende Aufgabe
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                        <X className="size-5 text-neutral-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    <div>
                        <h3 className="text-xl font-medium text-neutral-900 dark:text-white">
                            {template.title}
                        </h3>
                        {template.description && (
                            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                                {template.description}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-neutral-500 dark:text-neutral-400">
                                Häufigkeit
                            </span>
                            <p className="font-medium text-neutral-900 dark:text-white">
                                {FREQUENCY_LABELS[template.frequency]}
                            </p>
                        </div>
                        <div>
                            <span className="text-neutral-500 dark:text-neutral-400">
                                Fällig
                            </span>
                            <p className="font-medium text-neutral-900 dark:text-white">
                                {getDueDaysLabel()}
                            </p>
                        </div>
                        <div>
                            <span className="text-neutral-500 dark:text-neutral-400">
                                Zuweisung
                            </span>
                            <p className="font-medium text-neutral-900 dark:text-white">
                                {template.assignmentStrategy === 'fixed'
                                    ? 'Feste Person'
                                    : 'Rotation'}
                            </p>
                        </div>
                        <div>
                            <span className="text-neutral-500 dark:text-neutral-400">
                                Status
                            </span>
                            <p
                                className={cn(
                                    'font-medium',
                                    template.isActive
                                        ? 'text-success-600'
                                        : 'text-neutral-500'
                                )}
                            >
                                {template.isActive ? 'Aktiv' : 'Inaktiv'}
                            </p>
                        </div>
                    </div>

                    {/* Next assignee */}
                    {template.nextSuggestedAssignee && (
                        <div className="flex items-center gap-2 rounded-lg bg-brand-50 p-3 dark:bg-brand-900/20">
                            <UserCircle className="size-5 text-brand-500" />
                            <div>
                                <span className="text-xs text-brand-600 dark:text-brand-400">
                                    Nächste Zuweisung
                                </span>
                                <p className="font-medium text-brand-700 dark:text-brand-300">
                                    {getMemberName(
                                        template.nextSuggestedAssignee
                                    )}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Attachments */}
                    {template.attachments &&
                        template.attachments.length > 0 && (
                            <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                                <div className="mb-2 flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                                    <Paperclip className="size-4" />
                                    <span>
                                        {template.attachments.length} Anhänge
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    {template.attachments.map((att) => (
                                        <p
                                            key={att.id}
                                            className="truncate text-xs text-neutral-500"
                                        >
                                            {att.originalName}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}
                </div>

                {/* Footer */}
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className={cn(
                            'rounded-lg px-4 py-2 text-sm font-medium',
                            'bg-neutral-100 text-neutral-700 hover:bg-neutral-200',
                            'dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                        )}
                    >
                        Schließen
                    </button>
                </div>
            </div>
        </div>
    )
}
