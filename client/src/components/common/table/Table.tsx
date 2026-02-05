import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '../../../utils/cn'
import type {
    TableProps,
    SortableHeaderProps,
    TableRowProps,
    TableCellProps,
} from './types'

// =============================================================================
// Table Component
// =============================================================================

export function Table<T, K extends string = string>({
    data,
    columns,
    keyExtractor,
    onRowClick,
    sortField,
    sortDirection = 'desc',
    onSort,
    maxVisible = 20,
    showMoreLabel = (total) => `Alle ${total} anzeigen`,
    showLessLabel = 'Weniger anzeigen',
    emptyMessage,
}: TableProps<T, K>) {
    const [showAll, setShowAll] = useState(false)

    if (data.length === 0) {
        if (emptyMessage) {
            return (
                <div className="py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
                    {emptyMessage}
                </div>
            )
        }
        return null
    }

    const displayData = showAll ? data : data.slice(0, maxVisible)
    const hasMore = data.length > maxVisible

    return (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                    <thead>
                        <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/50">
                            {columns.map((column) => (
                                <SortableHeader
                                    key={column.id}
                                    id={column.id}
                                    label={column.label}
                                    sortable={column.sortable}
                                    currentField={sortField}
                                    direction={sortDirection}
                                    onSort={onSort}
                                    className={column.width}
                                />
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                        {displayData.map((item) => (
                            <TableRow
                                key={keyExtractor(item)}
                                onClick={onRowClick ? () => onRowClick(item) : undefined}
                            >
                                {columns.map((column) => (
                                    <TableCell key={column.id}>
                                        {column.render(item)}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Show More / Show Less */}
            {hasMore && (
                <div className="border-t border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800/50">
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                    >
                        {showAll ? (
                            <>
                                <ChevronUp className="size-4" />
                                {showLessLabel}
                            </>
                        ) : (
                            <>
                                <ChevronDown className="size-4" />
                                {showMoreLabel(data.length)}
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    )
}

// =============================================================================
// SortableHeader Component
// =============================================================================

export function SortableHeader<K extends string = string>({
    id,
    label,
    sortable = true,
    currentField,
    direction,
    onSort,
    className,
}: SortableHeaderProps<K>) {
    const isActive = currentField === id

    if (!sortable || !onSort) {
        return (
            <th className={cn('px-4 py-3 text-left', className)}>
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    {label}
                </span>
            </th>
        )
    }

    return (
        <th className={cn('px-4 py-3 text-left', className)}>
            <button
                onClick={() => onSort(id)}
                className={cn(
                    'flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors',
                    isActive
                        ? 'text-brand-600 dark:text-brand-400'
                        : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
                )}
            >
                {label}
                {isActive && (
                    <span className="text-brand-500">
                        {direction === 'asc' ? (
                            <ChevronUp className="size-3.5" />
                        ) : (
                            <ChevronDown className="size-3.5" />
                        )}
                    </span>
                )}
            </button>
        </th>
    )
}

// =============================================================================
// TableRow Component
// =============================================================================

export const TableRow = ({ onClick, children, className }: TableRowProps) => {
    return (
        <tr
            onClick={onClick}
            className={cn(
                'transition-colors',
                onClick && 'cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700/50',
                className
            )}
        >
            {children}
        </tr>
    )
}

// =============================================================================
// TableCell Component
// =============================================================================

export const TableCell = ({ children, className }: TableCellProps) => {
    return <td className={cn('px-4 py-3', className)}>{children}</td>
}
