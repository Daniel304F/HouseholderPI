import { Skeleton } from './Skeleton'

interface SkeletonAvatarProps {
    /** Size in pixels or CSS value */
    size?: number | string
    /** Additional CSS classes */
    className?: string
}

/**
 * Circular skeleton for avatars and profile pictures
 */
export const SkeletonAvatar = ({
    size = 40,
    className,
}: SkeletonAvatarProps) => (
    <Skeleton
        variant="circular"
        width={size}
        height={size}
        className={className}
    />
)
