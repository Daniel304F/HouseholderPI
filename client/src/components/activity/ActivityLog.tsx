import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    Activity,
    Plus,
    UserPlus,
    Pencil,
    CheckCircle2,
    Loader2,
    ChevronDown,
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
    const [limit, setLimit] = useState(PAGE_SIZE)

    const { data, isLoading, isFetching } = useQuery({
        queryKey: queryKeys.statistics.activityLog(filter, limit),
        queryFn: () => statisticsApi.getActivityLog(filter, limit, 0),
    })

    const activities = data?.activities ?? []
    const total = data?.meta.total ?? 0
    const hasMore = activities.length < total

    const handleLoadMore = () => {
        setLimit((prev) => prev + PAGE_SIZE)
    }

    return (
        <div className="space-y-4">
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
                {ACTIVITY_FILTERS.map((option) => {
                    const Icon = option.icon
                    return (
                        <ToggleButton
                            key={option.value}
                            selected={filter === option.value}
                            onClick={() => {
                                setFilter(option.value)
                                setLimit(PAGE_SIZE)
                            }}
                            className="flex items-center gap-1.5 rounded-full"
                        >
                            <Icon className="size-4" />
                            {option.label}
                        </ToggleButton>
                    )
                })}
            </div>

            {/* Activity List */}
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="size-6 animate-spin text-neutral-400" />
                    </div>
                ) : activities.length === 0 ? (
                    <div className="py-8 text-center text-neutral-500 dark:text-neutral-400">
                        Noch keine Aktivitäten vorhanden
                    </div>
                ) : (
                    activities.map((activity) => (
                        <ActivityLogItem key={activity.id} activity={activity} />
                    ))
                )}
            </div>

            {/* Load More */}
            {hasMore && !isLoading && (
                <div className="flex justify-center pt-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLoadMore}
                        disabled={isFetching}
                        icon={
                            isFetching ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <ChevronDown className="size-4" />
                            )
                        }
                    >
                        {isFetching ? 'Laden...' : 'Mehr laden'}
                    </Button>
                </div>
            )}
        </div>
    )
}
