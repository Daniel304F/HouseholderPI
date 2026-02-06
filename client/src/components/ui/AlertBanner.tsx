import { cn } from '../../utils/cn'

export interface AlertBannerProps {
    message: string
    variant?: 'error' | 'warning' | 'info' | 'success'
    className?: string
}

const variantStyles: Record<NonNullable<AlertBannerProps['variant']>, string> = {
    error: cn(
        'border-error-200 bg-error-50 text-error-600',
        'dark:border-error-800 dark:bg-error-950 dark:text-error-400'
    ),
    warning: cn(
        'border-warning-200 bg-warning-50 text-warning-600',
        'dark:border-warning-800 dark:bg-warning-950 dark:text-warning-400'
    ),
    info: cn(
        'border-info-200 bg-info-50 text-info-600',
        'dark:border-info-800 dark:bg-info-950 dark:text-info-400'
    ),
    success: cn(
        'border-success-200 bg-success-50 text-success-600',
        'dark:border-success-800 dark:bg-success-950 dark:text-success-400'
    ),
}

export const AlertBanner = ({
    message,
    variant = 'error',
    className,
}: AlertBannerProps) => {
    return (
        <div
            role="alert"
            className={cn(
                'rounded-lg border p-3 text-sm',
                variantStyles[variant],
                className
            )}
        >
            {message}
        </div>
    )
}
