import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    Activity,
    Plus,
    UserPlus,
    Pencil,
    CheckCircle2,
    Loader2,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'
import { statisticsApi, type ActivityFilter } from '../../api/statistics'
import { queryKeys } from '../../lib/queryKeys'
import { ActivityLogItem } from './ActivityLogItem'
import { Button } from '../common'
import { ToggleButton } from '../ui'

interface FilterOption {
    value: ActivityFilter
    label: string
    icon: typeof Activity
}

const ACTIVITY_FILTERS: FilterOption[] = [
    { value: 'all', label: 'Alle', icon: Activity },
    { value: 'created', label: 'Erstellt', icon: Plus },
    { value: 'assigned', label: 'Zugewiesen', icon: UserPlus },
    { value: 'updated', label: 'Bearbeitet', icon: Pencil },
    { value: 'completed', label: 'Erledigt', icon: CheckCircle2 },
]

const PAGE_SIZE = 10

export const ActivityLog = () => {
    const [filter, setFilter] = useState<ActivityFilter>('all')
    const [page, setPage] = useState(1)

    const offset = (page - 1) * PAGE_SIZE

    const { data, isLoading, isFetching } = useQuery({
        queryKey: queryKeys.statistics.activityLog(filter, page, PAGE_SIZE),
        queryFn: () => statisticsApi.getActivityLog(filter, PAGE_SIZE, offset),
    })

    const activities = data?.activities ?? []
    const total = data?.meta.total ?? 0
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

    const canGoPrev = page > 1
    const canGoNext = page < totalPages

    const pageInfo = useMemo(() => {
        if (!total) {
            return '0 von 0'
        }

        const start = offset + 1
        const end = Math.min(offset + activities.length, total)
        return `${start}-${end} von ${total}`
    }, [activities.length, offset, total])

    const handleFilterChange = (nextFilter: ActivityFilter) => {
        setFilter(nextFilter)
        setPage(1)
    }

    const handlePrevPage = () => {
        if (canGoPrev) {
            setPage((prev) => prev - 1)
        }
    }

    const handleNextPage = () => {
        if (canGoNext) {
            setPage((prev) => prev + 1)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                {ACTIVITY_FILTERS.map((option) => {
                    const Icon = option.icon
                    return (
                        <ToggleButton
                            key={option.value}
                            selected={filter === option.value}
                            onClick={() => handleFilterChange(option.value)}
                            className="flex items-center gap-1.5 rounded-full"
                        >
                            <Icon className="size-4" />
                            {option.label}
                        </ToggleButton>
                    )
                })}
            </div>

            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="size-6 animate-spin text-neutral-400" />
                    </div>
                ) : activities.length === 0 ? (
                    <div className="py-8 text-center text-neutral-500 dark:text-neutral-400">
                        Noch keine Aktivitaeten vorhanden
                    </div>
                ) : (
                    activities.map((activity) => (
                        <ActivityLogItem
                            key={activity.id}
                            activity={activity}
                        />
                    ))
                )}
            </div>

            {!isLoading && total > PAGE_SIZE && (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        Seite {page} von {totalPages} ({pageInfo})
                    </span>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handlePrevPage}
                            disabled={!canGoPrev || isFetching}
                            icon={<ChevronLeft className="size-4" />}
                        >
                            Zurück
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleNextPage}
                            disabled={!canGoNext || isFetching}
                            icon={<ChevronRight className="size-4" />}
                            iconPosition="right"
                        >
                            Weiter
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
