import { Bell, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button, Card } from '../common'
import { usePushNotifications } from '../../hooks/usePushNotifications'
import { useToast } from '../../contexts/ToastContext'

export const NotificationsSection = () => {
    const toast = useToast()
    const { isSupported, permission, isSubscribed, isLoading, subscribeToPush } =
        usePushNotifications()

    const handleEnable = async () => {
        const success = await subscribeToPush()
        if (success) {
            toast.success('Push-Benachrichtigungen aktiviert')
        } else if (Notification.permission === 'denied') {
            toast.error(
                'Benachrichtigungen wurden im Browser blockiert. Bitte in den Browser-Einstellungen freigeben.'
            )
        } else {
            toast.error('Push-Benachrichtigungen konnten nicht aktiviert werden')
        }
    }

    if (!isSupported) {
        return (
            <Card className="p-6">
                <div className="mb-4 flex items-center gap-2">
                    <Bell className="size-5 text-brand-500" />
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                        Benachrichtigungen
                    </h2>
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Dein Browser unterstützt keine Push-Benachrichtigungen.
                </p>
            </Card>
        )
    }

    return (
        <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
                <Bell className="size-5 text-brand-500" />
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    Benachrichtigungen
                </h2>
            </div>

            <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
                Erhalte Push-Benachrichtigungen, wenn dir eine Aufgabe zugewiesen
                oder eine deiner Aufgaben aktualisiert wird.
            </p>

            {/* Status */}
            {isSubscribed && permission === 'granted' && (
                <div className="mb-4 flex items-center gap-2 text-sm text-success-600 dark:text-success-400">
                    <CheckCircle className="size-4" />
                    Push-Benachrichtigungen sind aktiv für dieses Gerät.
                </div>
            )}

            {permission === 'denied' && (
                <div className="mb-4 flex items-center gap-2 text-sm text-error-600 dark:text-error-400">
                    <XCircle className="size-4" />
                    Benachrichtigungen wurden im Browser blockiert. Bitte in
                    den Browser-Einstellungen für diese Seite freigeben.
                </div>
            )}

            {/* Action */}
            {permission !== 'denied' && !isSubscribed && (
                <Button
                    onClick={handleEnable}
                    disabled={isLoading}
                    icon={
                        isLoading ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <Bell className="size-4" />
                        )
                    }
                >
                    {isLoading
                        ? 'Wird aktiviert...'
                        : 'Benachrichtigungen aktivieren'}
                </Button>
            )}

            {isSubscribed && permission === 'granted' && (
                <Button
                    onClick={handleEnable}
                    variant="secondary"
                    disabled={isLoading}
                    icon={
                        isLoading ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : undefined
                    }
                >
                    {isLoading ? 'Wird erneuert...' : 'Subscription erneuern'}
                </Button>
            )}
        </Card>
    )
}
