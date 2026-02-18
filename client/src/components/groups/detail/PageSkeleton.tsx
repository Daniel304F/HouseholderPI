export const PageSkeleton = () => (
    <div className="space-y-6">
        <div className="flex items-center gap-4">
            <div className="size-10 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700" />
            <div className="flex-1 space-y-2">
                <div className="h-7 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                <div className="h-5 w-64 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
            </div>
        </div>
        <div className="h-12 w-full max-w-sm animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-700" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
                <div
                    key={i}
                    className="h-72 w-full animate-pulse rounded-xl bg-neutral-200 sm:h-96 dark:bg-neutral-700"
                />
            ))}
        </div>
    </div>
)
