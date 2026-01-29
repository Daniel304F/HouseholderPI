import { cn } from '../../utils/cn'

export interface LineChartPoint {
    label: string
    value: number
}

export interface LineChartSeries {
    name: string
    data: LineChartPoint[]
    color: string
}

interface LineChartProps {
    series: LineChartSeries[]
    height?: number
    showDots?: boolean
    showLabels?: boolean
    showLegend?: boolean
    showGrid?: boolean
    showArea?: boolean
    className?: string
    title?: string
}

export const LineChart = ({
    series,
    height = 200,
    showDots = true,
    showLabels = true,
    showLegend = true,
    showGrid = true,
    showArea = false,
    className,
    title,
}: LineChartProps) => {
    // Find global min/max
    const allValues = series.flatMap((s) => s.data.map((d) => d.value))
    const minValue = Math.min(...allValues, 0)
    const maxValue = Math.max(...allValues, 1)
    const valueRange = maxValue - minValue || 1

    // Labels from first series
    const labels = series[0]?.data.map((d) => d.label) || []
    const pointCount = labels.length

    // SVG dimensions
    const svgWidth = 400
    const svgHeight = height
    const padding = { top: 16, right: 16, bottom: 32, left: 16 }
    const chartWidth = svgWidth - padding.left - padding.right
    const chartHeight = svgHeight - padding.top - padding.bottom

    const getX = (index: number) =>
        padding.left + (index / Math.max(pointCount - 1, 1)) * chartWidth

    const getY = (value: number) =>
        padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight

    return (
        <div
            className={cn(
                'rounded-2xl p-5',
                'bg-white dark:bg-neutral-800',
                'border border-neutral-200 dark:border-neutral-700',
                'shadow-sm',
                className
            )}
        >
            {title && (
                <h3 className="mb-4 text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                    {title}
                </h3>
            )}

            {showLegend && series.length > 1 && (
                <div className="mb-4 flex flex-wrap gap-3">
                    {series.map((s, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2"
                        >
                            <div
                                className="h-0.5 w-4 rounded-full"
                                style={{ backgroundColor: s.color }}
                            />
                            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                                {s.name}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            <svg
                width="100%"
                height={height}
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                preserveAspectRatio="xMidYMid meet"
                className="overflow-visible"
            >
                <defs>
                    {series.map((s, index) => (
                        <linearGradient
                            key={`gradient-${index}`}
                            id={`area-gradient-${index}`}
                            x1="0%"
                            y1="0%"
                            x2="0%"
                            y2="100%"
                        >
                            <stop offset="0%" stopColor={s.color} stopOpacity="0.2" />
                            <stop offset="100%" stopColor={s.color} stopOpacity="0" />
                        </linearGradient>
                    ))}
                </defs>

                {/* Grid lines */}
                {showGrid && (
                    <g>
                        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
                            <line
                                key={index}
                                x1={padding.left}
                                y1={padding.top + chartHeight * (1 - ratio)}
                                x2={svgWidth - padding.right}
                                y2={padding.top + chartHeight * (1 - ratio)}
                                className="stroke-neutral-200 dark:stroke-neutral-700"
                                strokeWidth="1"
                                strokeDasharray="4,4"
                            />
                        ))}
                    </g>
                )}

                {/* Area fills and Lines */}
                {series.map((s, seriesIndex) => {
                    const points = s.data
                        .map((d, i) => `${getX(i)},${getY(d.value)}`)
                        .join(' ')

                    const areaPoints = `${getX(0)},${padding.top + chartHeight} ${points} ${getX(s.data.length - 1)},${padding.top + chartHeight}`

                    return (
                        <g key={seriesIndex}>
                            {/* Area fill */}
                            {showArea && (
                                <polygon
                                    points={areaPoints}
                                    fill={`url(#area-gradient-${seriesIndex})`}
                                />
                            )}
                            {/* Line */}
                            <polyline
                                points={points}
                                fill="none"
                                stroke={s.color}
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            {/* Dots */}
                            {showDots &&
                                s.data.map((d, i) => (
                                    <g key={i}>
                                        <circle
                                            cx={getX(i)}
                                            cy={getY(d.value)}
                                            r="4"
                                            fill={s.color}
                                        />
                                        <circle
                                            cx={getX(i)}
                                            cy={getY(d.value)}
                                            r="2"
                                            fill="white"
                                        />
                                    </g>
                                ))}
                        </g>
                    )
                })}
            </svg>

            {/* X-axis labels */}
            {showLabels && labels.length > 0 && (
                <div className="mt-2 flex justify-between px-4">
                    {labels.map((label, index) => (
                        <span
                            key={index}
                            className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400"
                        >
                            {label}
                        </span>
                    ))}
                </div>
            )}
        </div>
    )
}
