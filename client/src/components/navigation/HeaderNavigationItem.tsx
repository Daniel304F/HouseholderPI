import { NavItem } from '../ui/navItem'

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
        <NavItem
            variant={isActive ? 'active' : 'default'}
            onClick={() => onClick(path)}
        >
            <Icon
                size={20}
                className="transition-all duration-200"
                fill={isActive && canFill ? 'currentColor' : 'none'}
                strokeWidth={isActive && !canFill ? 2.5 : 2}
            />
            <span className="text-sm font-medium">{label}</span>
        </NavItem>
    )
}
