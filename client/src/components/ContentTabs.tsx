import { cn } from '../utils/cn'

export interface Tab {
    id: string
    label: string
    icon?: React.ReactNode
    disabled?: boolean
}

interface ContentTabsProps {
    tabs: Tab[]
    activeTab: string
    onTabChange: (tabId: string) => void
    className?: string
}

export const ContentTabs = ({
    tabs,
    activeTab,
    onTabChange,
    className,
}: ContentTabsProps) => {
    return (
        <div
            className={cn(
                'flex gap-1.5 rounded-2xl p-1.5',
                'from-brand-50/70 to-brand-50/50 bg-gradient-to-r via-white/80',
                'dark:to-brand-900/30 dark:from-neutral-900/70 dark:via-neutral-900/60',
                'shadow-brand-500/10 border border-neutral-200/60 shadow-sm backdrop-blur-sm dark:border-neutral-700/60',
                className
            )}
        >
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => !tab.disabled && onTabChange(tab.id)}
                    disabled={tab.disabled}
                    className={cn(
                        'flex items-center gap-2 rounded-xl px-5 py-2.5',
                        'text-sm font-semibold transition-all duration-200 ease-out',
                        activeTab === tab.id
                            ? cn(
                                  'via-brand-50/80 to-brand-100/70 bg-gradient-to-br from-white',
                                  'dark:via-brand-900/40 dark:to-brand-800/40 dark:from-neutral-800/90',
                                  'text-brand-700 dark:text-brand-300',
                                  'shadow-brand-500/15 shadow-md',
                                  'border-brand-200/80 dark:border-brand-700/60 border'
                              )
                            : cn(
                                  'text-neutral-500 dark:text-neutral-400',
                                  'hover:text-brand-600 dark:hover:text-brand-300',
                                  'hover:bg-white/70 dark:hover:bg-neutral-800/60',
                                  'border border-transparent'
                              ),
                        tab.disabled && 'cursor-not-allowed opacity-50'
                    )}
                >
                    {tab.icon && <span>{tab.icon}</span>}
                    <span>{tab.label}</span>
                </button>
            ))}
        </div>
    )
}
