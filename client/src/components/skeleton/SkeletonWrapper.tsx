import type { ReactNode } from 'react'

interface SkeletonWrapperProps {
    /** Loading state */
    isLoading: boolean
    /** Content to show when not loading */
    children: ReactNode
    /** Skeleton to show while loading */
    skeleton: ReactNode
}

/**
 * Wrapper component that toggles between skeleton and content based on loading state
 */
export const SkeletonWrapper = ({
    isLoading,
    children,
    skeleton,
}: SkeletonWrapperProps) => {
    if (isLoading) {
        return <>{skeleton}</>
    }

    return <>{children}</>
}
