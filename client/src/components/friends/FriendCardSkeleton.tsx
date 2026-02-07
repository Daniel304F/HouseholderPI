import { cn } from '../../utils/cn'

interface FriendCardSkeletonProps {
    count?: number
}

export const FriendCardSkeleton = ({ count = 1 }: FriendCardSkeletonProps) => {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className={cn(
                        'flex items-center gap-4 rounded-xl p-4',
                        'border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800'
                    )}
                >
                    <div className="size-12 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700" />
                    <div className="flex-1 space-y-2">
                        <div className="h-5 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                        <div className="h-4 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                    </div>
                </div>
            ))}
        </>
    )
}
