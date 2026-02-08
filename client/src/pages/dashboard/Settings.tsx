import { lazy, Suspense } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/common'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { userApi, type UpdateProfileRequest } from '../../api/user'
import { Skeleton } from '../../components/feedback'

const ProfileSection = lazy(() =>
    import('../../components/settings').then((module) => ({
        default: module.ProfileSection,
    }))
)
const SecuritySection = lazy(() =>
    import('../../components/settings').then((module) => ({
        default: module.SecuritySection,
    }))
)
const EmailSection = lazy(() =>
    import('../../components/settings').then((module) => ({
        default: module.EmailSection,
    }))
)
const DangerZoneSection = lazy(() =>
    import('../../components/settings').then((module) => ({
        default: module.DangerZoneSection,
    }))
)
const NotificationsSection = lazy(() =>
    import('../../components/settings').then((module) => ({
        default: module.NotificationsSection,
    }))
)

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
        <div className="ui-page-enter space-y-6">
            <PageHeader
                title="Einstellungen"
                subtitle="Verwalte dein Profil und Kontoeinstellungen"
            />

            {/* 2-Column Grid Layout */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Left Column - Profile & Email */}
                <div className="ui-panel ui-panel-hover space-y-6 p-4 sm:p-5">
                    <Suspense fallback={<Skeleton height={280} className="rounded-xl" />}>
                        <ProfileSection
                            user={user}
                            onUpdateProfile={handleUpdateProfile}
                            isUpdating={updateMutation.isPending}
                        />
                    </Suspense>

                    <Suspense fallback={<Skeleton height={220} className="rounded-xl" />}>
                        <EmailSection
                            currentEmail={user.email}
                            onChangeEmail={handleChangeEmail}
                            isUpdating={changeEmailMutation.isPending}
                        />
                    </Suspense>
                </div>

                {/* Right Column - Security & Danger Zone */}
                <div className="ui-panel ui-panel-hover space-y-6 p-4 sm:p-5">
                    <Suspense fallback={<Skeleton height={220} className="rounded-xl" />}>
                        <SecuritySection
                            onChangePassword={handleChangePassword}
                            isUpdating={changePasswordMutation.isPending}
                        />
                    </Suspense>

                    <Suspense fallback={<Skeleton height={170} className="rounded-xl" />}>
                        <NotificationsSection />
                    </Suspense>

                    <Suspense fallback={<Skeleton height={220} className="rounded-xl" />}>
                        <DangerZoneSection
                            onDeleteAccount={handleDeleteAccount}
                            isDeleting={deleteAccountMutation.isPending}
                        />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}
