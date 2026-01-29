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
                'inline-flex shrink-0 items-center rounded-full font-semibold',
                'border border-current/20',
                'transition-all duration-200',
                'hover:scale-105 hover:shadow-sm',
                size === 'sm'
                    ? 'gap-1 px-2 py-0.5 text-[10px]'
                    : 'gap-1.5 px-2.5 py-1 text-xs',
                PRIORITY_STYLES[priority],
                className
            )}
        >
            <span
                className={cn(
                    'rounded-full bg-current',
                    size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2'
                )}
            />
            {PRIORITY_LABELS[priority]}
        </span>
    )
}
