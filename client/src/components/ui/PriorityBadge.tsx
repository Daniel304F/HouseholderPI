import { cn } from '../../utils/cn'
import {
    PRIORITY_STYLES,
    PRIORITY_LABELS,
    type TaskPriority,
} from '../../constants/task.constants'

interface PriorityBadgeProps {
    priority: TaskPriority
    size?: 'sm' | 'md'
    className?: string
}

export const PriorityBadge = ({
    priority,
    size = 'md',
    className,
}: PriorityBadgeProps) => {
    return (
        <span
            className={cn(
                'shrink-0 rounded-full font-medium',
                size === 'sm'
                    ? 'px-1.5 py-0.5 text-[10px]'
                    : 'px-2 py-0.5 text-xs',
                PRIORITY_STYLES[priority],
                className
            )}
        >
            {PRIORITY_LABELS[priority]}
        </span>
    )
}
