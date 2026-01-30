import { cn } from '../../utils/cn'

interface PasswordStrengthMeterProps {
    strength: number // 0-5
    className?: string
}

const strengthConfig = {
    colors: [
        'bg-neutral-300 dark:bg-neutral-600',
        'bg-error-500',
        'bg-error-500',
        'bg-warning-500',
        'bg-info-500',
        'bg-success-500',
    ],
    labels: ['', 'Schwach', 'Schwach', 'Mittel', 'Gut', 'Stark'],
    labelColors: [
        'text-neutral-500',
        'text-error-500',
        'text-error-500',
        'text-warning-600 dark:text-warning-400',
        'text-info-600 dark:text-info-400',
        'text-success-600 dark:text-success-400',
    ],
} as const

export const PasswordStrengthMeter = ({
    strength,
    className,
}: PasswordStrengthMeterProps) => {
    if (strength === 0) return null

    const colorIndex = Math.min(strength, 5)
    const color = strengthConfig.colors[colorIndex]
    const label = strengthConfig.labels[colorIndex]
    const labelColor = strengthConfig.labelColors[colorIndex]

    return (
        <div className={cn('space-y-2 pt-1', className)}>
            <div className="flex items-center gap-2">
                <div className="flex flex-1 gap-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div
                            key={index}
                            className={cn(
                                'h-1.5 flex-1 rounded-full transition-all duration-300',
                                index < strength
                                    ? color
                                    : 'bg-neutral-200 dark:bg-neutral-700'
                            )}
                        />
                    ))}
                </div>
                <span className={cn('text-xs font-medium', labelColor)}>
                    {label}
                </span>
            </div>
        </div>
    )
}
