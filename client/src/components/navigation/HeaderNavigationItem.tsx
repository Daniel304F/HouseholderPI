interface HeaderNavigationItemProps {
    id: string
    label: string
    icon: React.ComponentType<{
        size?: number
        className?: string
        fill?: string
        strokeWidth?: number
    }>
    isActive: boolean
    canFill: boolean
    onClick: (id: string) => void
}

export const HeaderNavigationItem = ({
    id,
    label,
    icon: Icon,
    isActive,
    canFill,
    onClick,
}: HeaderNavigationItemProps) => {
    return (
        <button onClick={() => onClick(id)}>
            <Icon
                size={20}
                className="transition-all duration-200"
                fill={isActive && canFill ? 'currentColor' : 'none'}
                strokeWidth={isActive && !canFill ? 2.5 : 2}
            ></Icon>
            <span className="text-sm font-medium">{label}</span>
        </button>
    )
}
