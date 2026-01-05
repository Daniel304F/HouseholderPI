interface HeaderNavigationItemProps {
    id: string
    label: string
    path: string
    icon: React.ComponentType<{
        size?: number
        className?: string
        fill?: string
        strokeWidth?: number
    }>
    isActive: boolean
    canFill: boolean
    onClick: (path: string) => void
}

export const HeaderNavigationItem = ({
    path,
    label,
    icon: Icon,
    isActive,
    canFill,
    onClick,
}: HeaderNavigationItemProps) => {
    return (
        <button
            onClick={() => onClick(path)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors duration-200 ${
                isActive
                    ? 'bg-brand-100 text-brand-700'
                    : 'text-secondary hover:bg-muted hover:text-primary'
            } `}
        >
            <Icon
                size={20}
                className="transition-all duration-200"
                fill={isActive && canFill ? 'currentColor' : 'none'}
                strokeWidth={isActive && !canFill ? 2.5 : 2}
            />
            <span className="text-sm font-medium">{label}</span>
        </button>
    )
}
