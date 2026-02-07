import { MoreHorizontal, UserMinus, MessageCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { Friend } from '../../api/friends'
import { cn } from '../../utils/cn'
import { IconButton } from '../common/IconButton'
import { DropdownMenuItem } from '../ui'
import { friendAvatarStyles, friendCardStyles, getInitials } from './friends.utils'

interface FriendCardProps {
    friend: Friend
    onRemove: (friendId: string) => void
    onMessage?: (friendId: string) => void
}

export const FriendCard = ({ friend, onRemove, onMessage }: FriendCardProps) => {
    const [showMenu, setShowMenu] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

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
        <div className={friendCardStyles}>
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

            <div className="relative" ref={menuRef}>
                <IconButton
                    icon={<MoreHorizontal className="size-5" />}
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMenu((prev) => !prev)}
                    aria-label="Menue oeffnen"
                />

                {showMenu && (
                    <div
                        className={cn(
                            'absolute top-full right-0 z-10 mt-1 min-w-40 rounded-lg border p-1 shadow-lg',
                            'border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800'
                        )}
                    >
                        {onMessage && (
                            <DropdownMenuItem
                                icon={<MessageCircle className="size-4" />}
                                onClick={() => {
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
                            onClick={() => {
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
