import { cn } from '../../utils/cn'

interface ProgressRingProps {
    value: number // 0-100
    size?: number
    strokeWidth?: number
    color?: string
    backgroundColor?: string
    showValue?: boolean
    label?: string
    className?: string
}

export const ProgressRing = ({
    value,
    size = 120,
    strokeWidth = 10,
    color,
    showValue = true,
    label,
    className,
}: ProgressRingProps) => {
    const normalizedValue = Math.min(Math.max(value, 0), 100)
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (normalizedValue / 100) * circumference
    const center = size / 2

    // Dynamic color based on value if not provided
    const getColor = () => {
        if (color) return color
        if (normalizedValue >= 75) return 'var(--color-success-500)'
        if (normalizedValue >= 50) return 'var(--color-brand-500)'
        if (normalizedValue >= 25) return 'var(--color-warning-500)'
        return 'var(--color-error-500)'
    }

    const ringColor = getColor()

    return (
        <div
            className={cn(
                'relative inline-flex items-center justify-center',
                className
            )}
            style={{ width: size, height: size }}
        >

            <svg width={size} height={size} className="relative -rotate-90">
                {/* Background circle */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    className="stroke-neutral-200/80 dark:stroke-neutral-700/60"
                    strokeWidth={strokeWidth}
                />
                {/* Progress circle */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={ringColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                />
            </svg>

            {showValue && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                        className="text-2xl font-bold transition-colors duration-500"
                        style={{ color: ringColor }}
                    >
                        {Math.round(normalizedValue)}%
                    </span>
                    {label && (
                        <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                            {label}
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}
