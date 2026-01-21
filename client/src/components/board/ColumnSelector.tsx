import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../utils/cn'
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

const columnColors: Record<ColumnStatus, string> = {
    pending: 'bg-amber-400',
    'in-progress': 'bg-blue-400',
    completed: 'bg-green-400',
}

const columnActiveColors: Record<ColumnStatus, string> = {
    pending: 'bg-amber-100 dark:bg-amber-900/30',
    'in-progress': 'bg-blue-100 dark:bg-blue-900/30',
    completed: 'bg-green-100 dark:bg-green-900/30',
}

export const ColumnSelector = ({
    columns,
    activeColumn,
    onColumnChange,
}: ColumnSelectorProps) => {
    const currentIndex = columns.findIndex((c) => c.id === activeColumn)
    const currentColumn = columns[currentIndex]

    const goToPrevious = () => {
        if (currentIndex > 0) {
            onColumnChange(columns[currentIndex - 1].id)
        }
    }

    const goToNext = () => {
        if (currentIndex < columns.length - 1) {
            onColumnChange(columns[currentIndex + 1].id)
        }
    }

    return (
        <div className="flex flex-col gap-2">
            {/* Column Navigation with Arrows */}
            <div className="flex items-center justify-between gap-2">
                <button
                    onClick={goToPrevious}
                    disabled={currentIndex === 0}
                    className={cn(
                        'rounded-lg p-2 transition-colors',
                        'text-neutral-600 dark:text-neutral-400',
                        'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                        'disabled:cursor-not-allowed disabled:opacity-30'
                    )}
                    aria-label="Vorherige Spalte"
                >
                    <ChevronLeft className="size-5" />
                </button>

                {/* Current Column Info */}
                <div
                    className={cn(
                        'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2',
                        columnActiveColors[activeColumn]
                    )}
                >
                    <div
                        className={cn(
                            'size-2 rounded-full',
                            columnColors[activeColumn]
                        )}
                    />
                    <span className="font-semibold text-neutral-900 dark:text-white">
                        {currentColumn?.title}
                    </span>
                    <span
                        className={cn(
                            'flex size-5 items-center justify-center rounded-full text-xs font-medium',
                            'bg-white/60 dark:bg-neutral-800/60',
                            'text-neutral-600 dark:text-neutral-400'
                        )}
                    >
                        {currentColumn?.taskCount}
                    </span>
                </div>

                <button
                    onClick={goToNext}
                    disabled={currentIndex === columns.length - 1}
                    className={cn(
                        'rounded-lg p-2 transition-colors',
                        'text-neutral-600 dark:text-neutral-400',
                        'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                        'disabled:cursor-not-allowed disabled:opacity-30'
                    )}
                    aria-label="Nächste Spalte"
                >
                    <ChevronRight className="size-5" />
                </button>
            </div>

            {/* Column Dots/Pills Indicator */}
            <div className="flex items-center justify-center gap-1">
                {columns.map((column) => (
                    <button
                        key={column.id}
                        onClick={() => onColumnChange(column.id)}
                        className={cn(
                            'h-1.5 rounded-full transition-all duration-200',
                            column.id === activeColumn
                                ? cn('w-6', columnColors[column.id])
                                : 'w-1.5 bg-neutral-300 hover:bg-neutral-400 dark:bg-neutral-600 dark:hover:bg-neutral-500'
                        )}
                        aria-label={column.title}
                    />
                ))}
            </div>
        </div>
    )
}
