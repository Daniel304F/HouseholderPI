import { type ReactNode } from 'react'
import { PanelLeftClose, PanelLeft } from 'lucide-react'
import { cn } from '../../../utils/cn'

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
                        'flex h-10 w-10 items-center justify-center rounded-r-2xl',
                        'shadow-brand-500/10 bg-white/85 shadow-lg backdrop-blur dark:bg-neutral-950/70',
                        'border border-l-0 border-neutral-200/80 dark:border-neutral-800/70',
                        'text-text-muted hover:text-text hover:shadow-brand-500/20 hover:-translate-y-[1px] hover:shadow-xl',
                        'transition-all duration-250'
                    )}
                    aria-label="Sidebar öffnen"
                >
                    <PanelLeft size={20} />
                </button>
            )}

            {/* Sidebar Container */}
            <aside
                className={cn(
                    'relative flex h-full shrink-0 flex-col border-r',
                    'bg-white/80 backdrop-blur dark:bg-neutral-950/70',
                    'border-neutral-200/80 dark:border-neutral-800/70',
                    'shadow-[6px_0_24px_-14px_rgba(0,0,0,0.18)]',
                    'transition-[width,opacity,transform] duration-250 ease-in-out',
                    isCollapsed && 'w-0 overflow-hidden opacity-0',
                    isResizing && 'transition-none',
                    className
                )}
                style={{ width: isCollapsed ? 0 : width }}
            >
                <div className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-200/80 px-4 dark:border-neutral-800/70">
                    <span className="text-text font-semibold tracking-tight">
                        Navigation
                    </span>
                    <button
                        onClick={onToggle}
                        className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-xl',
                            'text-text-muted hover:text-text hover:bg-brand-50 dark:hover:bg-brand-950 hover:-translate-y-[1px]',
                            'transition-all duration-200'
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
