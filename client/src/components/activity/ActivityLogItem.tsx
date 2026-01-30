import { Plus, UserPlus, Pencil, CheckCircle2 } from 'lucide-react'
import { cn } from '../../utils/cn'
import type { ActivityLogEntry, ActivityType } from '../../api/statistics'

interface ActivityLogItemProps {
    activity: ActivityLogEntry
}

const activityConfig: Record<
    ActivityType,
    { icon: typeof Plus; label: string; color: string }
> = {
    created: {
        icon: Plus,
        label: 'Erstellt',
        color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
    },
    assigned: {
        icon: UserPlus,
        label: 'Zugewiesen',
        color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
    },
    updated: {
        icon: Pencil,
        label: 'Bearbeitet',
        color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
    },
    completed: {
        icon: CheckCircle2,
        label: 'Erledigt',
        color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
    },
}

export const ActivityLogItem = ({ activity }: ActivityLogItemProps) => {
    const config = activityConfig[activity.type]
    const Icon = config.icon

    const formattedDate = new Date(activity.createdAt).toLocaleDateString(
        'de-DE',
        {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        }
    )

    return (
        <div className="flex items-start gap-3 py-3">
            <div
                className={cn(
                    'mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
                    config.color
                )}
            >
                <Icon className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <span className="font-medium text-neutral-900 dark:text-white">
                        {activity.taskTitle}
                    </span>
                    <span
                        className={cn(
                            'rounded-full px-2 py-0.5 text-xs font-medium',
                            config.color
                        )}
                    >
                        {config.label}
                    </span>
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                    <span>{activity.groupName}</span>
                    {activity.details && (
                        <>
                            <span>•</span>
                            <span>{activity.details}</span>
                        </>
                    )}
                </div>
                <div className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                    {formattedDate}
                </div>
            </div>
        </div>
    )
}
