interface PageHeaderSkeletonProps {
    showBadge?: boolean
}

export const PageHeaderSkeleton = ({
    showBadge = false,
}: PageHeaderSkeletonProps) => (
    <div className="flex items-center justify-between">
        <div>
            <div className="h-8 w-48 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700" />
            <div className="mt-2 h-5 w-64 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
        </div>
        {showBadge && (
            <div className="h-10 w-32 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-700" />
        )}
    </div>
)

interface StatCardsSkeletonProps {
    count?: number
}

export const StatCardsSkeleton = ({ count = 4 }: StatCardsSkeletonProps) => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(count)].map((_, i) => (
            <div
                key={i}
                className="h-32 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-700"
            />
        ))}
    </div>
)

export const TaskCardSkeleton = () => (
    <div className="animate-pulse rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
        <div className="flex items-start gap-4">
            <div className="size-5 rounded-full bg-neutral-200 dark:bg-neutral-700" />
            <div className="flex-1 space-y-2">
                <div className="h-5 w-3/4 rounded bg-neutral-200 dark:bg-neutral-700" />
                <div className="h-4 w-1/2 rounded bg-neutral-200 dark:bg-neutral-700" />
                <div className="flex gap-3">
                    <div className="h-3 w-20 rounded bg-neutral-200 dark:bg-neutral-700" />
                    <div className="h-3 w-16 rounded bg-neutral-200 dark:bg-neutral-700" />
                </div>
            </div>
        </div>
    </div>
)

interface TaskCardsSkeletonProps {
    count?: number
}

export const TaskCardsSkeleton = ({ count = 3 }: TaskCardsSkeletonProps) => (
    <div className="space-y-4">
        {[...Array(count)].map((_, i) => (
            <TaskCardSkeleton key={i} />
        ))}
    </div>
)

export const ChartSkeleton = () => (
    <div className="h-56 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-700" />
)

interface StatsPageSkeletonProps {
    showBadge?: boolean
}

export const StatsPageSkeleton = ({
    showBadge = false,
}: StatsPageSkeletonProps) => (
    <div className="space-y-6">
        <PageHeaderSkeleton showBadge={showBadge} />
        <StatCardsSkeleton />
    </div>
)
