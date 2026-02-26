import { cn } from '../../utils/cn'
import { Skeleton } from '../feedback'

interface GroupCardSkeletonProps {
    count?: number
}

export const GroupCardSkeleton = ({ count = 1 }: GroupCardSkeletonProps) => {
    const skeletonCard = (key?: number) => (
        <div
            key={key}
            aria-hidden="true"
            className={cn(
                'flex flex-col overflow-hidden rounded-3xl',
                'bg-white/85 dark:bg-neutral-900/70 backdrop-blur-sm',
                'border border-neutral-200/70 dark:border-neutral-800/70',
                'shadow-[0_3px_18px_-4px_hsl(149,58%,50%,0.07),0_1px_3px_0_rgb(0_0_0_/0.04)]'
            )}
        >
            {/* Image area skeleton */}
            <Skeleton className="h-44 w-full rounded-none" />

            {/* Content skeleton */}
            <div className="flex flex-col gap-3 p-5">
                <div className="space-y-2">
                    <Skeleton variant="text" className="h-5 w-3/4" />
                    <Skeleton variant="text" className="h-4 w-1/2" />
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-neutral-100/80 pt-3 dark:border-neutral-700/50">
                    <Skeleton variant="text" className="h-3 w-20" />
                    <Skeleton variant="rounded" className="size-7 rounded-full" />
                </div>
            </div>
        </div>
    )

    if (count > 1) {
        return <>{Array.from({ length: count }, (_, i) => skeletonCard(i))}</>
    }

    return skeletonCard()
}
