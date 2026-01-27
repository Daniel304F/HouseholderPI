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
    strokeWidth = 12,
    color = 'hsl(var(--primary))',
    backgroundColor = 'hsl(var(--muted))',
    showValue = true,
    label,
    className,
}: ProgressRingProps) => {
    const normalizedValue = Math.min(Math.max(value, 0), 100)
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (normalizedValue / 100) * circumference
    const center = size / 2

    return (
        <div
            className={cn(
                'relative inline-flex items-center justify-center',
                className
            )}
            style={{ width: size, height: size }}
        >
            <svg width={size} height={size} className="-rotate-90">
                {/* Background circle */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={backgroundColor}
                    strokeWidth={strokeWidth}
                />
                {/* Progress circle */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                />
            </svg>
            {showValue && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-foreground text-xl font-bold">
                        {Math.round(normalizedValue)}%
                    </span>
                    {label && (
                        <span className="text-muted-foreground text-xs">
                            {label}
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}
