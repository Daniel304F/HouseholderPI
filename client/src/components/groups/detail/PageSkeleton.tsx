export const PageSkeleton = () => (
    <div className="space-y-6">
        <div className="flex items-center gap-4">
            <div className="size-10 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700" />
            <div className="flex-1 space-y-2">
                <div className="h-7 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                <div className="h-5 w-64 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
            </div>
        </div>
        <div className="h-12 w-80 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-700" />
        <div className="flex gap-4">
            {[1, 2, 3].map((i) => (
                <div
                    key={i}
                    className="h-96 w-72 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-700"
                />
            ))}
        </div>
    </div>
)
