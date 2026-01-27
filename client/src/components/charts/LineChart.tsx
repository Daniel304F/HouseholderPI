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
    className?: string
}

export const LineChart = ({
    series,
    height = 200,
    showDots = true,
    showLabels = true,
    showLegend = true,
    showGrid = true,
    className,
}: LineChartProps) => {
    // Find global min/max
    const allValues = series.flatMap((s) => s.data.map((d) => d.value))
    const minValue = Math.min(...allValues, 0)
    const maxValue = Math.max(...allValues, 1)
    const valueRange = maxValue - minValue || 1

    // Labels from first series
    const labels = series[0]?.data.map((d) => d.label) || []
    const pointCount = labels.length

    const padding = { top: 20, right: 20, bottom: 40, left: 40 }
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
        <div className={cn('relative w-full', className)}>
            {showLegend && series.length > 1 && (
                <div className="mb-4 flex flex-wrap gap-4">
                    {series.map((s, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div
                                className="h-0.5 w-4 rounded"
                                style={{ backgroundColor: s.color }}
                            />
                            <span className="text-muted-foreground text-sm">
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
                {/* Grid lines */}
                {showGrid && (
                    <g className="text-muted stroke-current opacity-20">
                        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
                            <line
                                key={index}
                                x1={padding.left}
                                y1={padding.top + chartHeight * (1 - ratio)}
                                x2={chartWidth - padding.right}
                                y2={padding.top + chartHeight * (1 - ratio)}
                                strokeWidth="0.5"
                            />
                        ))}
                    </g>
                )}

                {/* Lines and dots */}
                {series.map((s, seriesIndex) => {
                    const points = s.data
                        .map((d, i) => `${getX(i)},${getY(d.value)}`)
                        .join(' ')

                    return (
                        <g key={seriesIndex}>
                            {/* Line */}
                            <polyline
                                points={points}
                                fill="none"
                                stroke={s.color}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="transition-all duration-500 ease-out"
                                vectorEffect="non-scaling-stroke"
                            />
                            {/* Dots */}
                            {showDots &&
                                s.data.map((d, i) => (
                                    <circle
                                        key={i}
                                        cx={getX(i)}
                                        cy={getY(d.value)}
                                        r="3"
                                        fill={s.color}
                                        className="transition-all duration-500 ease-out"
                                        vectorEffect="non-scaling-stroke"
                                    />
                                ))}
                        </g>
                    )
                })}
            </svg>

            {/* X-axis labels */}
            {showLabels && (
                <div
                    className="flex justify-between px-10"
                    style={{ marginTop: -30 }}
                >
                    {labels.map((label, index) => (
                        <span
                            key={index}
                            className="text-muted-foreground text-xs"
                        >
                            {label}
                        </span>
                    ))}
                </div>
            )}
        </div>
    )
}
