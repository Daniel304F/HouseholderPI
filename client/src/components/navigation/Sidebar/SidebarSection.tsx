import { type ReactNode } from 'react'
import { cn } from '../../../utils/cn'

interface SidebarSectionProps {
    title?: string
    children: ReactNode
    className?: string
}

export const SidebarSection = ({
    title,
    children,
    className,
}: SidebarSectionProps) => {
    return (
        <div className={cn('space-y-1', className)}>
            {title && (
                <h3 className="text-text-muted mb-2 px-3 text-xs font-semibold tracking-wider uppercase">
                    {title}
                </h3>
            )}
            <div className="space-y-2">{children}</div>
        </div>
    )
}
