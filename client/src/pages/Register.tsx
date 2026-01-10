import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { UserPlus } from 'lucide-react'

import { PasswordInput } from '../components/auth/PasswordInput'
import { PasswordRequirementsList } from '../components/auth/PasswordRequirementsList'
import {
    calculatePasswordStrength,
    PASSWORD_REQUIREMENTS,
} from '../utils/passwordUtils'
import { Input } from '../components/Input'
import { PasswordStrengthMeter } from '../components/PasswordStrengthMeter'
import { Button } from '../components/Button'
import { useRegister } from '../hooks/useAuth'
import { getErrorMessage, isApiError } from '../lib/axios'
import { AuthFormLayout } from '../layouts/AuthFormLayout'

export const Register = () => {
    const { mutate: register, isPending } = useRegister()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const [isPasswordFocused, setIsPasswordFocused] = useState(false)

    const [errors, setErrors] = useState<{
        name?: string
        email?: string
        password?: string
        confirmPassword?: string
    }>({})

    const passwordStrength = useMemo(
        () => calculatePasswordStrength(password),
        [password]
    )

    const validate = () => {
        const newErrors: typeof errors = {}
        let isValid = true

        if (!name.trim()) {
            newErrors.name = 'Name ist erforderlich.'
            isValid = false
        }

        if (!email) {
            newErrors.email = 'E-Mail ist erforderlich.'
            isValid = false
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Bitte gib eine gültige E-Mail ein.'
            isValid = false
        }

        if (!password) {
            newErrors.password = 'Passwort ist erforderlich.'
            isValid = false
        } else if (passwordStrength < PASSWORD_REQUIREMENTS.length) {
            newErrors.password = 'Passwort erfüllt nicht alle Anforderungen.'
            isValid = false
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Bitte bestätige dein Passwort.'
            isValid = false
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwörter stimmen nicht überein.'
            isValid = false
        }

        setErrors(newErrors)
        return isValid
    }
    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault()

        if (validate()) {
            register(
                { name, email, password },
                {
                    onError: (error) => {
                        if (
                            isApiError(error) &&
                            error.response?.status === 409
                        ) {
                            // 409 Conflict: Email existiert schon
                            setErrors((prev) => ({
                                ...prev,
                                email: 'Diese E-Mail Adresse wird bereits verwendet.',
                            }))
                        } else {
                            // Allgemeiner Fehler
                            setErrors((prev) => ({
                                ...prev,
                                general: getErrorMessage(error),
                            }))
                        }
                    },
                }
            )
        }
    }
    return (
        <AuthFormLayout
            title="Konto erstellen"
            subtitle="Registriere dich, um mit deiner WG durchzustarten."
            cardTitle="Registrierung"
            footer={
                <>
                    Bereits ein Konto?{' '}
                    <Link
                        to="/login"
                        className="text-brand-600 dark:text-brand-400 font-medium hover:underline"
                    >
                        Jetzt einloggen
                    </Link>
                </>
            }
        >
            <form onSubmit={handleRegister} className="space-y-4">
                <Input
                    label="Name"
                    placeholder="Max Mustermann"
                    required
                    disabled={isPending}
                    autoFocus
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value)
                        if (errors.name)
                            setErrors({ ...errors, name: undefined })
                    }}
                    error={errors.name}
                />

                <Input
                    label="E-Mail Adresse"
                    type="email"
                    placeholder="deine-mail@beispiel.de"
                    required
                    disabled={isPending}
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value)
                        if (errors.email)
                            setErrors({ ...errors, email: undefined })
                    }}
                    error={errors.email}
                />

                <div className="space-y-2">
                    <PasswordInput
                        label="Passwort"
                        placeholder="••••••••"
                        required
                        value={password}
                        disabled={isPending}
                        onChange={(e) => {
                            setPassword(e.target.value)
                            if (errors.password)
                                setErrors({ ...errors, password: undefined })
                        }}
                        onFocus={() => setIsPasswordFocused(true)}
                        onBlur={() => setIsPasswordFocused(false)}
                        error={errors.password}
                    />

                    <PasswordStrengthMeter strength={passwordStrength} />

                    {(isPasswordFocused || password.length > 0) && (
                        <PasswordRequirementsList password={password} />
                    )}
                </div>

                <PasswordInput
                    label="Passwort bestätigen"
                    placeholder="••••••••"
                    required
                    value={confirmPassword}
                    disabled={isPending}
                    onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        if (errors.confirmPassword)
                            setErrors({ ...errors, confirmPassword: undefined })
                    }}
                    error={errors.confirmPassword}
                />

                <div className="pt-2">
                    <Button
                        fullWidth
                        type="submit"
                        isLoading={isPending}
                        icon={<UserPlus size={18} />}
                    >
                        Registrieren
                    </Button>
                </div>
            </form>
        </AuthFormLayout>
    )
}
