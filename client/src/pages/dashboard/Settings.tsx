import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/common'
import {
    ProfileSection,
    SecuritySection,
    EmailSection,
    DangerZoneSection,
} from '../../components/settings'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { userApi, type UpdateProfileRequest } from '../../api/user'

export const Settings = () => {
    const navigate = useNavigate()
    const { user, updateProfile, logout } = useAuth()
    const toast = useToast()

    const updateMutation = useMutation({
        mutationFn: (data: UpdateProfileRequest) => userApi.updateProfile(data),
        onSuccess: (updatedUser) => {
            updateProfile(updatedUser)
            toast.success('Profil erfolgreich aktualisiert')
        },
        onError: () => {
            toast.error('Profil konnte nicht aktualisiert werden')
        },
    })

    const changePasswordMutation = useMutation({
        mutationFn: ({
            currentPassword,
            newPassword,
        }: {
            currentPassword: string
            newPassword: string
        }) => userApi.changePassword({ currentPassword, newPassword }),
        onSuccess: () => {
            toast.success('Passwort erfolgreich geändert')
        },
        onError: () => {
            toast.error('Passwort konnte nicht geändert werden')
        },
    })

    const changeEmailMutation = useMutation({
        mutationFn: ({
            newEmail,
            password,
        }: {
            newEmail: string
            password: string
        }) => userApi.changeEmail({ newEmail, password }),
        onSuccess: (updatedUser) => {
            updateProfile(updatedUser)
            toast.success('E-Mail erfolgreich geändert')
        },
        onError: () => {
            toast.error('E-Mail konnte nicht geändert werden')
        },
    })

    const deleteAccountMutation = useMutation({
        mutationFn: (password: string) =>
            userApi.deleteAccount({ password, confirmation: 'DELETE' }),
        onSuccess: async () => {
            await logout()
            navigate('/')
        },
        onError: () => {
            toast.error('Konto konnte nicht gelöscht werden')
        },
    })

    const handleUpdateProfile = async (data: UpdateProfileRequest) => {
        await updateMutation.mutateAsync(data)
    }

    const handleChangePassword = async (
        currentPassword: string,
        newPassword: string
    ) => {
        await changePasswordMutation.mutateAsync({ currentPassword, newPassword })
    }

    const handleChangeEmail = async (newEmail: string, password: string) => {
        await changeEmailMutation.mutateAsync({ newEmail, password })
    }

    const handleDeleteAccount = async (password: string) => {
        await deleteAccountMutation.mutateAsync(password)
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

            <div className="max-w-2xl space-y-6">
                <ProfileSection
                    user={user}
                    onUpdateProfile={handleUpdateProfile}
                    isUpdating={updateMutation.isPending}
                />

                <EmailSection
                    currentEmail={user.email}
                    onChangeEmail={handleChangeEmail}
                    isUpdating={changeEmailMutation.isPending}
                />

                <SecuritySection
                    onChangePassword={handleChangePassword}
                    isUpdating={changePasswordMutation.isPending}
                />

                <DangerZoneSection
                    onDeleteAccount={handleDeleteAccount}
                    isDeleting={deleteAccountMutation.isPending}
                />
            </div>
        </div>
    )
}
