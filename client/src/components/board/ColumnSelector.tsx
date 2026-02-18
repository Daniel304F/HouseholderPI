import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../utils/cn'
import { IconButton } from '../common/IconButton'
import type { ColumnStatus } from './KanbanColumn'

interface Column {
    id: ColumnStatus
    title: string
    taskCount: number
}

interface ColumnSelectorProps {
    columns: Column[]
    activeColumn: ColumnStatus
    onColumnChange: (columnId: ColumnStatus) => void
}

const columnDotColors: Record<ColumnStatus, string> = {
    pending: 'bg-amber-400',
    'in-progress': 'bg-blue-400',
    completed: 'bg-green-400',
}

const columnActiveColors: Record<ColumnStatus, string> = {
    pending: 'bg-amber-100 dark:bg-amber-950/35',
    'in-progress': 'bg-blue-100 dark:bg-blue-950/35',
    completed: 'bg-green-100 dark:bg-green-950/35',
}

const columnCountColors: Record<ColumnStatus, string> = {
    pending:
        'bg-amber-200/80 text-amber-800 dark:bg-amber-900/45 dark:text-amber-200',
    'in-progress':
        'bg-blue-200/80 text-blue-800 dark:bg-blue-900/45 dark:text-blue-200',
    completed:
        'bg-green-200/80 text-green-800 dark:bg-green-900/45 dark:text-green-200',
}

export const ColumnSelector = ({
    columns,
    activeColumn,
    onColumnChange,
}: ColumnSelectorProps) => {
    if (columns.length === 0) {
        return null
    }

    const activeIndex = columns.findIndex((column) => column.id === activeColumn)
    const currentIndex = activeIndex >= 0 ? activeIndex : 0
    const currentColumn = columns[currentIndex]
    const canGoBack = currentIndex > 0
    const canGoForward = currentIndex < columns.length - 1

    const goToPrevious = () => {
        if (!canGoBack) return
        onColumnChange(columns[currentIndex - 1].id)
    }

    const goToNext = () => {
        if (!canGoForward) return
        onColumnChange(columns[currentIndex + 1].id)
    }

    return (
        <nav className="flex flex-col gap-2.5" aria-label="Spaltennavigation">
            <div className="flex items-center justify-between gap-2">
                <IconButton
                    icon={<ChevronLeft className="size-5" />}
                    variant="ghost"
                    size="sm"
                    onClick={goToPrevious}
                    disabled={!canGoBack}
                    aria-label="Vorherige Spalte"
                />

                <p
                    className={cn(
                        'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2',
                        'transition-colors duration-200',
                        columnActiveColors[currentColumn.id]
                    )}
                >
                    <span
                        className={cn(
                            'size-2 rounded-full shadow-[var(--shadow-sm)]',
                            columnDotColors[currentColumn.id]
                        )}
                        aria-hidden
                    />
                    <span className="font-semibold text-neutral-900 dark:text-white">
                        {currentColumn.title}
                    </span>
                    <span
                        className={cn(
                            'flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold',
                            columnCountColors[currentColumn.id]
                        )}
                    >
                        {currentColumn.taskCount}
                    </span>
                </p>

                <IconButton
                    icon={<ChevronRight className="size-5" />}
                    variant="ghost"
                    size="sm"
                    onClick={goToNext}
                    disabled={!canGoForward}
                    aria-label="Naechste Spalte"
                />
            </div>

            <div className="flex items-center justify-center gap-1.5" role="tablist">
                {columns.map((column) => (
                    <button
                        key={column.id}
                        type="button"
                        onClick={() => onColumnChange(column.id)}
                        className={cn(
                            'rounded-full transition-all duration-200',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/45',
                            'active:scale-95',
                            column.id === currentColumn.id
                                ? cn('h-2 w-7', columnDotColors[column.id])
                                : 'h-2 w-2 bg-neutral-300 hover:bg-neutral-400 dark:bg-neutral-600 dark:hover:bg-neutral-500'
                        )}
                        aria-label={column.title}
                        aria-selected={column.id === currentColumn.id}
                        aria-current={column.id === currentColumn.id ? 'true' : undefined}
                        role="tab"
                    />
                ))}
            </div>
        </nav>
    )
}
