import { Star } from 'lucide-react'
import { ChartCard } from '../ui/ChartCard'

interface FrequentTask {
    title: string
    count: number
}

interface FrequentTasksListProps {
    tasks: FrequentTask[]
    maxItems?: number
    className?: string
}

export const FrequentTasksList = ({
    tasks,
    maxItems = 8,
    className,
}: FrequentTasksListProps) => {
    return (
        <ChartCard
            title="Häufigste Aufgaben"
            icon={<Star className="size-5" />}
            className={className}
        >
            {tasks.length > 0 ? (
                <div className="space-y-3">
                    {tasks.slice(0, maxItems).map((task, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <div className="bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-medium">
                                {task.count}x
                            </div>
                            <p className="truncate text-neutral-700 capitalize dark:text-neutral-300">
                                {task.title}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="py-8 text-center text-neutral-500 dark:text-neutral-400">
                    Noch keine erledigten Aufgaben
                </p>
            )}
        </ChartCard>
    )
}
