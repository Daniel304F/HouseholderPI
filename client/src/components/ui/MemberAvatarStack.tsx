import { cn } from '../../utils/cn'

interface Member {
    userId: string
    name?: string
}

interface MemberAvatarStackProps {
    members: Member[]
    maxDisplay?: number
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

const sizeStyles = {
    sm: 'size-6 text-[10px]',
    md: 'size-8 text-xs',
    lg: 'size-10 text-sm',
}

const borderSizeStyles = {
    sm: 'border',
    md: 'border-2',
    lg: 'border-2',
}

export const MemberAvatarStack = ({
    members,
    maxDisplay = 4,
    size = 'md',
    className,
}: MemberAvatarStackProps) => {
    const displayMembers = members.slice(0, maxDisplay)
    const extraCount = Math.max(0, members.length - maxDisplay)

    return (
        <div className={cn('flex -space-x-2', className)}>
            {displayMembers.map((member) => (
                <div
                    key={member.userId}
                    className={cn(
                        'flex items-center justify-center rounded-full',
                        'bg-brand-100 dark:bg-brand-900/30',
                        'border-white dark:border-neutral-900',
                        'text-brand-600 dark:text-brand-400 font-medium',
                        sizeStyles[size],
                        borderSizeStyles[size]
                    )}
                    title={member.name || member.userId}
                >
                    {(member.name || member.userId).charAt(0).toUpperCase()}
                </div>
            ))}
            {extraCount > 0 && (
                <div
                    className={cn(
                        'flex items-center justify-center rounded-full',
                        'bg-neutral-200 dark:bg-neutral-700',
                        'border-white dark:border-neutral-900',
                        'text-neutral-600 dark:text-neutral-400 font-medium',
                        sizeStyles[size],
                        borderSizeStyles[size]
                    )}
                >
                    +{extraCount}
                </div>
            )}
        </div>
    )
}
