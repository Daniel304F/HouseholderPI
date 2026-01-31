import { useState } from 'react'
import { Lock, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'
import { Button, Input, Card } from '../common'

interface SecuritySectionProps {
    onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>
    isUpdating: boolean
}

export const SecuritySection = ({
    onChangePassword,
    isUpdating,
}: SecuritySectionProps) => {
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSuccess(false)

        if (newPassword !== confirmPassword) {
            setError('Die Passwörter stimmen nicht überein')
            return
        }

        if (newPassword.length < 8) {
            setError('Das neue Passwort muss mindestens 8 Zeichen lang sein')
            return
        }

        try {
            await onChangePassword(currentPassword, newPassword)
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch {
            setError('Passwort konnte nicht geändert werden. Bitte überprüfe dein aktuelles Passwort.')
        }
    }

    return (
        <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
                <Lock className="size-5 text-brand-500" />
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    Passwort ändern
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                    <Input
                        label="Aktuelles Passwort"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-9 text-neutral-400 hover:text-neutral-600"
                    >
                        {showCurrentPassword ? (
                            <EyeOff className="size-4" />
                        ) : (
                            <Eye className="size-4" />
                        )}
                    </button>
                </div>

                <div className="relative">
                    <Input
                        label="Neues Passwort"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-9 text-neutral-400 hover:text-neutral-600"
                    >
                        {showNewPassword ? (
                            <EyeOff className="size-4" />
                        ) : (
                            <Eye className="size-4" />
                        )}
                    </button>
                </div>

                <Input
                    label="Neues Passwort bestätigen"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />

                {error && (
                    <p className="text-sm text-error-600 dark:text-error-400">
                        {error}
                    </p>
                )}

                {success && (
                    <div className="flex items-center gap-2 text-sm text-success-600 dark:text-success-400">
                        <CheckCircle className="size-4" />
                        Passwort erfolgreich geändert
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={isUpdating || !currentPassword || !newPassword || !confirmPassword}
                    icon={isUpdating ? <Loader2 className="size-4 animate-spin" /> : undefined}
                >
                    {isUpdating ? 'Wird geändert...' : 'Passwort ändern'}
                </Button>
            </form>
        </Card>
    )
}
