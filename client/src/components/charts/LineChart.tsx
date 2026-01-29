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
    showArea = true,
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

    const padding = { top: 20, right: 20, bottom: 40, left: 20 }
    const chartWidth = 100 // percentage
    const chartHeight = height - padding.top - padding.bottom

    const getX = (index: number) =>
        padding.left +
        (index / Math.max(pointCount - 1, 1)) *
            (chartWidth - padding.left - padding.right)
    const getY = (value: number) =>
        padding.top +
        chartHeight -
        ((value - minValue) / valueRange) * chartHeight

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

            {showLegend && series.length > 1 && (
                <div className="mb-4 flex flex-wrap gap-4">
                    {series.map((s, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 rounded-full bg-neutral-100/60 dark:bg-neutral-800/40 px-3 py-1"
                        >
                            <div
                                className="h-0.5 w-4 rounded-full"
                                style={{
                                    backgroundColor: s.color,
                                    boxShadow: `0 0 6px ${s.color}`,
                                }}
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
                viewBox={`0 0 100 ${height}`}
                preserveAspectRatio="none"
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
                            <stop offset="0%" stopColor={s.color} stopOpacity="0.3" />
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
                                x2={chartWidth - padding.right}
                                y2={padding.top + chartHeight * (1 - ratio)}
                                className="stroke-neutral-200/60 dark:stroke-neutral-700/40"
                                strokeWidth="0.3"
                                strokeDasharray="2,2"
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
                                    className="transition-all duration-500 ease-out"
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
                                className="transition-all duration-500 ease-out"
                                vectorEffect="non-scaling-stroke"
                                style={{
                                    filter: `drop-shadow(0 2px 4px ${s.color}50)`,
                                }}
                            />
                            {/* Dots */}
                            {showDots &&
                                s.data.map((d, i) => (
                                    <g key={i} className="group">
                                        {/* Outer glow */}
                                        <circle
                                            cx={getX(i)}
                                            cy={getY(d.value)}
                                            r="6"
                                            fill={s.color}
                                            opacity="0.2"
                                            className="transition-all duration-300"
                                        />
                                        {/* Inner dot */}
                                        <circle
                                            cx={getX(i)}
                                            cy={getY(d.value)}
                                            r="3.5"
                                            fill={s.color}
                                            className="transition-all duration-300"
                                            vectorEffect="non-scaling-stroke"
                                            style={{
                                                filter: `drop-shadow(0 0 4px ${s.color})`,
                                            }}
                                        />
                                        {/* White center */}
                                        <circle
                                            cx={getX(i)}
                                            cy={getY(d.value)}
                                            r="1.5"
                                            fill="white"
                                            className="transition-all duration-300"
                                            vectorEffect="non-scaling-stroke"
                                        />
                                    </g>
                                ))}
                        </g>
                    )
                })}
            </svg>

            {/* X-axis labels */}
            {showLabels && (
                <div
                    className="flex justify-between px-5"
                    style={{ marginTop: -30 }}
                >
                    {labels.map((label, index) => (
                        <span
                            key={index}
                            className="text-[10px] font-medium text-neutral-500 dark:text-neutral-500"
                        >
                            {label}
                        </span>
                    ))}
                </div>
            )}
        </div>
    )
}
