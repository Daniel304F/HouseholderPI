import { Check, X, Clock } from 'lucide-react'
import type { FriendRequest, SentRequest } from '../../api/friends'
import { cn } from '../../utils/cn'
import { Button } from '../Button'

interface FriendRequestCardProps {
    request: FriendRequest
    onAccept: (requestId: string) => void
    onReject: (requestId: string) => void
    isLoading?: boolean
}

interface SentRequestCardProps {
    request: SentRequest
    onCancel: (requestId: string) => void
    isLoading?: boolean
}

const cardStyles = cn(
    'flex w-full items-center gap-4',
    'p-4 rounded-xl',
    'bg-white dark:bg-neutral-800',
    'border border-neutral-200 dark:border-neutral-700'
)

const avatarStyles = cn(
    'flex items-center justify-center',
    'size-12 rounded-full',
    'bg-amber-100 dark:bg-amber-900/30',
    'text-amber-600 dark:text-amber-400',
    'text-lg font-semibold'
)

const getInitials = (name: string) => {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: 'short',
    })
}

export const FriendRequestCard = ({
    request,
    onAccept,
    onReject,
    isLoading,
}: FriendRequestCardProps) => {
    return (
        <div className={cardStyles}>
            {/* Avatar */}
            {request.from.avatar ? (
                <img
                    src={request.from.avatar}
                    alt={request.from.name}
                    className="size-12 rounded-full object-cover"
                />
            ) : (
                <div className={avatarStyles}>
                    {getInitials(request.from.name)}
                </div>
            )}

            {/* Info */}
            <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-neutral-900 dark:text-white">
                    {request.from.name}
                </h3>
                <p className="truncate text-sm text-neutral-500 dark:text-neutral-400">
                    {request.from.email}
                </p>
            </div>

            {/* Date */}
            <span className="hidden text-xs text-neutral-400 sm:block">
                {formatDate(request.createdAt)}
            </span>

            {/* Actions */}
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

export const SentRequestCard = ({
    request,
    onCancel,
    isLoading,
}: SentRequestCardProps) => {
    return (
        <div className={cardStyles}>
            {/* Avatar */}
            {request.to.avatar ? (
                <img
                    src={request.to.avatar}
                    alt={request.to.name}
                    className="size-12 rounded-full object-cover"
                />
            ) : (
                <div
                    className={cn(
                        avatarStyles,
                        'bg-neutral-100 dark:bg-neutral-700',
                        'text-neutral-500 dark:text-neutral-400'
                    )}
                >
                    {getInitials(request.to.name)}
                </div>
            )}

            {/* Info */}
            <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-neutral-900 dark:text-white">
                    {request.to.name}
                </h3>
                <p className="truncate text-sm text-neutral-500 dark:text-neutral-400">
                    {request.to.email}
                </p>
            </div>

            {/* Pending Badge */}
            <div
                className={cn(
                    'hidden items-center gap-1 rounded-full px-2 py-1 sm:flex',
                    'bg-amber-100 dark:bg-amber-900/30',
                    'text-xs text-amber-600 dark:text-amber-400'
                )}
            >
                <Clock className="size-3" />
                Ausstehend
            </div>

            {/* Cancel Button */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onCancel(request.id)}
                disabled={isLoading}
                className="text-neutral-500 hover:text-red-600 dark:hover:text-red-400"
            >
                Zurückziehen
            </Button>
        </div>
    )
}

export const RequestCardSkeleton = ({ count = 1 }: { count?: number }) => {
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
                    <div className="flex gap-2">
                        <div className="h-8 w-20 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700" />
                        <div className="h-8 w-20 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700" />
                    </div>
                </div>
            ))}
        </>
    )
}
