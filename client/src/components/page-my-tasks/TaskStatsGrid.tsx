import { CheckCircle2, Circle, ClipboardList, Clock } from 'lucide-react'
import { MetricCard } from '../ui'
import type { MyTaskStats } from './types'

interface TaskStatsGridProps {
    stats: MyTaskStats
}

export const TaskStatsGrid = ({ stats }: TaskStatsGridProps) => {
    return (
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricCard icon={ClipboardList} label="Gesamt" value={stats.total} />
            <MetricCard
                icon={Circle}
                label="Offen"
                value={stats.pending}
                valueClassName="text-warning-600 dark:text-warning-400"
            />
            <MetricCard
                icon={Clock}
                label="In Bearbeitung"
                value={stats.inProgress}
                valueClassName="text-info-600 dark:text-info-400"
            />
            <MetricCard
                icon={CheckCircle2}
                label="Erledigt"
                value={stats.completed}
                valueClassName="text-success-600 dark:text-success-400"
            />
        </section>
    )
}
