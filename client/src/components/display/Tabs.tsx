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
            'flex gap-1.5 rounded-2xl p-1.5',
            'bg-gradient-to-r from-brand-50/70 via-white/80 to-brand-50/50',
            'dark:from-neutral-900/70 dark:via-neutral-900/60 dark:to-brand-900/30',
            'border border-neutral-200/60 shadow-sm shadow-brand-500/10 backdrop-blur-sm',
            'dark:border-neutral-700/60',
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
                              'bg-gradient-to-br from-white via-brand-50/80 to-brand-100/70',
                              'dark:from-neutral-800/90 dark:via-brand-900/40 dark:to-brand-800/40',
                              'text-brand-700 dark:text-brand-300',
                              'shadow-md shadow-brand-500/15',
                              'border border-brand-200/80 dark:border-brand-700/60'
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

const PillTabs = ({ tabs, activeTab, onTabChange, className }: Omit<TabsProps, 'variant'>) => (
    <div className={cn('flex gap-2', className)}>
        {tabs.map((tab) => (
            <button
                key={tab.id}
                onClick={() => !tab.disabled && onTabChange(tab.id)}
                disabled={tab.disabled}
                className={cn(
                    'flex items-center gap-2 rounded-full px-4 py-2',
                    'text-sm font-medium transition-all duration-200',
                    activeTab === tab.id
                        ? 'bg-brand-500 text-white shadow-md'
                        : cn(
                              'bg-neutral-100 text-neutral-600',
                              'hover:bg-neutral-200',
                              'dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
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

const UnderlineTabs = ({ tabs, activeTab, onTabChange, className }: Omit<TabsProps, 'variant'>) => (
    <div className={cn('flex border-b border-neutral-200 dark:border-neutral-700', className)}>
        {tabs.map((tab) => (
            <button
                key={tab.id}
                onClick={() => !tab.disabled && onTabChange(tab.id)}
                disabled={tab.disabled}
                className={cn(
                    'flex items-center gap-2 px-4 py-3 -mb-px',
                    'text-sm font-medium transition-all duration-200',
                    'border-b-2',
                    activeTab === tab.id
                        ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                        : cn(
                              'border-transparent text-neutral-500',
                              'hover:text-neutral-700 hover:border-neutral-300',
                              'dark:text-neutral-400 dark:hover:text-neutral-300'
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

// Re-export for backwards compatibility
export { Tabs as ContentTabs }
