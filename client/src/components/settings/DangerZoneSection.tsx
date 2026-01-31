import { useState } from 'react'
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Button, Input, Card } from '../common'

interface DangerZoneSectionProps {
    onDeleteAccount: (password: string) => Promise<void>
    isDeleting: boolean
}

export const DangerZoneSection = ({
    onDeleteAccount,
    isDeleting,
}: DangerZoneSectionProps) => {
    const [showConfirm, setShowConfirm] = useState(false)
    const [password, setPassword] = useState('')
    const [confirmation, setConfirmation] = useState('')
    const [error, setError] = useState<string | null>(null)

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (confirmation !== 'DELETE') {
            setError('Bitte gib "DELETE" ein um zu bestätigen')
            return
        }

        try {
            await onDeleteAccount(password)
        } catch {
            setError('Konto konnte nicht gelöscht werden. Bitte überprüfe dein Passwort.')
        }
    }

    const handleCancel = () => {
        setShowConfirm(false)
        setPassword('')
        setConfirmation('')
        setError(null)
    }

    return (
        <Card className="border-error-200 bg-error-50/50 p-6 dark:border-error-800/50 dark:bg-error-900/10">
            <div className="mb-4 flex items-center gap-2">
                <AlertTriangle className="size-5 text-error-500" />
                <h2 className="text-lg font-semibold text-error-700 dark:text-error-400">
                    Gefahrenzone
                </h2>
            </div>

            {!showConfirm ? (
                <div>
                    <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
                        Wenn du dein Konto löschst, werden alle deine Daten unwiderruflich gelöscht.
                        Du wirst aus allen Gruppen entfernt und deine Aufgaben werden nicht mehr zugeordnet.
                    </p>
                    <Button
                        variant="ghost"
                        onClick={() => setShowConfirm(true)}
                        className="text-error-600 hover:bg-error-100 hover:text-error-700 dark:text-error-400 dark:hover:bg-error-900/20"
                        icon={<Trash2 className="size-4" />}
                    >
                        Konto löschen
                    </Button>
                </div>
            ) : (
                <form onSubmit={handleDelete} className="space-y-4">
                    <div className="rounded-lg bg-error-100 p-4 dark:bg-error-900/30">
                        <p className="text-sm font-medium text-error-800 dark:text-error-300">
                            Bist du sicher? Diese Aktion kann nicht rückgängig gemacht werden.
                        </p>
                    </div>

                    <Input
                        label="Passwort zur Bestätigung"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            Gib <span className="font-bold text-error-600">DELETE</span> ein um zu bestätigen
                        </label>
                        <input
                            type="text"
                            value={confirmation}
                            onChange={(e) => setConfirmation(e.target.value)}
                            placeholder="DELETE"
                            className={cn(
                                'w-full rounded-lg border px-4 py-2.5 text-sm transition-colors',
                                'border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800',
                                'focus:border-error-500 focus:ring-error-500/20 focus:outline-none focus:ring-2',
                                confirmation === 'DELETE' && 'border-error-500 bg-error-50 dark:bg-error-900/20'
                            )}
                            required
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-error-600 dark:text-error-400">
                            {error}
                        </p>
                    )}

                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleCancel}
                            disabled={isDeleting}
                        >
                            Abbrechen
                        </Button>
                        <Button
                            type="submit"
                            disabled={isDeleting || !password || confirmation !== 'DELETE'}
                            className="bg-error-600 hover:bg-error-700"
                            icon={isDeleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                        >
                            {isDeleting ? 'Wird gelöscht...' : 'Konto endgültig löschen'}
                        </Button>
                    </div>
                </form>
            )}
        </Card>
    )
}
