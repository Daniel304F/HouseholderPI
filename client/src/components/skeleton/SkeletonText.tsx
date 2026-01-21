import { cn } from '../../utils/cn'
import { Skeleton } from './Skeleton'

interface SkeletonTextProps {
    /** Number of text lines to render */
    lines?: number
    /** Additional CSS classes */
    className?: string
}

/**
 * Skeleton for text content with multiple lines
 * Last line is shorter for realistic appearance
 */
export const SkeletonText = ({ lines = 1, className }: SkeletonTextProps) => (
    <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }, (_, i) => (
            <Skeleton
                key={i}
                variant="text"
                height={16}
                className={cn('h-4', i === lines - 1 && lines > 1 && 'w-3/4')}
            />
        ))}
    </div>
)
