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
    pending: 'bg-amber-100/85 dark:bg-amber-950/45',
    'in-progress': 'bg-blue-100/85 dark:bg-blue-950/45',
    completed: 'bg-green-100/85 dark:bg-green-950/45',
}

const columnCountColors: Record<ColumnStatus, string> = {
    pending:
        'bg-amber-200/90 text-amber-800 dark:bg-amber-900/55 dark:text-amber-200',
    'in-progress':
        'bg-blue-200/90 text-blue-800 dark:bg-blue-900/55 dark:text-blue-200',
    completed:
        'bg-green-200/90 text-green-800 dark:bg-green-900/55 dark:text-green-200',
}

const columnTabActiveColors: Record<ColumnStatus, string> = {
    pending:
        'bg-amber-100 text-amber-900 ring-1 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-100 dark:ring-amber-800/70',
    'in-progress':
        'bg-blue-100 text-blue-900 ring-1 ring-blue-200 dark:bg-blue-950/50 dark:text-blue-100 dark:ring-blue-800/70',
    completed:
        'bg-green-100 text-green-900 ring-1 ring-green-200 dark:bg-green-950/50 dark:text-green-100 dark:ring-green-800/70',
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
        <nav
            className="space-y-2 rounded-xl border border-neutral-200/70 bg-white/60 p-2 backdrop-blur-sm dark:border-neutral-700/70 dark:bg-neutral-900/35"
            aria-label="Spaltennavigation"
        >
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
                        'flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm',
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

            <div
                className="hide-scrollbar flex items-center gap-1.5 overflow-x-auto pb-0.5"
                role="tablist"
            >
                {columns.map((column) => (
                    <button
                        key={column.id}
                        type="button"
                        onClick={() => onColumnChange(column.id)}
                        className={cn(
                            'flex min-w-[7.5rem] flex-1 items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold',
                            'transition-all duration-200',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/45',
                            'active:scale-[0.98]',
                            column.id === currentColumn.id
                                ? columnTabActiveColors[column.id]
                                : 'bg-white/70 text-neutral-600 hover:bg-white dark:bg-neutral-800/50 dark:text-neutral-400 dark:hover:bg-neutral-800'
                        )}
                        aria-label={column.title}
                        aria-selected={column.id === currentColumn.id}
                        role="tab"
                    >
                        <span className="inline-flex items-center gap-1.5">
                            <span
                                className={cn(
                                    'size-1.5 rounded-full',
                                    columnDotColors[column.id]
                                )}
                                aria-hidden
                            />
                            <span>{column.title}</span>
                        </span>
                        <span className="text-[11px] opacity-80">
                            {column.taskCount}
                        </span>
                    </button>
                ))}
            </div>
        </nav>
    )
}
