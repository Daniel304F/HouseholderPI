import { cn } from '../../utils/cn'
import { Skeleton } from '../skeleton'

const cardStyles = cn(
    'flex w-full items-center gap-4',
    'p-4 rounded-xl',
    'bg-white dark:bg-neutral-800',
    'border border-neutral-200 dark:border-neutral-700'
)

interface GroupCardSkeletonProps {
    /** Number of skeleton cards to render */
    count?: number
}

export const GroupCardSkeleton = ({ count = 1 }: GroupCardSkeletonProps) => {
    const skeletonCard = (key?: number) => (
        <div key={key} className={cardStyles} aria-hidden="true">
            {/* Avatar Skeleton */}
            <Skeleton variant="rounded" className="size-14 shrink-0" />

            {/* Text Content Skeleton */}
            <div className="min-w-0 flex-1 space-y-2">
                <Skeleton variant="text" className="h-5 w-3/4" />
                <Skeleton variant="text" className="h-4 w-1/2" />
            </div>

            {/* Badge Skeleton */}
            <Skeleton variant="rounded" className="h-6 w-16 rounded-full" />
        </div>
    )

    if (count > 1) {
        return <>{Array.from({ length: count }, (_, i) => skeletonCard(i))}</>
    }

    return skeletonCard()
}
