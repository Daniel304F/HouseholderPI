import { Circle, Clock } from 'lucide-react'
import type { SortOption, StatusFilter } from '../../constants/myTasks.constants'

export const STATUS_FILTERS: {
    value: StatusFilter
    label: string
    icon: typeof Circle
}[] = [
    { value: 'pending', label: 'Offen', icon: Circle },
    { value: 'in-progress', label: 'In Bearbeitung', icon: Clock },
]

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: 'dueDate', label: 'Faelligkeit' },
    { value: 'priority', label: 'Prioritaet' },
    { value: 'status', label: 'Status' },
    { value: 'groupName', label: 'Gruppe' },
]
