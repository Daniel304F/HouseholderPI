import { PageHeaderSkeleton, Skeleton, StatCardsSkeleton } from '../feedback'

export const TaskHistorySkeleton = () => {
    return (
        <div className="space-y-6">
            <PageHeaderSkeleton />
            <StatCardsSkeleton count={4} />
            <Skeleton height={384} className="rounded-xl" />
        </div>
    )
}
