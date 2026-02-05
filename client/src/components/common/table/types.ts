import type { ReactNode } from 'react'

export type SortDirection = 'asc' | 'desc'

export interface ColumnDefinition<T, K extends string = string> {
    id: K
    label: string
    width?: string
    sortable?: boolean
    render: (item: T) => ReactNode
}

export interface TableProps<T, K extends string = string> {
    data: T[]
    columns: ColumnDefinition<T, K>[]
    keyExtractor: (item: T) => string
    onRowClick?: (item: T) => void
    sortField?: K
    sortDirection?: SortDirection
    onSort?: (field: K) => void
    maxVisible?: number
    showMoreLabel?: (total: number) => string
    showLessLabel?: string
    emptyMessage?: string
}

export interface SortableHeaderProps<K extends string = string> {
    id: K
    label: string
    sortable?: boolean
    currentField?: K
    direction?: SortDirection
    onSort?: (field: K) => void
    className?: string
}

export interface TableRowProps {
    onClick?: () => void
    children: ReactNode
    className?: string
}

export interface TableCellProps {
    children: ReactNode
    className?: string
}
