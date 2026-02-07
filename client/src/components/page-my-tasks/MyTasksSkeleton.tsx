import { PageHeaderSkeleton, Skeleton, StatCardsSkeleton } from '../feedback'

export const MyTasksSkeleton = () => {
    return (
        <div className="space-y-6">
            <PageHeaderSkeleton />
            <StatCardsSkeleton count={4} />
            <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} height={96} className="rounded-xl" />
                ))}
            </div>
        </div>
    )
}
