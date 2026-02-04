import {
    ClipboardList,
    Filter,
    CheckCircle2,
    Clock,
    Circle,
    AlertCircle,
    ChevronDown,
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { Button, SearchBar } from '../common'
import { MyTaskCard } from '../tasks'
import type { TaskWithDetails } from '../../api/tasks'
import { STATUS_FILTERS, SORT_OPTIONS, type StatusFilter, type SortOption } from './constants'

// =============================================================================
// Page Header
// =============================================================================

export const PageHeader = () => (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                Meine Aufgaben
            </h1>
            <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                Alle Aufgaben, die dir zugewiesen sind
            </p>
        </div>
    </div>
)

// =============================================================================
// Stats Grid
// =============================================================================

interface TaskStatsGridProps {
    stats: { total: number; pending: number; inProgress: number; completed: number }
}

export const TaskStatsGrid = ({ stats }: TaskStatsGridProps) => (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={ClipboardList} label="Gesamt" value={stats.total} />
        <StatCard icon={Circle} label="Offen" value={stats.pending} colorClass="text-warning-600 dark:text-warning-400" />
        <StatCard icon={Clock} label="In Bearbeitung" value={stats.inProgress} colorClass="text-info-600 dark:text-info-400" />
        <StatCard icon={CheckCircle2} label="Erledigt" value={stats.completed} colorClass="text-success-600 dark:text-success-400" />
    </div>
)

interface StatCardProps {
    icon: typeof Circle
    label: string
    value: number
    colorClass?: string
}

const StatCard = ({ icon: Icon, label, value, colorClass }: StatCardProps) => (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
        <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
            <Icon className="size-4" />
            <span className="text-sm">{label}</span>
        </div>
        <p className={cn('mt-1 text-2xl font-bold', colorClass || 'text-neutral-900 dark:text-white')}>
            {value}
        </p>
    </div>
)

// =============================================================================
// Filter Section
// =============================================================================

interface FilterSectionProps {
    searchQuery: string
    onSearchChange: (query: string) => void
    sortBy: SortOption
    onSortChange: (sort: SortOption) => void
    statusFilter: StatusFilter | null
    onStatusFilterChange: (filter: StatusFilter | null) => void
    showFilters: boolean
    onToggleFilters: () => void
}

export const FilterSection = ({
    searchQuery,
    onSearchChange,
    sortBy,
    onSortChange,
    statusFilter,
    onStatusFilterChange,
    showFilters,
    onToggleFilters,
}: FilterSectionProps) => (
    <div className="space-y-4">
        {/* Status Filter Pills */}
        <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((filter) => {
                const Icon = filter.icon
                const isActive = statusFilter === filter.value
                return (
                    <button
                        key={filter.value}
                        onClick={() => onStatusFilterChange(isActive ? null : filter.value)}
                        className={cn(
                            'flex items-center gap-2 rounded-full px-4 py-2 text-sm',
                            'border transition-all',
                            isActive
                                ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
                                : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-600'
                        )}
                    >
                        <Icon className="size-4" />
                        {filter.label}
                    </button>
                )
            })}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchBar
                value={searchQuery}
                onChange={onSearchChange}
                placeholder="Aufgaben suchen..."
                className="flex-1"
            />

            <div className="relative">
                <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value as SortOption)}
                    className={cn(
                        'appearance-none rounded-lg border py-2 pr-10 pl-4',
                        'border-neutral-300 dark:border-neutral-600',
                        'bg-white dark:bg-neutral-800',
                        'text-neutral-900 dark:text-white',
                        'focus:border-brand-500 focus:ring-brand-500/20 focus:ring-2'
                    )}
                >
                    {SORT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            Sortieren: {option.label}
                        </option>
                    ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-neutral-400" />
            </div>

            <Button
                variant="secondary"
                onClick={onToggleFilters}
                className={cn(showFilters && 'bg-brand-100 dark:bg-brand-900/30')}
            >
                <Filter className="mr-2 size-4" />
                Mehr Filter
            </Button>
        </div>

        {showFilters && (
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/50">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Weitere Filter werden in Kürze verfügbar sein.
                </p>
            </div>
        )}
    </div>
)

// =============================================================================
// Task Lists
// =============================================================================

interface TaskListProps {
    onTaskClick: (task: TaskWithDetails) => void
    onEditClick: (task: TaskWithDetails) => void
    onComplete: (task: TaskWithDetails) => void
}

interface GroupedTaskListProps extends TaskListProps {
    tasksByGroup: Record<string, TaskWithDetails[]>
}

export const GroupedTaskList = ({ tasksByGroup, onTaskClick, onEditClick, onComplete }: GroupedTaskListProps) => (
    <div className="space-y-6">
        {Object.entries(tasksByGroup).map(([groupName, groupTasks]) => (
            <div key={groupName}>
                <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white">
                    <span className="bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 rounded-lg px-2 py-1 text-sm">
                        {groupName}
                    </span>
                    <span className="text-sm font-normal text-neutral-500">
                        ({groupTasks.length})
                    </span>
                </h2>
                <div className="space-y-3">
                    {groupTasks.map((task) => (
                        <MyTaskCard
                            key={task.id}
                            task={task}
                            onClick={() => onTaskClick(task)}
                            onEditClick={() => onEditClick(task)}
                            onComplete={() => onComplete(task)}
                            subtaskCount={task.subtasks?.length || 0}
                        />
                    ))}
                </div>
            </div>
        ))}
    </div>
)

interface FlatTaskListProps extends TaskListProps {
    tasks: TaskWithDetails[]
}

export const FlatTaskList = ({ tasks, onTaskClick, onEditClick, onComplete }: FlatTaskListProps) => (
    <div className="space-y-3">
        {tasks.map((task) => (
            <MyTaskCard
                key={task.id}
                task={task}
                onClick={() => onTaskClick(task)}
                onEditClick={() => onEditClick(task)}
                onComplete={() => onComplete(task)}
                showGroupBadge
                groupName={task.groupName}
                subtaskCount={task.subtasks?.length || 0}
            />
        ))}
    </div>
)

// =============================================================================
// States
// =============================================================================

export const EmptyState = ({ hasFilters }: { hasFilters: boolean }) => (
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

export const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
        <AlertCircle className="text-error-500 size-12" />
        <p className="text-neutral-500 dark:text-neutral-400">
            Aufgaben konnten nicht geladen werden.
        </p>
        <Button onClick={onRetry}>Erneut versuchen</Button>
    </div>
)

export const MyTasksSkeleton = () => (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700" />
            <div className="h-10 w-32 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700" />
        </div>
        <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
                <div
                    key={i}
                    className="h-24 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-700"
                />
            ))}
        </div>
    </div>
)
