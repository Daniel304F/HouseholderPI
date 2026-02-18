import { cn } from '../../utils/cn'

export interface Tab {
    id: string
    label: string
    icon?: React.ReactNode
    disabled?: boolean
}

interface TabsProps {
    tabs: Tab[]
    activeTab: string
    onTabChange: (tabId: string) => void
    variant?: 'default' | 'pills' | 'underline'
    className?: string
}

/**
 * Tab navigation component with multiple variants
 */
export const Tabs = ({
    tabs,
    activeTab,
    onTabChange,
    variant = 'default',
    className,
}: TabsProps) => {
    if (variant === 'underline') {
        return <UnderlineTabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} className={className} />
    }

    if (variant === 'pills') {
        return <PillTabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} className={className} />
    }

    return <DefaultTabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} className={className} />
}

const DefaultTabs = ({ tabs, activeTab, onTabChange, className }: Omit<TabsProps, 'variant'>) => (
    <div
        className={cn(
            'hide-scrollbar flex gap-1.5 overflow-x-auto rounded-2xl p-1.5',
            'bg-neutral-50 dark:bg-neutral-900',
            'border border-neutral-200 dark:border-neutral-700',
            className
        )}
        role="tablist"
    >
        {tabs.map((tab) => (
            <button
                key={tab.id}
                onClick={() => !tab.disabled && onTabChange(tab.id)}
                disabled={tab.disabled}
                className={cn(
                    'flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 sm:px-5',
                    'text-sm font-semibold transition-all duration-200',
                    'border',
                    activeTab === tab.id
                        ? cn(
                              'bg-brand-50 dark:bg-brand-900/25',
                              'text-brand-700 dark:text-brand-200',
                              'border-brand-500'
                          )
                        : cn(
                              'border-transparent text-neutral-500 dark:text-neutral-400',
                              'hover:text-brand-600 dark:hover:text-brand-300',
                              'hover:bg-white dark:hover:bg-neutral-800'
                    ),
                    tab.disabled && 'cursor-not-allowed opacity-50'
                )}
                role="tab"
                aria-selected={activeTab === tab.id}
            >
                {tab.icon && <span>{tab.icon}</span>}
                <span>{tab.label}</span>
            </button>
        ))}
    </div>
)

const PillTabs = ({ tabs, activeTab, onTabChange, className }: Omit<TabsProps, 'variant'>) => (
    <div className={cn('hide-scrollbar flex gap-2 overflow-x-auto', className)} role="tablist">
        {tabs.map((tab) => (
            <button
                key={tab.id}
                onClick={() => !tab.disabled && onTabChange(tab.id)}
                disabled={tab.disabled}
                className={cn(
                    'flex shrink-0 items-center gap-2 rounded-full px-4 py-2',
                    'text-sm font-medium transition-all duration-200 border',
                    activeTab === tab.id
                        ? 'bg-brand-500 border-brand-500 text-white'
                        : cn(
                              'bg-neutral-100 border-transparent text-neutral-600',
                              'hover:bg-neutral-200',
                              'dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                    ),
                    tab.disabled && 'cursor-not-allowed opacity-50'
                )}
                role="tab"
                aria-selected={activeTab === tab.id}
            >
                {tab.icon && <span>{tab.icon}</span>}
                <span>{tab.label}</span>
            </button>
        ))}
    </div>
)

const UnderlineTabs = ({ tabs, activeTab, onTabChange, className }: Omit<TabsProps, 'variant'>) => (
    <div
        className={cn(
            'hide-scrollbar flex overflow-x-auto border-b border-neutral-200 dark:border-neutral-700',
            className
        )}
        role="tablist"
    >
        {tabs.map((tab) => (
            <button
                key={tab.id}
                onClick={() => !tab.disabled && onTabChange(tab.id)}
                disabled={tab.disabled}
                className={cn(
                    'flex shrink-0 items-center gap-2 px-4 py-3 -mb-px',
                    'text-sm font-medium transition-all duration-200',
                    'border-b-2',
                    activeTab === tab.id
                        ? 'border-brand-500 text-brand-700 dark:text-brand-300'
                        : cn(
                              'border-transparent text-neutral-500',
                              'hover:text-neutral-700 hover:border-neutral-300',
                              'dark:text-neutral-400 dark:hover:text-neutral-300'
                    ),
                    tab.disabled && 'cursor-not-allowed opacity-50'
                )}
                role="tab"
                aria-selected={activeTab === tab.id}
            >
                {tab.icon && <span>{tab.icon}</span>}
                <span>{tab.label}</span>
            </button>
        ))}
    </div>
)

// Re-export for backwards compatibility
export { Tabs as ContentTabs }
