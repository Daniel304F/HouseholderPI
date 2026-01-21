import { cn } from '../../utils/cn'

// ============================================================================
// Types & Styles
// ============================================================================

export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded'
export type SkeletonAnimation = 'pulse' | 'shimmer' | 'none'

export interface SkeletonProps {
    /** Width of the skeleton (CSS value or Tailwind class) */
    width?: string | number
    /** Height of the skeleton (CSS value or Tailwind class) */
    height?: string | number
    /** Shape variant */
    variant?: SkeletonVariant
    /** Animation type */
    animation?: SkeletonAnimation
    /** Additional CSS classes */
    className?: string
    /** Number of skeleton items to render */
    count?: number
    /** Gap between multiple skeletons */
    gap?: string
}

export const variantStyles: Record<SkeletonVariant, string> = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-xl',
}

export const animationStyles: Record<SkeletonAnimation, string> = {
    pulse: 'animate-pulse',
    shimmer:
        'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
    none: '',
}

// ============================================================================
// Base Skeleton Component
// ============================================================================

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
