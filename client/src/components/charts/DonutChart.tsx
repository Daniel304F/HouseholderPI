import { cn } from '../../utils/cn'

export interface DonutChartSegment {
    label: string
    value: number
    color: string
}

interface DonutChartProps {
    data: DonutChartSegment[]
    size?: number
    strokeWidth?: number
    showLegend?: boolean
    showTotal?: boolean
    totalLabel?: string
    className?: string
}

export const DonutChart = ({
    data,
    size = 160,
    strokeWidth = 24,
    showLegend = true,
    showTotal = true,
    totalLabel = 'Gesamt',
    className,
}: DonutChartProps) => {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const center = size / 2

    let currentOffset = 0

    const segments = data.map((item) => {
        const percentage = total > 0 ? item.value / total : 0
        const strokeDasharray = `${percentage * circumference} ${circumference}`
        const strokeDashoffset = -currentOffset * circumference
        currentOffset += percentage

        return {
            ...item,
            percentage,
            strokeDasharray,
            strokeDashoffset,
        }
    })

    return (
        <div className={cn('flex items-center gap-6', className)}>
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="-rotate-90">
                    {/* Background circle */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        stroke="hsl(var(--muted))"
                        strokeWidth={strokeWidth}
                    />
                    {/* Data segments */}
                    {segments.map((segment, index) => (
                        <circle
                            key={index}
                            cx={center}
                            cy={center}
                            r={radius}
                            fill="none"
                            stroke={segment.color}
                            strokeWidth={strokeWidth}
                            strokeDasharray={segment.strokeDasharray}
                            strokeDashoffset={segment.strokeDashoffset}
                            strokeLinecap="round"
                            className="transition-all duration-500 ease-out"
                        />
                    ))}
                </svg>
                {showTotal && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-foreground text-2xl font-bold">
                            {total}
                        </span>
                        <span className="text-muted-foreground text-xs">
                            {totalLabel}
                        </span>
                    </div>
                )}
            </div>

            {showLegend && (
                <div className="flex flex-col gap-2">
                    {data.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div
                                className="size-3 rounded-full"
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="text-muted-foreground text-sm">
                                {item.label}
                            </span>
                            <span className="text-foreground text-sm font-medium">
                                {item.value}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
