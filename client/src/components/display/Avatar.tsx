import { cn } from '../../utils/cn'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps {
    name?: string
    src?: string
    size?: AvatarSize
    className?: string
}

const sizeStyles: Record<AvatarSize, string> = {
    xs: 'size-6 text-[10px]',
    sm: 'size-8 text-xs',
    md: 'size-10 text-sm',
    lg: 'size-12 text-base',
    xl: 'size-16 text-lg',
}

export const Avatar = ({ name, src, size = 'md', className }: AvatarProps) => {
    const initials = name
        ? name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
        : '?'

    if (src) {
        return (
            <img
                src={src}
                alt={name || 'Avatar'}
                className={cn(
                    'rounded-full object-cover',
                    sizeStyles[size],
                    className
                )}
            />
        )
    }

    return (
        <div
            className={cn(
                'flex items-center justify-center rounded-full',
                'bg-brand-100 dark:bg-brand-900/30',
                'text-brand-600 dark:text-brand-400 font-medium',
                sizeStyles[size],
                className
            )}
            title={name}
        >
            {initials}
        </div>
    )
}

/**
 * Stack of avatars for showing group members
 */
interface AvatarStackProps {
    members: Array<{ userId: string; name?: string; avatar?: string }>
    maxDisplay?: number
    size?: AvatarSize
    className?: string
}

const stackBorderStyles: Record<AvatarSize, string> = {
    xs: 'border',
    sm: 'border',
    md: 'border-2',
    lg: 'border-2',
    xl: 'border-[3px]',
}

export const AvatarStack = ({
    members,
    maxDisplay = 4,
    size = 'md',
    className,
}: AvatarStackProps) => {
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
                        stackBorderStyles[size]
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
                        stackBorderStyles[size]
                    )}
                >
                    +{extraCount}
                </div>
            )}
        </div>
    )
}
