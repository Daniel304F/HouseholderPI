import { MetricCard } from '../ui'
import type { TaskHistoryStats } from './types'

interface StatsGridProps {
    stats: TaskHistoryStats
}

export const StatsGrid = ({ stats }: StatsGridProps) => {
    return (
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricCard label="Gesamt erledigt" value={stats.total} />
            <MetricCard
                label="Hohe Prioritaet"
                value={stats.high}
                valueClassName="text-error-600 dark:text-error-400"
            />
            <MetricCard
                label="Mittlere Prioritaet"
                value={stats.medium}
                valueClassName="text-amber-600 dark:text-amber-400"
            />
            <MetricCard
                label="Niedrige Prioritaet"
                value={stats.low}
                valueClassName="text-neutral-600 dark:text-neutral-400"
            />
        </section>
    )
}
