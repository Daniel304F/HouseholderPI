import { MoreHorizontal, UserMinus, MessageCircle } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import type { Friend } from '../../api/friends'
import { cn } from '../../utils/cn'

interface FriendCardProps {
    friend: Friend
    onRemove: (friendId: string) => void
    onMessage?: (friendId: string) => void
}

const cardStyles = cn(
    'group flex w-full items-center gap-4',
    'p-4 rounded-xl',
    'bg-white dark:bg-neutral-800',
    'border border-neutral-200 dark:border-neutral-700',
    'transition-all duration-300 ease-out',
    'hover:border-brand-300 dark:hover:border-brand-600',
    'hover:shadow-lg hover:shadow-brand-500/10'
)

const avatarStyles = cn(
    'flex items-center justify-center',
    'size-12 rounded-full',
    'bg-brand-100 dark:bg-brand-900/30',
    'text-brand-600 dark:text-brand-400',
    'text-lg font-semibold',
    'transition-transform duration-300 group-hover:scale-105'
)

export const FriendCard = ({
    friend,
    onRemove,
    onMessage,
}: FriendCardProps) => {
    const [showMenu, setShowMenu] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setShowMenu(false)
            }
        }

        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showMenu])

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <div className={cardStyles}>
            {/* Avatar */}
            {friend.friendAvatar ? (
                <img
                    src={friend.friendAvatar}
                    alt={friend.friendName}
                    className="size-12 rounded-full object-cover"
                />
            ) : (
                <div className={avatarStyles}>
                    {getInitials(friend.friendName)}
                </div>
            )}

            {/* Info */}
            <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-neutral-900 dark:text-white">
                    {friend.friendName}
                </h3>
                <p className="truncate text-sm text-neutral-500 dark:text-neutral-400">
                    {friend.friendEmail}
                </p>
            </div>

            {/* Actions */}
            <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    className={cn(
                        'rounded-lg p-2 transition-colors',
                        'text-neutral-400 hover:text-neutral-600',
                        'dark:text-neutral-500 dark:hover:text-neutral-300',
                        'hover:bg-neutral-100 dark:hover:bg-neutral-700'
                    )}
                >
                    <MoreHorizontal className="size-5" />
                </button>

                {/* Dropdown Menu */}
                {showMenu && (
                    <div
                        className={cn(
                            'absolute top-full right-0 z-10 mt-1',
                            'min-w-40 rounded-lg p-1',
                            'bg-white dark:bg-neutral-800',
                            'border border-neutral-200 dark:border-neutral-700',
                            'shadow-lg'
                        )}
                    >
                        {onMessage && (
                            <button
                                onClick={() => {
                                    onMessage(friend.friendId)
                                    setShowMenu(false)
                                }}
                                className={cn(
                                    'flex w-full items-center gap-2 rounded-md px-3 py-2',
                                    'text-sm text-neutral-700 dark:text-neutral-300',
                                    'hover:bg-neutral-100 dark:hover:bg-neutral-700'
                                )}
                            >
                                <MessageCircle className="size-4" />
                                Nachricht senden
                            </button>
                        )}
                        <button
                            onClick={() => {
                                onRemove(friend.friendId)
                                setShowMenu(false)
                            }}
                            className={cn(
                                'flex w-full items-center gap-2 rounded-md px-3 py-2',
                                'text-sm text-red-600 dark:text-red-400',
                                'hover:bg-red-50 dark:hover:bg-red-900/20'
                            )}
                        >
                            <UserMinus className="size-4" />
                            Freund entfernen
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export const FriendCardSkeleton = ({ count = 1 }: { count?: number }) => {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className={cn(
                        'flex items-center gap-4 rounded-xl p-4',
                        'bg-white dark:bg-neutral-800',
                        'border border-neutral-200 dark:border-neutral-700'
                    )}
                >
                    <div className="size-12 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700" />
                    <div className="flex-1 space-y-2">
                        <div className="h-5 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                        <div className="h-4 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                    </div>
                </div>
            ))}
        </>
    )
}
