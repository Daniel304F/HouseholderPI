import { useState } from 'react'
import { UserPlus, X, Mail, Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Button, Input, IconButton } from '../common'

interface AddFriendModalProps {
    isOpen: boolean
    onClose: () => void
    onSendRequest: (email: string) => Promise<void>
}

export const AddFriendModal = ({
    isOpen,
    onClose,
    onSendRequest,
}: AddFriendModalProps) => {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!email.trim()) {
            setError('Bitte gib eine E-Mail-Adresse ein')
            return
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            setError('Bitte gib eine gültige E-Mail-Adresse ein')
            return
        }

        setIsLoading(true)
        try {
            await onSendRequest(email)
            setEmail('')
            onClose()
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message)
            } else {
                setError('Ein Fehler ist aufgetreten')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleClose = () => {
        setEmail('')
        setError(null)
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div
                className={cn(
                    'relative w-full max-w-md rounded-2xl',
                    'bg-white dark:bg-neutral-800',
                    'p-6 shadow-xl'
                )}
            >
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className={cn(
                                'flex size-10 items-center justify-center rounded-xl',
                                'bg-brand-100 dark:bg-brand-900/30'
                            )}
                        >
                            <UserPlus className="text-brand-600 dark:text-brand-400 size-5" />
                        </div>
                        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                            Freund hinzufügen
                        </h2>
                    </div>
                    <IconButton
                        icon={<X className="size-5" />}
                        variant="ghost"
                        size="sm"
                        onClick={handleClose}
                        aria-label="Schließen"
                    />
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                        >
                            E-Mail-Adresse
                        </label>
                        <div className="relative">
                            <Mail className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-neutral-400" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="freund@beispiel.de"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10"
                                disabled={isLoading}
                            />
                        </div>
                        {error && (
                            <p className="mt-2 text-sm text-red-500">{error}</p>
                        )}
                    </div>

                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Gib die E-Mail-Adresse deines Freundes ein, um eine
                        Freundschaftsanfrage zu senden.
                    </p>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            Abbrechen
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || !email.trim()}
                            icon={
                                isLoading ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <UserPlus className="size-4" />
                                )
                            }
                        >
                            {isLoading ? 'Wird gesendet...' : 'Anfrage senden'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
