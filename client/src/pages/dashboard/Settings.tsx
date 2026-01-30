import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { PageHeader } from '../../components/common'
import { ProfileSection } from '../../components/settings'
import { useAuth } from '../../contexts/AuthContext'
import { userApi, type UpdateProfileRequest } from '../../api/user'

export const Settings = () => {
    const { user, updateProfile } = useAuth()
    const [error, setError] = useState<string | null>(null)

    const updateMutation = useMutation({
        mutationFn: (data: UpdateProfileRequest) => userApi.updateProfile(data),
        onSuccess: (updatedUser) => {
            updateProfile(updatedUser)
            setError(null)
        },
        onError: () => {
            setError('Profil konnte nicht aktualisiert werden')
        },
    })

    const handleUpdateProfile = async (data: UpdateProfileRequest) => {
        await updateMutation.mutateAsync(data)
    }

    if (!user) {
        return null
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Einstellungen"
                subtitle="Verwalte dein Profil und Kontoeinstellungen"
            />

            {error && (
                <div className="rounded-lg bg-error-50 p-4 text-error-700 dark:bg-error-900/20 dark:text-error-400">
                    {error}
                </div>
            )}

            <div className="max-w-2xl">
                <ProfileSection
                    user={user}
                    onUpdateProfile={handleUpdateProfile}
                    isUpdating={updateMutation.isPending}
                />
            </div>
        </div>
    )
}
