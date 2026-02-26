import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    UserPlus,
    Home,
    ShieldCheck,
    Zap,
    Trophy,
    HeartHandshake,
    ArrowLeft,
} from 'lucide-react'
import { Button, Input } from '../components/common'
import { AlertBanner } from '../components/ui'
import { PasswordInput, PasswordStrengthMeter } from '../components/forms'
import { PasswordRequirementsList } from '../components/auth/PasswordRequirementsList'
import {
    calculatePasswordStrength,
    PASSWORD_REQUIREMENTS,
} from '../utils/passwordUtils'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { getErrorMessage, isApiError } from '../lib/axios'
import { cn } from '../utils/cn'

const benefits = [
    {
        icon: HeartHandshake,
        title: 'Faire Aufteilung',
        desc: 'Aufgaben werden transparent nach Verfügbarkeit & Beitrag verteilt.',
    },
    {
        icon: Zap,
        title: 'Sofort loslegen',
        desc: 'Gruppe erstellen, Mitglieder einladen – in weniger als 2 Minuten.',
    },
    {
        icon: Trophy,
        title: 'Motiviert bleiben',
        desc: 'Statistiken und Erfolge halten dein WG-Team engagiert.',
    },
    {
        icon: ShieldCheck,
        title: 'Sicher & privat',
        desc: 'Deine Daten gehören dir. Verschlüsselt und sicher gespeichert.',
    },
]

export const Register = () => {
    const { register } = useAuth()
    const navigate = useNavigate()
    const toast = useToast()

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
            toast.success('Erfolgreich registriert!')
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
        <div className="flex min-h-screen bg-white dark:bg-neutral-950">
            {/* ── Left Panel ─────────────────────────────────────────────── */}
            <div className="relative hidden overflow-hidden lg:flex lg:w-[42%] xl:w-[40%] flex-col">
                {/* Gradient – slightly different angle / stop from Login */}
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-950 via-brand-800 to-brand-600" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(258,56%,52%,0.2),transparent_55%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(183,56%,44%,0.18),transparent_50%)]" />

                {/* Animated blobs */}
                <div className="login-blob-1 absolute -bottom-28 -left-20 size-80 rounded-full bg-brand-400/22 blur-3xl" />
                <div className="login-blob-2 absolute -top-16 right-0 size-64 rounded-full bg-teal-400/16 blur-3xl" />
                <div className="login-blob-3 absolute top-2/3 left-1/4 size-72 rounded-full bg-violet-500/12 blur-3xl" />

                {/* Cross-hatch overlay */}
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage:
                            'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
                        backgroundSize: '32px 32px',
                    }}
                />

                {/* ── Content ── */}
                <div className="relative z-10 flex h-full flex-col p-10 xl:p-12">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
                            <Home className="size-5 text-white" />
                        </div>
                        <span className="text-lg font-bold text-white/90 tracking-tight">
                            HouseholderPI
                        </span>
                    </div>

                    {/* Hero */}
                    <div className="mt-auto mb-auto pt-14">
                        <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight tracking-tight">
                            Starte noch heute
                            <br />
                            <span className="text-brand-300">
                                mit deiner WG.
                            </span>
                        </h1>
                        <p className="mt-4 max-w-xs text-sm text-brand-100/75 leading-relaxed">
                            Erstelle kostenlos ein Konto und erlebe, wie einfach
                            Haushalt sein kann – für alle.
                        </p>

                        {/* Benefits */}
                        <div className="mt-9 grid grid-cols-1 gap-3.5">
                            {benefits.map(({ icon: Icon, title, desc }) => (
                                <div
                                    key={title}
                                    className="flex items-start gap-3 rounded-xl bg-white/8 p-3.5 ring-1 ring-white/10"
                                >
                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-400/20">
                                        <Icon className="size-4 text-brand-300" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white/90">
                                            {title}
                                        </p>
                                        <p className="mt-0.5 text-xs text-brand-200/65 leading-relaxed">
                                            {desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer note */}
                    <p className="text-xs text-brand-300/60 mt-auto">
                        Kostenlos · Keine Kreditkarte erforderlich
                    </p>
                </div>
            </div>

            {/* ── Right Panel – Register Form ─────────────────────────────── */}
            <div className="flex w-full flex-col items-center justify-center px-6 py-10 lg:w-[58%] xl:w-[60%]">
                {/* Mobile logo */}
                <div className="mb-6 flex items-center gap-2.5 lg:hidden">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-brand-600">
                        <Home className="size-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-neutral-900 dark:text-white">
                        HouseholderPI
                    </span>
                </div>

                <div className="w-full max-w-md">
                    <div className="mb-7">
                        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                            Konto erstellen
                        </h2>
                        <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                            Registriere dich, um mit deiner WG durchzustarten.
                        </p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        {errors.general && (
                            <AlertBanner message={errors.general} />
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
                                        setErrors({
                                            ...errors,
                                            password: undefined,
                                        })
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
                                Konto erstellen
                            </Button>
                        </div>
                    </form>

                    <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
                        Bereits ein Konto?{' '}
                        <Link
                            to="/login"
                            className={cn(
                                'inline-flex items-center gap-1 font-medium',
                                'text-brand-600 hover:text-brand-700 hover:underline',
                                'dark:text-brand-400 dark:hover:text-brand-300'
                            )}
                        >
                            <ArrowLeft className="size-3.5" />
                            Jetzt einloggen
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
