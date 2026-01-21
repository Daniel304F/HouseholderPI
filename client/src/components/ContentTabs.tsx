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
                'flex gap-1 rounded-xl p-1',
                'bg-neutral-100 dark:bg-neutral-800',
                className
            )}
        >
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => !tab.disabled && onTabChange(tab.id)}
                    disabled={tab.disabled}
                    className={cn(
                        'flex items-center gap-2 rounded-lg px-4 py-2',
                        'text-sm font-medium transition-all duration-200',
                        activeTab === tab.id
                            ? cn(
                                  'bg-white dark:bg-neutral-700',
                                  'text-brand-600 dark:text-brand-400',
                                  'shadow-sm'
                              )
                            : cn(
                                  'text-neutral-600 dark:text-neutral-400',
                                  'hover:text-neutral-900 dark:hover:text-white',
                                  'hover:bg-white/50 dark:hover:bg-neutral-700/50'
                              ),
                        tab.disabled && 'cursor-not-allowed opacity-50'
                    )}
                >
                    {tab.icon}
                    <span>{tab.label}</span>
                </button>
            ))}
        </div>
    )
}
