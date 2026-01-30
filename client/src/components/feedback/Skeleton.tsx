import { cn } from '../../utils/cn'

export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded'
export type SkeletonAnimation = 'pulse' | 'shimmer' | 'none'

export interface SkeletonProps {
    width?: string | number
    height?: string | number
    variant?: SkeletonVariant
    animation?: SkeletonAnimation
    className?: string
    count?: number
    gap?: string
}

const variantStyles: Record<SkeletonVariant, string> = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-xl',
}

const animationStyles: Record<SkeletonAnimation, string> = {
    pulse: 'animate-pulse',
    shimmer: cn(
        'relative overflow-hidden',
        'before:absolute before:inset-0 before:-translate-x-full',
        'before:animate-[shimmer_1.5s_infinite]',
        'before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent'
    ),
    none: '',
}

export const Skeleton = ({
    width,
    height,
    variant = 'text',
    animation = 'pulse',
    className,
    count = 1,
    gap = 'gap-2',
}: SkeletonProps) => {
    const baseStyles = cn(
        'bg-neutral-200 dark:bg-neutral-700',
        variantStyles[variant],
        animationStyles[animation]
    )

    const style = {
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
    }

    const skeletonElement = (key?: number) => (
        <div
            key={key}
            className={cn(baseStyles, className)}
            style={style}
            aria-hidden="true"
        />
    )

    if (count > 1) {
        return (
            <div className={cn('flex flex-col', gap)}>
                {Array.from({ length: count }, (_, i) => skeletonElement(i))}
            </div>
        )
    }

    return skeletonElement()
}

/**
 * Pre-built skeleton compositions for common use cases
 */
export const SkeletonAvatar = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClasses = { sm: 'size-8', md: 'size-10', lg: 'size-12' }
    return <Skeleton variant="circular" className={sizeClasses[size]} />
}

export const SkeletonText = ({
    lines = 1,
    widths = ['100%'],
}: {
    lines?: number
    widths?: string[]
}) => (
    <div className="space-y-2">
        {Array.from({ length: lines }, (_, i) => (
            <Skeleton
                key={i}
                height={16}
                width={widths[i % widths.length]}
                className="rounded"
            />
        ))}
    </div>
)

export const SkeletonButton = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClasses = {
        sm: 'h-8 w-20',
        md: 'h-10 w-24',
        lg: 'h-12 w-32',
    }
    return <Skeleton variant="rounded" className={sizeClasses[size]} />
}

export const SkeletonCard = () => (
    <div className="animate-pulse rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
        <div className="flex items-start gap-4">
            <SkeletonAvatar />
            <div className="flex-1 space-y-2">
                <Skeleton height={20} width="75%" />
                <Skeleton height={16} width="50%" />
            </div>
        </div>
    </div>
)

/**
 * Page-level skeleton compositions
 */
export const PageHeaderSkeleton = ({ showBadge = false }: { showBadge?: boolean }) => (
    <div className="flex items-center justify-between">
        <div>
            <Skeleton height={32} width={192} className="rounded-lg" />
            <Skeleton height={20} width={256} className="mt-2 rounded" />
        </div>
        {showBadge && <Skeleton height={40} width={128} className="rounded-xl" />}
    </div>
)

export const StatCardsSkeleton = ({ count = 4 }: { count?: number }) => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: count }, (_, i) => (
            <Skeleton key={i} height={128} className="rounded-xl" />
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

export const ChartSkeleton = () => (
    <Skeleton height={224} className="rounded-xl" />
)
