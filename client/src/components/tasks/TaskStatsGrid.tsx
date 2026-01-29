import { ClipboardList, Circle, Clock, CheckCircle2 } from 'lucide-react'

interface TaskStatsGridProps {
    totalCount: number
    pendingCount: number
    inProgressCount: number
    completedCount: number
}

export const TaskStatsGrid = ({
    totalCount,
    pendingCount,
    inProgressCount,
    completedCount,
}: TaskStatsGridProps) => {
    const stats = [
        {
            label: 'Gesamt',
            value: totalCount,
            icon: ClipboardList,
            colorClass: 'text-neutral-900 dark:text-white',
        },
        {
            label: 'Offen',
            value: pendingCount,
            icon: Circle,
            colorClass: 'text-warning-600 dark:text-warning-400',
        },
        {
            label: 'In Bearbeitung',
            value: inProgressCount,
            icon: Clock,
            colorClass: 'text-info-600 dark:text-info-400',
        },
        {
            label: 'Erledigt',
            value: completedCount,
            icon: CheckCircle2,
            colorClass: 'text-success-600 dark:text-success-400',
        },
    ]

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((stat) => {
                const Icon = stat.icon
                return (
                    <div
                        key={stat.label}
                        className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800"
                    >
                        <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                            <Icon className="size-4" />
                            <span className="text-sm">{stat.label}</span>
                        </div>
                        <p className={`mt-1 text-2xl font-bold ${stat.colorClass}`}>
                            {stat.value}
                        </p>
                    </div>
                )
            })}
        </div>
    )
}
