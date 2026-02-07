import { Clock } from 'lucide-react'
import type { SentRequest } from '../../api/friends'
import { cn } from '../../utils/cn'
import { Button } from '../common'
import { formatDate, getInitials, requestAvatarStyles, requestCardStyles } from './friends.utils'

interface SentRequestCardProps {
    request: SentRequest
    onCancel: (requestId: string) => void
    isLoading?: boolean
}

export const SentRequestCard = ({
    request,
    onCancel,
    isLoading,
}: SentRequestCardProps) => {
    return (
        <div className={requestCardStyles}>
            {request.to.avatar ? (
                <img
                    src={request.to.avatar}
                    alt={request.to.name}
                    className="size-12 rounded-full object-cover"
                />
            ) : (
                <div
                    className={cn(
                        requestAvatarStyles,
                        'bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400'
                    )}
                >
                    {getInitials(request.to.name)}
                </div>
            )}

            <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-neutral-900 dark:text-white">
                    {request.to.name}
                </h3>
                <p className="truncate text-sm text-neutral-500 dark:text-neutral-400">
                    {request.to.email}
                </p>
                <p className="mt-1 text-xs text-neutral-400">
                    Gesendet am {formatDate(request.createdAt)}
                </p>
            </div>

            <div
                className={cn(
                    'hidden items-center gap-1 rounded-full px-2 py-1 sm:flex',
                    'bg-amber-100 text-xs text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                )}
            >
                <Clock className="size-3" />
                Ausstehend
            </div>

            <Button
                variant="ghost"
                size="sm"
                onClick={() => onCancel(request.id)}
                disabled={isLoading}
                className="text-neutral-500 hover:text-red-600 dark:hover:text-red-400"
            >
                Zurueckziehen
            </Button>
        </div>
    )
}
