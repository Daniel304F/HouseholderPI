import { type ReactNode } from 'react'
import { PanelLeftClose, PanelLeft } from 'lucide-react'
import { cn } from '../../utils/cn'

interface SidebarProps {
    children: ReactNode
    width: number
    isCollapsed: boolean
    isResizing: boolean
    onToggle: () => void
    onResizeStart: () => void
    className?: string
}

export const Sidebar = ({
    children,
    width,
    isCollapsed,
    isResizing,
    onToggle,
    onResizeStart,
    className,
}: SidebarProps) => {
    return (
        <>
            {isCollapsed && (
                <button
                    onClick={onToggle}
                    className={cn(
                        'fixed top-20 left-0 z-40',
                        'flex h-10 w-10 items-center justify-center',
                        'bg-surface border-default rounded-r-lg border border-l-0',
                        'text-text-muted hover:text-text hover:bg-surface-hover',
                        'transition-all duration-200',
                        'shadow-md'
                    )}
                    aria-label="Sidebar öffnen"
                >
                    <PanelLeft size={20} />
                </button>
            )}

            {/* Sidebar Container */}
            <aside
                className={cn(
                    'bg-surface border-default relative flex flex-col border-r',
                    'h-full shrink-0',
                    'transition-[width,opacity,transform] duration-200 ease-in-out',
                    isCollapsed && 'w-0 overflow-hidden opacity-0',
                    isResizing && 'transition-none',
                    className
                )}
                style={{ width: isCollapsed ? 0 : width }}
            >
                <div className="border-default flex h-14 shrink-0 items-center justify-between border-b px-4">
                    <span className="text-text font-semibold">Navigation</span>
                    <button
                        onClick={onToggle}
                        className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-md',
                            'text-text-muted hover:text-text hover:bg-surface-hover',
                            'transition-colors duration-150'
                        )}
                        aria-label="Sidebar schließen"
                    >
                        <PanelLeftClose size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-x-hidden overflow-y-auto p-4">
                    {children}
                </div>

                <div
                    className={cn(
                        'absolute top-0 right-0 h-full w-1 cursor-col-resize',
                        'hover:bg-brand-500/50 active:bg-brand-500',
                        'transition-colors duration-150',
                        isResizing && 'bg-brand-500'
                    )}
                    onMouseDown={(e) => {
                        e.preventDefault()
                        onResizeStart()
                    }}
                    role="separator"
                    aria-orientation="vertical"
                    aria-label="Sidebar Größe ändern"
                />
            </aside>
        </>
    )
}
