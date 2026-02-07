import { useState, type ReactNode } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '../../utils/cn'

export interface CollapsibleSectionProps {
    icon: ReactNode
    title: string
    badge?: ReactNode
    children: ReactNode
    defaultExpanded?: boolean
    expanded?: boolean
    onExpandedChange?: (expanded: boolean) => void
    className?: string
}

export const CollapsibleSection = ({
    icon,
    title,
    badge,
    children,
    defaultExpanded = false,
    expanded: controlledExpanded,
    onExpandedChange,
    className,
}: CollapsibleSectionProps) => {
    const [internalExpanded, setInternalExpanded] = useState(defaultExpanded)
    const isControlled = controlledExpanded !== undefined
    const expanded = isControlled ? controlledExpanded : internalExpanded

    const toggle = () => {
        const next = !expanded
        if (!isControlled) {
            setInternalExpanded(next)
        }
        onExpandedChange?.(next)
    }

    return (
        <div className={cn('mb-6', className)}>
            <button
                type="button"
                onClick={toggle}
                className={cn(
                    'flex w-full items-center justify-between rounded-xl p-3',
                    'bg-neutral-50 dark:bg-neutral-800/50',
                    'transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800'
                )}
            >
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="font-medium text-neutral-900 dark:text-white">
                        {title}
                    </span>
                    {badge}
                </div>
                {expanded ? (
                    <ChevronUp className="size-5 text-neutral-500" />
                ) : (
                    <ChevronDown className="size-5 text-neutral-500" />
                )}
            </button>

            {expanded && (
                <div className="mt-3 space-y-3">{children}</div>
            )}
        </div>
    )
}
