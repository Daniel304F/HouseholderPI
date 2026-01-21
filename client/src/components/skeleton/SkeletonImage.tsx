import { cn } from '../../utils/cn'
import { Skeleton } from './Skeleton'

interface SkeletonImageProps {
    /** Width in pixels or CSS value */
    width?: number | string
    /** Height in pixels or CSS value */
    height?: number | string
    /** Additional CSS classes */
    className?: string
}

/**
 * Skeleton for images, cards, and larger rectangular areas
 */
export const SkeletonImage = ({
    width,
    height = 200,
    className,
}: SkeletonImageProps) => (
    <Skeleton
        variant="rounded"
        width={width}
        height={height}
        className={cn('w-full', className)}
    />
)
