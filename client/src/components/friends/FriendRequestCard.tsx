import { Check, X } from 'lucide-react'
import type { FriendRequest } from '../../api/friends'
import { Button } from '../common'
import { formatDate, getInitials, requestAvatarStyles, requestCardStyles } from './friends.utils'

interface FriendRequestCardProps {
    request: FriendRequest
    onAccept: (requestId: string) => void
    onReject: (requestId: string) => void
    isLoading?: boolean
}

export const FriendRequestCard = ({
    request,
    onAccept,
    onReject,
    isLoading,
}: FriendRequestCardProps) => {
    return (
        <div className={requestCardStyles}>
            {request.from.avatar ? (
                <img
                    src={request.from.avatar}
                    alt={request.from.name}
                    className="size-12 rounded-full object-cover"
                />
            ) : (
                <div className={requestAvatarStyles}>{getInitials(request.from.name)}</div>
            )}

            <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-neutral-900 dark:text-white">
                    {request.from.name}
                </h3>
                <p className="truncate text-sm text-neutral-500 dark:text-neutral-400">
                    {request.from.email}
                </p>
            </div>

            <span className="hidden text-xs text-neutral-400 sm:block">
                {formatDate(request.createdAt)}
            </span>

            <div className="flex gap-2">
                <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onAccept(request.id)}
                    disabled={isLoading}
                    icon={<Check className="size-4" />}
                    className="!px-3"
                >
                    <span className="sr-only sm:not-sr-only">Annehmen</span>
                </Button>
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onReject(request.id)}
                    disabled={isLoading}
                    icon={<X className="size-4" />}
                    className="!px-3"
                >
                    <span className="sr-only sm:not-sr-only">Ablehnen</span>
                </Button>
            </div>
        </div>
    )
}
