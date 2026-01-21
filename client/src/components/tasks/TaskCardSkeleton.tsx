import { cn } from '../../utils/cn'

interface TaskCardSkeletonProps {
    count?: number
}

export const TaskCardSkeleton = ({ count = 1 }: TaskCardSkeletonProps) => {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className={cn(
                        'flex items-start gap-4 p-4',
                        'rounded-xl border',
                        'bg-white dark:bg-neutral-800',
                        'border-neutral-200 dark:border-neutral-700',
                        'animate-pulse'
                    )}
                >
                    {/* Status Icon Skeleton */}
                    <div className="size-5 rounded-full bg-neutral-200 dark:bg-neutral-700" />

                    {/* Content */}
                    <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                            <div className="h-5 w-48 rounded bg-neutral-200 dark:bg-neutral-700" />
                            <div className="h-5 w-16 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                        </div>

                        <div className="h-4 w-3/4 rounded bg-neutral-200 dark:bg-neutral-700" />

                        <div className="flex gap-4">
                            <div className="h-4 w-24 rounded bg-neutral-200 dark:bg-neutral-700" />
                            <div className="h-4 w-20 rounded bg-neutral-200 dark:bg-neutral-700" />
                        </div>
                    </div>
                </div>
            ))}
        </>
    )
}
