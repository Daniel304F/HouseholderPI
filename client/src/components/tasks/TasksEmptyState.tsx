import { ClipboardList } from 'lucide-react'

interface TasksEmptyStateProps {
    hasFilters: boolean
}

export const TasksEmptyState = ({ hasFilters }: TasksEmptyStateProps) => {
    return (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-neutral-300 py-12 dark:border-neutral-600">
            <ClipboardList className="size-12 text-neutral-400" />
            <div className="text-center">
                <p className="font-medium text-neutral-700 dark:text-neutral-300">
                    Keine Aufgaben gefunden
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {hasFilters
                        ? 'Versuche andere Filter oder Suchbegriffe'
                        : 'Dir sind noch keine Aufgaben zugewiesen'}
                </p>
            </div>
        </div>
    )
}
