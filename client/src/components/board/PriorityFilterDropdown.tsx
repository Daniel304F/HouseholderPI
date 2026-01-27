import { useState, useRef, useEffect } from 'react'
import { Filter, Check, X } from 'lucide-react'
import { cn } from '../../utils/cn'
import type { Priority } from '../../hooks/useTaskFilter'

interface PriorityFilterDropdownProps {
    activeFilters: Priority[]
    onToggleFilter: (priority: Priority) => void
    onClearFilters: () => void
    hasActiveFilters: boolean
}

const priorities: { id: Priority; label: string; color: string }[] = [
    {
        id: 'high',
        label: 'Hoch',
        color: 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400',
    },
    {
        id: 'medium',
        label: 'Mittel',
        color: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400',
    },
    {
        id: 'low',
        label: 'Niedrig',
        color: 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400',
    },
]

export const PriorityFilterDropdown = ({
    activeFilters,
    onToggleFilter,
    onClearFilters,
    hasActiveFilters,
}: PriorityFilterDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () =>
            document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Filter Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'flex items-center justify-center rounded-lg p-1.5',
                    'transition-all duration-200',
                    hasActiveFilters
                        ? 'bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400'
                        : 'text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-300'
                )}
                title="Nach Priorität filtern"
            >
                <Filter className="size-3.5" />
                {hasActiveFilters && (
                    <span className="bg-brand-500 absolute -top-0.5 -right-0.5 flex size-3 items-center justify-center rounded-full text-[8px] font-bold text-white">
                        {activeFilters.length}
                    </span>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    className={cn(
                        'absolute top-full right-0 z-50 mt-1 w-40',
                        'rounded-lg border shadow-lg',
                        'bg-white dark:bg-neutral-800',
                        'border-neutral-200 dark:border-neutral-700'
                    )}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-neutral-200 px-3 py-2 dark:border-neutral-700">
                        <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                            Priorität
                        </span>
                        {hasActiveFilters && (
                            <button
                                onClick={() => {
                                    onClearFilters()
                                    setIsOpen(false)
                                }}
                                className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                            >
                                <X className="size-3" />
                            </button>
                        )}
                    </div>

                    {/* Options */}
                    <div className="p-1">
                        {priorities.map((priority) => {
                            const isActive = activeFilters.includes(priority.id)
                            return (
                                <button
                                    key={priority.id}
                                    onClick={() => onToggleFilter(priority.id)}
                                    className={cn(
                                        'flex w-full items-center gap-2 rounded-md px-2 py-1.5',
                                        'transition-colors duration-150',
                                        'hover:bg-neutral-100 dark:hover:bg-neutral-700'
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'flex size-4 items-center justify-center rounded',
                                            'border',
                                            isActive
                                                ? 'border-brand-500 bg-brand-500'
                                                : 'border-neutral-300 dark:border-neutral-600'
                                        )}
                                    >
                                        {isActive && (
                                            <Check className="size-3 text-white" />
                                        )}
                                    </div>
                                    <span
                                        className={cn(
                                            'rounded px-1.5 py-0.5 text-xs font-medium',
                                            priority.color
                                        )}
                                    >
                                        {priority.label}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
