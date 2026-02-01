import { useState } from 'react'
import { Filter, Plus } from 'lucide-react'
import { cn } from '../../../utils/cn'
import { Button, SearchBar } from '../../common'

// =============================================================================
// Types
// =============================================================================

export interface MemberInfo {
    userId: string
    name?: string
    avatar?: string
}

interface ToolbarProps {
    searchQuery: string
    onSearchChange: (q: string) => void
    onAddTask: () => void
    members: MemberInfo[]
    selectedMembers: string[]
    onMemberToggle: (id: string) => void
    selectedPriorities: string[]
    onPriorityToggle: (p: string) => void
    onClearFilters: () => void
}

// =============================================================================
// Constants
// =============================================================================

const PRIORITY_OPTIONS = [
    { value: 'high', label: 'Hoch', color: 'bg-error-500' },
    { value: 'medium', label: 'Mittel', color: 'bg-amber-500' },
    { value: 'low', label: 'Niedrig', color: 'bg-neutral-400' },
]

// =============================================================================
// Component
// =============================================================================

export const Toolbar = ({
    searchQuery,
    onSearchChange,
    onAddTask,
    members,
    selectedMembers,
    onMemberToggle,
    selectedPriorities,
    onPriorityToggle,
    onClearFilters,
}: ToolbarProps) => {
    const [showFilterMenu, setShowFilterMenu] = useState(false)
    const hasFilters = selectedMembers.length > 0 || selectedPriorities.length > 0

    return (
        <div className="space-y-3">
            {/* Member filter row */}
            <MemberFilterRow
                members={members}
                selectedMembers={selectedMembers}
                onMemberToggle={onMemberToggle}
                hasFilters={hasFilters}
                onClearFilters={onClearFilters}
            />

            {/* Search and actions */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <SearchBar
                    value={searchQuery}
                    onChange={onSearchChange}
                    placeholder="Aufgabe suchen..."
                    className="flex-1"
                />

                <div className="flex items-center gap-2">
                    {/* Filter dropdown */}
                    <div className="relative">
                        <Button
                            variant="secondary"
                            icon={<Filter className="size-4" />}
                            onClick={() => setShowFilterMenu(!showFilterMenu)}
                            className={cn(selectedPriorities.length > 0 && 'ring-2 ring-brand-500')}
                        >
                            Filter
                            {selectedPriorities.length > 0 && (
                                <span className="ml-1 flex size-5 items-center justify-center rounded-full bg-brand-500 text-xs text-white">
                                    {selectedPriorities.length}
                                </span>
                            )}
                        </Button>

                        {showFilterMenu && (
                            <FilterMenu
                                selectedPriorities={selectedPriorities}
                                onPriorityToggle={onPriorityToggle}
                                onClose={() => setShowFilterMenu(false)}
                            />
                        )}
                    </div>

                    <Button onClick={onAddTask} icon={<Plus className="size-4" />}>
                        <span className="sm:hidden">Aufgabe</span>
                        <span className="hidden sm:inline">Neue Aufgabe</span>
                    </Button>
                </div>
            </div>
        </div>
    )
}

// =============================================================================
// Sub-Components
// =============================================================================

interface MemberFilterRowProps {
    members: MemberInfo[]
    selectedMembers: string[]
    onMemberToggle: (id: string) => void
    hasFilters: boolean
    onClearFilters: () => void
}

const MemberFilterRow = ({
    members,
    selectedMembers,
    onMemberToggle,
    hasFilters,
    onClearFilters,
}: MemberFilterRowProps) => (
    <div className="flex items-center gap-2">
        <div className="flex -space-x-1">
            {members.slice(0, 8).map((m) => {
                const selected = selectedMembers.includes(m.userId)
                return (
                    <button
                        key={m.userId}
                        onClick={() => onMemberToggle(m.userId)}
                        title={m.name || m.userId}
                        className={cn(
                            'relative flex size-8 items-center justify-center rounded-full border-2 text-xs font-medium transition-all',
                            selected
                                ? 'z-10 scale-110 border-brand-500 ring-2 ring-brand-500/30'
                                : 'border-white hover:border-brand-300 dark:border-neutral-900',
                            !m.avatar &&
                                'bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400'
                        )}
                    >
                        {m.avatar ? (
                            <img
                                src={m.avatar}
                                alt={m.name}
                                className="size-full rounded-full object-cover"
                            />
                        ) : (
                            (m.name || m.userId).charAt(0).toUpperCase()
                        )}
                        {selected && (
                            <span className="absolute -bottom-0.5 -right-0.5 flex size-3 items-center justify-center rounded-full bg-brand-500">
                                <span className="size-1.5 rounded-full bg-white" />
                            </span>
                        )}
                    </button>
                )
            })}
            {members.length > 8 && (
                <div className="flex size-8 items-center justify-center rounded-full border-2 border-white bg-neutral-200 text-xs font-medium text-neutral-600 dark:border-neutral-900 dark:bg-neutral-700 dark:text-neutral-400">
                    +{members.length - 8}
                </div>
            )}
        </div>
        {hasFilters && (
            <button
                onClick={onClearFilters}
                className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
                Filter zurücksetzen
            </button>
        )}
    </div>
)

interface FilterMenuProps {
    selectedPriorities: string[]
    onPriorityToggle: (p: string) => void
    onClose: () => void
}

const FilterMenu = ({ selectedPriorities, onPriorityToggle, onClose }: FilterMenuProps) => (
    <>
        <div className="fixed inset-0 z-40" onClick={onClose} />
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-neutral-200 bg-white p-3 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
            <div className="mb-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                Priorität
            </div>
            <div className="space-y-1">
                {PRIORITY_OPTIONS.map((opt) => {
                    const selected = selectedPriorities.includes(opt.value)
                    return (
                        <button
                            key={opt.value}
                            onClick={() => onPriorityToggle(opt.value)}
                            className={cn(
                                'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                                selected
                                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                                    : 'hover:bg-neutral-100 dark:hover:bg-neutral-700'
                            )}
                        >
                            <div className={cn('size-3 rounded-full', opt.color)} />
                            <span className="flex-1 text-left">{opt.label}</span>
                            {selected && (
                                <svg
                                    className="size-4 text-brand-500"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    </>
)
