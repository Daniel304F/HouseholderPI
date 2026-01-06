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
import { Card } from '../components/Card'
import { Headline } from '../components/Headline'
import { PasswordStrengthMeter } from '../components/PasswordStrengthMeter'
import { Button } from '../components/Button'

export const Register = () => {
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
            setIsLoading(true)
            // TODO: API Call
            setTimeout(() => {
                setIsLoading(false)
                navigate('/login')
            }, 1500)
        }
    }

    return (
        <div className="flex w-full items-center justify-center py-12">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <Headline
                        title="Konto erstellen"
                        subtitle="Registriere dich, um mit deiner WG durchzustarten."
                    />
                </div>
                <Card title="Registrierung">
                    <form onSubmit={handleRegister} className="space-y-4">
                        <Input
                            label="Name"
                            placeholder="Max Mustermann"
                            required
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
                                onChange={(e) => {
                                    setPassword(e.target.value)
                                    if (errors.password)
                                        setErrors({
                                            ...errors,
                                            password: undefined,
                                        })
                                }}
                                onFocus={() => setIsPasswordFocused(true)}
                                onBlur={() => setIsPasswordFocused(false)}
                                error={errors.password}
                            />

                            <PasswordStrengthMeter
                                strength={passwordStrength}
                            />

                            {(isPasswordFocused || password.length > 0) && (
                                <PasswordRequirementsList password={password} />
                            )}
                        </div>

                        <PasswordInput
                            label="Passwort bestätigen"
                            placeholder="••••••••"
                            required
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value)
                                if (errors.confirmPassword)
                                    setErrors({
                                        ...errors,
                                        confirmPassword: undefined,
                                    })
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
                </Card>

                <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
                    Bereits ein Konto?{' '}
                    <Link
                        to="/login"
                        className="text-brand-600 dark:text-brand-400 font-medium hover:underline"
                    >
                        Jetzt einloggen
                    </Link>
                </p>
            </div>
        </div>
    )
}
