import { cn } from '../../utils/cn'
import { Skeleton } from './Skeleton'

interface SkeletonButtonProps {
    /** Width in pixels or CSS value */
    width?: number | string
    /** Height in pixels or CSS value */
    height?: number | string
    /** Additional CSS classes */
    className?: string
}

/**
 * Skeleton for buttons with rounded corners
 */
export const SkeletonButton = ({
    width = 100,
    height = 40,
    className,
}: SkeletonButtonProps) => (
    <Skeleton
        variant="rounded"
        width={width}
        height={height}
        className={cn('rounded-lg', className)}
    />
)
