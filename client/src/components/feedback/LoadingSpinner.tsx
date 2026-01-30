import { Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl'
    className?: string
    label?: string
    fullScreen?: boolean
}

const sizeStyles = {
    sm: 'size-4',
    md: 'size-6',
    lg: 'size-8',
    xl: 'size-12',
}

export const LoadingSpinner = ({
    size = 'md',
    className,
    label,
    fullScreen = false,
}: LoadingSpinnerProps) => {
    const spinner = (
        <div className={cn('flex flex-col items-center gap-2', className)}>
            <Loader2
                className={cn(
                    'animate-spin text-brand-500',
                    sizeStyles[size]
                )}
            />
            {label && (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {label}
                </p>
            )}
        </div>
    )

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-neutral-900/80">
                {spinner}
            </div>
        )
    }

    return spinner
}

/**
 * Loading overlay for containers
 */
interface LoadingOverlayProps {
    isLoading: boolean
    children: React.ReactNode
    label?: string
    className?: string
}

export const LoadingOverlay = ({
    isLoading,
    children,
    label,
    className,
}: LoadingOverlayProps) => {
    return (
        <div className={cn('relative', className)}>
            {children}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/80 backdrop-blur-sm dark:bg-neutral-900/80">
                    <LoadingSpinner size="lg" label={label} />
                </div>
            )}
        </div>
    )
}

/**
 * Full-page loading state
 */
export const PageLoader = ({ label = 'Laden...' }: { label?: string }) => (
    <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner size="xl" label={label} />
    </div>
)
