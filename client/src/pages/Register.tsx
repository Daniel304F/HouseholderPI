import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Headline } from '../components/Headline'
import { UserPlus, Eye, EyeOff, Check, X } from 'lucide-react'

interface PasswordRequirement {
    id: string
    label: string
    validator: (password: string) => boolean
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
    {
        id: 'length',
        label: 'Mindestens 8 Zeichen',
        validator: (pw) => pw.length >= 8,
    },
    {
        id: 'uppercase',
        label: 'Ein Großbuchstabe',
        validator: (pw) => /[A-Z]/.test(pw),
    },
    {
        id: 'lowercase',
        label: 'Ein Kleinbuchstabe',
        validator: (pw) => /[a-z]/.test(pw),
    },
    {
        id: 'number',
        label: 'Eine Zahl',
        validator: (pw) => /[0-9]/.test(pw),
    },
    {
        id: 'special',
        label: 'Ein Sonderzeichen (!@#$%^&*)',
        validator: (pw) => /[!@#$%^&*(),.?":{}|<>]/.test(pw),
    },
]

const getStrengthColor = (strength: number): string => {
    if (strength === 0) return 'bg-neutral-300 dark:bg-neutral-600'
    if (strength <= 2) return 'bg-error-500'
    if (strength <= 3) return 'bg-warning-500'
    if (strength <= 4) return 'bg-info-500'
    return 'bg-success-500'
}

const getStrengthLabel = (strength: number): string => {
    if (strength === 0) return ''
    if (strength <= 2) return 'Schwach'
    if (strength <= 3) return 'Mittel'
    if (strength <= 4) return 'Gut'
    return 'Stark'
}

const getStrengthLabelColor = (strength: number): string => {
    if (strength === 0) return 'text-neutral-500'
    if (strength <= 2) return 'text-error-500'
    if (strength <= 3) return 'text-warning-600 dark:text-warning-400'
    if (strength <= 4) return 'text-info-600 dark:text-info-400'
    return 'text-success-600 dark:text-success-400'
}

export const Register = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isPasswordFocused, setIsPasswordFocused] = useState(false)
    const [errors, setErrors] = useState<{
        name?: string
        email?: string
        password?: string
        confirmPassword?: string
    }>({})

    const passwordStrength = useMemo(() => {
        return PASSWORD_REQUIREMENTS.filter((req) => req.validator(password))
            .length
    }, [password])

    const requirementsMet = useMemo(() => {
        return PASSWORD_REQUIREMENTS.map((req) => ({
            ...req,
            met: req.validator(password),
        }))
    }, [password])

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
            // TODO: API anbinden
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
                            type="text"
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
                            <div className="relative">
                                <Input
                                    label="Passwort"
                                    type={showPassword ? 'text' : 'password'}
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
                                    className="pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute top-[38px] right-3 text-neutral-500 transition-colors hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                                    aria-label={
                                        showPassword
                                            ? 'Passwort verbergen'
                                            : 'Passwort anzeigen'
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff size={20} />
                                    ) : (
                                        <Eye size={20} />
                                    )}
                                </button>
                            </div>

                            {/* Password Strength Indicator */}
                            {password.length > 0 && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex flex-1 gap-1">
                                            {Array.from({ length: 5 }).map(
                                                (_, index) => (
                                                    <div
                                                        key={index}
                                                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                                            index <
                                                            passwordStrength
                                                                ? getStrengthColor(
                                                                      passwordStrength
                                                                  )
                                                                : 'bg-neutral-200 dark:bg-neutral-700'
                                                        }`}
                                                    />
                                                )
                                            )}
                                        </div>
                                        <span
                                            className={`text-xs font-medium ${getStrengthLabelColor(passwordStrength)}`}
                                        >
                                            {getStrengthLabel(passwordStrength)}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Password Requirements */}
                            {(isPasswordFocused || password.length > 0) && (
                                <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-800/50">
                                    <p className="mb-2 text-xs font-medium text-neutral-600 dark:text-neutral-400">
                                        Passwort-Anforderungen:
                                    </p>
                                    <ul className="space-y-1">
                                        {requirementsMet.map((req) => (
                                            <li
                                                key={req.id}
                                                className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
                                                    req.met
                                                        ? 'text-success-600 dark:text-success-400'
                                                        : 'text-neutral-500 dark:text-neutral-400'
                                                }`}
                                            >
                                                {req.met ? (
                                                    <Check
                                                        size={14}
                                                        className="flex-shrink-0"
                                                    />
                                                ) : (
                                                    <X
                                                        size={14}
                                                        className="flex-shrink-0"
                                                    />
                                                )}
                                                <span>{req.label}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <Input
                                label="Passwort bestätigen"
                                type={showConfirmPassword ? 'text' : 'password'}
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
                                className="pr-12"
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                }
                                className="absolute top-[38px] right-3 text-neutral-500 transition-colors hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                                aria-label={
                                    showConfirmPassword
                                        ? 'Passwort verbergen'
                                        : 'Passwort anzeigen'
                                }
                            >
                                {showConfirmPassword ? (
                                    <EyeOff size={20} />
                                ) : (
                                    <Eye size={20} />
                                )}
                            </button>
                        </div>

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
