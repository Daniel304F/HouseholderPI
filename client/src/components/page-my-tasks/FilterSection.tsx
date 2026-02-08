import { ChevronDown, Filter } from 'lucide-react'
import { Button, SearchBar } from '../common'
import { cn } from '../../utils/cn'
import type {
    SortOption,
    StatusFilter,
} from '../../constants/myTasks.constants'
import { SORT_OPTIONS, STATUS_FILTERS } from './constants'

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
}: FilterSectionProps) => {
    return (
        <section className="space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-1">
                {STATUS_FILTERS.map((filter) => {
                    const Icon = filter.icon
                    const isActive = statusFilter === filter.value

                    return (
                        <button
                            key={filter.value}
                            type="button"
                            onClick={() =>
                                onStatusFilterChange(
                                    isActive ? null : filter.value
                                )
                            }
                            className={cn(
                                'flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all duration-200',
                                isActive
                                    ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-brand-500/15 dark:bg-brand-900/30 dark:text-brand-400 shadow-sm'
                                    : 'hover:border-brand-300 dark:hover:border-brand-600 border-neutral-200 bg-white text-neutral-600 hover:-translate-y-0.5 hover:shadow-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400'
                            )}
                        >
                            <Icon className="size-4" />
                            {filter.label}
                        </button>
                    )
                })}
            </div>

            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center">
                <SearchBar
                    value={searchQuery}
                    onChange={onSearchChange}
                    placeholder="Aufgaben suchen..."
                    className="w-full"
                />

                <div className="relative">
                    <select
                        value={sortBy}
                        onChange={(event) =>
                            onSortChange(event.target.value as SortOption)
                        }
                        className={cn(
                            'h-10 w-full min-w-44 appearance-none rounded-lg border py-2 pr-10 pl-4 shadow-sm transition-all sm:w-auto',
                            'border-neutral-300 bg-white text-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white',
                            'hover:border-brand-300 dark:hover:border-brand-600',
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
                    className={cn(
                        'hover:-translate-y-0.5 hover:shadow-sm',
                        showFilters && 'bg-brand-100 dark:bg-brand-900/30'
                    )}
                >
                    <Filter className="mr-2 size-4" />
                    Mehr Filter
                </Button>
            </div>
        </section>
    )
}
