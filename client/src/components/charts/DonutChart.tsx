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
    title?: string
}

export const DonutChart = ({
    data,
    size = 160,
    strokeWidth = 20,
    showLegend = true,
    showTotal = true,
    totalLabel = 'Gesamt',
    className,
    title,
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
        <div
            className={cn(
                'rounded-2xl p-5',
                'bg-white/80 dark:bg-neutral-900/60 backdrop-blur-sm',
                'border border-neutral-200/60 dark:border-neutral-800/60',
                'shadow-md shadow-brand-500/5',
                className
            )}
        >
            {title && (
                <h3 className="mb-4 text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                    {title}
                </h3>
            )}
            <div className="flex items-center gap-6">
                <div
                    className="relative flex-shrink-0"
                    style={{ width: size, height: size }}
                >
                    {/* Glow effect */}
                    <div
                        className="absolute inset-0 rounded-full opacity-30 blur-xl"
                        style={{
                            background: `conic-gradient(${data.map((d, i) => `${d.color} ${(i / data.length) * 100}%`).join(', ')})`,
                        }}
                    />
                    <svg
                        width={size}
                        height={size}
                        className="relative -rotate-90 drop-shadow-lg"
                    >
                        {/* Background circle */}
                        <circle
                            cx={center}
                            cy={center}
                            r={radius}
                            fill="none"
                            className="stroke-neutral-200/80 dark:stroke-neutral-700/60"
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
                                className="transition-all duration-700 ease-out hover:brightness-110"
                                style={{
                                    filter: `drop-shadow(0 0 6px ${segment.color}50)`,
                                }}
                            />
                        ))}
                    </svg>
                    {showTotal && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
                                {total}
                            </span>
                            <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                {totalLabel}
                            </span>
                        </div>
                    )}
                </div>

                {showLegend && (
                    <div className="flex flex-col gap-2.5">
                        {data.map((item, index) => (
                            <div
                                key={index}
                                className="group flex items-center gap-2.5 rounded-lg px-2 py-1 transition-colors hover:bg-neutral-100/60 dark:hover:bg-neutral-800/40"
                            >
                                <div
                                    className="size-3 rounded-full ring-2 ring-white/50 dark:ring-neutral-900/50 transition-transform group-hover:scale-125"
                                    style={{
                                        backgroundColor: item.color,
                                        boxShadow: `0 0 8px ${item.color}60`,
                                    }}
                                />
                                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                    {item.label}
                                </span>
                                <span className="ml-auto text-sm font-bold text-neutral-800 dark:text-neutral-200">
                                    {item.value}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
