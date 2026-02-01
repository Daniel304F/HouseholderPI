import { useState } from 'react'
import { History, ChevronDown, ChevronUp, Repeat, CircleDot } from 'lucide-react'
import { cn } from '../../utils/cn'
import type { TaskWithDetails } from '../../api/tasks'

// =============================================================================
// Types
// =============================================================================

interface TaskHistoryTableProps {
    tasks: TaskWithDetails[]
    onTaskClick: (task: TaskWithDetails) => void
    maxVisible?: number
}

type SortField = 'title' | 'type' | 'group' | 'priority' | 'completedAt'
type SortDirection = 'asc' | 'desc'

// =============================================================================
// Constants
// =============================================================================

const PRIORITY_CONFIG = {
    high: {
        label: 'Hoch',
        className: 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400',
    },
    medium: {
        label: 'Mittel',
        className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    },
    low: {
        label: 'Niedrig',
        className: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400',
    },
} as const

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }

// =============================================================================
// Component
// =============================================================================

export const TaskHistoryTable = ({
    tasks,
    onTaskClick,
    maxVisible = 20,
}: TaskHistoryTableProps) => {
    const [sortField, setSortField] = useState<SortField>('completedAt')
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
    const [showAll, setShowAll] = useState(false)

    if (tasks.length === 0) return null

    // Sort tasks
    const sortedTasks = [...tasks].sort((a, b) => {
        const direction = sortDirection === 'asc' ? 1 : -1

        switch (sortField) {
            case 'title':
                return direction * a.title.localeCompare(b.title)
            case 'type': {
                const aRecurring = 'recurringTemplateId' in a && a.recurringTemplateId ? 1 : 0
                const bRecurring = 'recurringTemplateId' in b && b.recurringTemplateId ? 1 : 0
                return direction * (aRecurring - bRecurring)
            }
            case 'group':
                return direction * (a.groupName || '').localeCompare(b.groupName || '')
            case 'priority':
                return direction * (PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
            case 'completedAt':
            default:
                return direction * (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())
        }
    })

    const displayTasks = showAll ? sortedTasks : sortedTasks.slice(0, maxVisible)
    const hasMore = tasks.length > maxVisible

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
        } else {
            setSortField(field)
            setSortDirection('desc')
        }
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
                <History className="size-5 text-neutral-500 dark:text-neutral-400" />
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    Historie
                </h2>
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400">
                    {tasks.length}
                </span>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px]">
                        <thead>
                            <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/50">
                                <SortableHeader
                                    field="title"
                                    label="Aufgabenname"
                                    currentField={sortField}
                                    direction={sortDirection}
                                    onSort={handleSort}
                                    className="w-[35%]"
                                />
                                <SortableHeader
                                    field="type"
                                    label="Typ"
                                    currentField={sortField}
                                    direction={sortDirection}
                                    onSort={handleSort}
                                    className="w-[15%]"
                                />
                                <SortableHeader
                                    field="group"
                                    label="Gruppe"
                                    currentField={sortField}
                                    direction={sortDirection}
                                    onSort={handleSort}
                                    className="w-[20%]"
                                />
                                <SortableHeader
                                    field="priority"
                                    label="Priorität"
                                    currentField={sortField}
                                    direction={sortDirection}
                                    onSort={handleSort}
                                    className="w-[15%]"
                                />
                                <SortableHeader
                                    field="completedAt"
                                    label="Erledigt am"
                                    currentField={sortField}
                                    direction={sortDirection}
                                    onSort={handleSort}
                                    className="w-[15%]"
                                />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                            {displayTasks.map((task) => (
                                <TaskRow key={task.id} task={task} onClick={() => onTaskClick(task)} />
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
                                    Weniger anzeigen
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="size-4" />
                                    Alle {tasks.length} anzeigen
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

// =============================================================================
// Sub-components
// =============================================================================

interface SortableHeaderProps {
    field: SortField
    label: string
    currentField: SortField
    direction: SortDirection
    onSort: (field: SortField) => void
    className?: string
}

const SortableHeader = ({
    field,
    label,
    currentField,
    direction,
    onSort,
    className,
}: SortableHeaderProps) => {
    const isActive = currentField === field

    return (
        <th className={cn('px-4 py-3 text-left', className)}>
            <button
                onClick={() => onSort(field)}
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

interface TaskRowProps {
    task: TaskWithDetails
    onClick: () => void
}

const TaskRow = ({ task, onClick }: TaskRowProps) => {
    const isRecurring = 'recurringTemplateId' in task && task.recurringTemplateId
    const completedDate = task.completedAt || task.updatedAt

    const formattedDate = completedDate
        ? new Date(completedDate).toLocaleDateString('de-DE', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
          })
        : '-'

    const formattedTime = completedDate
        ? new Date(completedDate).toLocaleTimeString('de-DE', {
              hour: '2-digit',
              minute: '2-digit',
          })
        : ''

    const priorityConfig = PRIORITY_CONFIG[task.priority]

    return (
        <tr
            onClick={onClick}
            className="cursor-pointer transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
        >
            {/* Task Name */}
            <td className="px-4 py-3">
                <span className="font-medium text-neutral-900 dark:text-white line-clamp-1">
                    {task.title}
                </span>
            </td>

            {/* Type */}
            <td className="px-4 py-3">
                <span
                    className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                        isRecurring
                            ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
                            : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400'
                    )}
                >
                    {isRecurring ? (
                        <>
                            <Repeat className="size-3" />
                            Wiederkehrend
                        </>
                    ) : (
                        <>
                            <CircleDot className="size-3" />
                            Einmalig
                        </>
                    )}
                </span>
            </td>

            {/* Group */}
            <td className="px-4 py-3">
                <span className="inline-block rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400">
                    {task.groupName || 'Unbekannt'}
                </span>
            </td>

            {/* Priority */}
            <td className="px-4 py-3">
                <span
                    className={cn(
                        'inline-block rounded-full px-2.5 py-1 text-xs font-medium',
                        priorityConfig.className
                    )}
                >
                    {priorityConfig.label}
                </span>
            </td>

            {/* Completed At */}
            <td className="px-4 py-3">
                <div className="text-sm">
                    <span className="text-neutral-900 dark:text-white">{formattedDate}</span>
                    {formattedTime && (
                        <span className="ml-1 text-neutral-500 dark:text-neutral-400">
                            {formattedTime}
                        </span>
                    )}
                </div>
            </td>
        </tr>
    )
}
