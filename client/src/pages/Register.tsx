import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
import { useAuth } from '../contexts/AuthContext'
import { getErrorMessage, isApiError } from '../lib/axios'
import { AuthFormLayout } from '../layouts/AuthFormLayout'

export const Register = () => {
    const { register } = useAuth()
    const navigate = useNavigate()

    const [isLoading, setIsLoading] = useState(false)
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
        general?: string
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

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors({})

        if (!validate()) return

        setIsLoading(true)

        try {
            await register({ name, email, password })
            navigate('/dashboard', { replace: true })
        } catch (error) {
            if (isApiError(error) && error.response?.status === 409) {
                setErrors({
                    email: 'Diese E-Mail Adresse wird bereits verwendet.',
                })
            } else {
                setErrors({ general: getErrorMessage(error) })
            }
        } finally {
            setIsLoading(false)
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
                {errors.general && (
                    <div className="border-error-200 bg-error-50 text-error-600 dark:border-error-800 dark:bg-error-950 dark:text-error-400 rounded-lg border p-3 text-sm">
                        {errors.general}
                    </div>
                )}

                <Input
                    label="Name"
                    placeholder="Max Mustermann"
                    required
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                        disabled={isLoading}
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
                    disabled={isLoading}
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
                        isLoading={isLoading}
                        icon={<UserPlus size={18} />}
                    >
                        Registrieren
                    </Button>
                </div>
            </form>
        </AuthFormLayout>
    )
}
