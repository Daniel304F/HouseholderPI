import { MoreHorizontal, UserMinus, MessageCircle, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { Friend } from '../../api/friends'
import { cn } from '../../utils/cn'
import { IconButton } from '../common/IconButton'
import { DropdownMenuItem } from '../ui'
import { friendAvatarStyles, friendCardStyles, getInitials } from './friends.utils'

interface FriendCardProps {
    friend: Friend
    onRemove: (friendId: string) => void
    onViewProfile?: (friendId: string) => void
    onMessage?: (friendId: string) => void
}

export const FriendCard = ({
    friend,
    onRemove,
    onViewProfile,
    onMessage,
}: FriendCardProps) => {
    const [showMenu, setShowMenu] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const isProfileClickable = Boolean(onViewProfile)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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

    return (
        <div
            className={cn(
                friendCardStyles,
                isProfileClickable &&
                    'cursor-pointer transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40'
            )}
            onClick={() => onViewProfile?.(friend.friendId)}
            onKeyDown={(event) => {
                if (!isProfileClickable) return
                if (event.key !== 'Enter' && event.key !== ' ') return
                event.preventDefault()
                onViewProfile?.(friend.friendId)
            }}
            role={isProfileClickable ? 'button' : undefined}
            tabIndex={isProfileClickable ? 0 : undefined}
            aria-label={
                isProfileClickable ? `Profil von ${friend.friendName} oeffnen` : undefined
            }
        >
            {friend.friendAvatar ? (
                <img
                    src={friend.friendAvatar}
                    alt={friend.friendName}
                    className="size-12 rounded-full object-cover"
                />
            ) : (
                <div className={friendAvatarStyles}>{getInitials(friend.friendName)}</div>
            )}

            <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-neutral-900 dark:text-white">
                    {friend.friendName}
                </h3>
                <p className="truncate text-sm text-neutral-500 dark:text-neutral-400">
                    {friend.friendEmail}
                </p>
            </div>

            <div
                className="relative"
                ref={menuRef}
                onClick={(event) => event.stopPropagation()}
            >
                <IconButton
                    icon={<MoreHorizontal className="size-5" />}
                    variant="ghost"
                    size="sm"
                    onClick={(event) => {
                        event.stopPropagation()
                        setShowMenu((prev) => !prev)
                    }}
                    aria-label="Menue oeffnen"
                />

                {showMenu && (
                    <div
                        className={cn(
                            'absolute top-full right-0 z-10 mt-1 min-w-40 rounded-lg border p-1 shadow-lg',
                            'border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800'
                        )}
                    >
                        {onViewProfile && (
                            <DropdownMenuItem
                                icon={<User className="size-4" />}
                                onClick={(event) => {
                                    event.stopPropagation()
                                    onViewProfile(friend.friendId)
                                    setShowMenu(false)
                                }}
                            >
                                Profil ansehen
                            </DropdownMenuItem>
                        )}
                        {onMessage && (
                            <DropdownMenuItem
                                icon={<MessageCircle className="size-4" />}
                                onClick={(event) => {
                                    event.stopPropagation()
                                    onMessage(friend.friendId)
                                    setShowMenu(false)
                                }}
                            >
                                Nachricht senden
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                            icon={<UserMinus className="size-4" />}
                            variant="danger"
                            onClick={(event) => {
                                event.stopPropagation()
                                onRemove(friend.friendId)
                                setShowMenu(false)
                            }}
                        >
                            Freund entfernen
                        </DropdownMenuItem>
                    </div>
                )}
            </div>
        </div>
    )
}
