import { cn } from '../../utils/cn'
import { Skeleton } from '../feedback'

const cardStyles = cn(
    'flex w-full items-center gap-4 rounded-2xl p-4',
    'bg-white/85 dark:bg-neutral-900/70 backdrop-blur-sm',
    'border border-neutral-200/70 dark:border-neutral-800/70',
    'shadow-md shadow-brand-500/10'
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
