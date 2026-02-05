import { useState, useMemo } from 'react'
import { History, Repeat, CircleDot } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Table, type ColumnDefinition, type SortDirection } from '../common'
import type { TaskWithDetails } from '../../api/tasks'

interface TaskHistoryTableProps {
    tasks: TaskWithDetails[]
    onTaskClick: (task: TaskWithDetails) => void
    maxVisible?: number
}

type SortField = 'title' | 'type' | 'group' | 'priority' | 'completedAt'

const PRIORITY_CONFIG = {
    high: {
        label: 'Hoch',
        className:
            'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400',
    },
    medium: {
        label: 'Mittel',
        className:
            'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    },
    low: {
        label: 'Niedrig',
        className:
            'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400',
    },
} as const

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }

const formatDate = (dateString: string | undefined) => {
    if (!dateString) return { date: '-', time: '' }
    const date = new Date(dateString)
    return {
        date: date.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }),
        time: date.toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit',
        }),
    }
}

const isRecurringTask = (task: TaskWithDetails): boolean => {
    return 'recurringTemplateId' in task && !!task.recurringTemplateId
}

export const TaskHistoryTable = ({
    tasks,
    onTaskClick,
    maxVisible = 20,
}: TaskHistoryTableProps) => {
    const [sortField, setSortField] = useState<SortField>('completedAt')
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

    // Sort tasks
    const sortedTasks = useMemo(() => {
        return [...tasks].sort((a, b) => {
            const direction = sortDirection === 'asc' ? 1 : -1

            switch (sortField) {
                case 'title':
                    return direction * a.title.localeCompare(b.title)
                case 'type': {
                    const aRecurring = isRecurringTask(a) ? 1 : 0
                    const bRecurring = isRecurringTask(b) ? 1 : 0
                    return direction * (aRecurring - bRecurring)
                }
                case 'group':
                    return (
                        direction *
                        (a.groupName || '').localeCompare(b.groupName || '')
                    )
                case 'priority':
                    return (
                        direction *
                        (PRIORITY_ORDER[a.priority] -
                            PRIORITY_ORDER[b.priority])
                    )
                case 'completedAt':
                default:
                    return (
                        direction *
                        (new Date(a.updatedAt).getTime() -
                            new Date(b.updatedAt).getTime())
                    )
            }
        })
    }, [tasks, sortField, sortDirection])

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
        } else {
            setSortField(field)
            setSortDirection('desc')
        }
    }

    // Column definitions
    const columns: ColumnDefinition<TaskWithDetails, SortField>[] = [
        {
            id: 'title',
            label: 'Aufgabenname',
            width: 'w-[35%]',
            sortable: true,
            render: (task) => (
                <span className="line-clamp-1 font-medium text-neutral-900 dark:text-white">
                    {task.title}
                </span>
            ),
        },
        {
            id: 'type',
            label: 'Typ',
            width: 'w-[15%]',
            sortable: true,
            render: (task) => {
                const recurring = isRecurringTask(task)
                return (
                    <span
                        className={cn(
                            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                            recurring
                                ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
                                : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400'
                        )}
                    >
                        {recurring ? (
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
                )
            },
        },
        {
            id: 'group',
            label: 'Gruppe',
            width: 'w-[20%]',
            sortable: true,
            render: (task) => (
                <span className="inline-block rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400">
                    {task.groupName || 'Unbekannt'}
                </span>
            ),
        },
        {
            id: 'priority',
            label: 'Priorität',
            width: 'w-[15%]',
            sortable: true,
            render: (task) => {
                const config = PRIORITY_CONFIG[task.priority]
                return (
                    <span
                        className={cn(
                            'inline-block rounded-full px-2.5 py-1 text-xs font-medium',
                            config.className
                        )}
                    >
                        {config.label}
                    </span>
                )
            },
        },
        {
            id: 'completedAt',
            label: 'Erledigt am',
            width: 'w-[15%]',
            sortable: true,
            render: (task) => {
                const { date, time } = formatDate(
                    task.completedAt || task.updatedAt
                )
                return (
                    <div className="text-sm">
                        <span className="text-neutral-900 dark:text-white">
                            {date}
                        </span>
                        {time && (
                            <span className="ml-1 text-neutral-500 dark:text-neutral-400">
                                {time}
                            </span>
                        )}
                    </div>
                )
            },
        },
    ]

    if (tasks.length === 0) return null

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
            <Table
                data={sortedTasks}
                columns={columns}
                keyExtractor={(task) => task.id}
                onRowClick={onTaskClick}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                maxVisible={maxVisible}
                showMoreLabel={(total) => `Alle ${total} anzeigen`}
                showLessLabel="Weniger anzeigen"
            />
        </div>
    )
}
