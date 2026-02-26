import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
    LogIn,
    Home,
    CheckSquare,
    Users,
    Calendar,
    Sparkles,
    ArrowRight,
    Star,
} from 'lucide-react'
import { Button, Input } from '../components/common'
import { AlertBanner } from '../components/ui'
import { PasswordInput } from '../components/forms'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { isApiError, getErrorMessage } from '../lib/axios'
import { cn } from '../utils/cn'

const quotes = [
    {
        text: 'Endlich kein Chaos mehr in unserer WG!',
        author: 'Jonas, 24 · Student',
    },
    {
        text: 'Die faire Aufgabenverteilung hat unser Zusammenleben revolutioniert.',
        author: 'Sarah & Tim · Wohngemeinschaft',
    },
    {
        text: 'Mit HouseholderPI läuft unser Haushalt wie von selbst.',
        author: 'Nina, 26 · Designerin',
    },
    {
        text: 'Einfach unersetzlich — ich würde nie ohne es leben wollen.',
        author: 'Das WG-Team aus München',
    },
]

const features = [
    { icon: CheckSquare, text: 'Kanban Board für alle Haushaltsaufgaben' },
    { icon: Users, text: 'Faire & transparente Aufgabenverteilung' },
    { icon: Sparkles, text: 'KI-gestützte Haushaltsplanung' },
    { icon: Calendar, text: 'Google Kalender Integration' },
]

export const Login = () => {
    const { login } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const toast = useToast()

    const [isLoading, setIsLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errors, setErrors] = useState<{
        email?: string
        password?: string
        general?: string
    }>({})
    const [activeQuote, setActiveQuote] = useState(0)

    const from =
        (location.state as { from?: Location })?.from?.pathname || '/dashboard'

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveQuote((prev) => (prev + 1) % quotes.length)
        }, 4500)
        return () => clearInterval(interval)
    }, [])

    const validate = () => {
        const newErrors: typeof errors = {}
        let isValid = true

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
        }

        setErrors(newErrors)
        return isValid
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors({})

        if (!validate()) return

        setIsLoading(true)

        try {
            await login({ email, password })
            toast.success('Erfolgreich eingeloggt')
            navigate(from, { replace: true })
        } catch (error) {
            if (isApiError(error) && error.response?.status === 401) {
                setErrors({ general: 'E-Mail oder Passwort ist falsch.' })
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
            <div className="relative hidden overflow-hidden lg:flex lg:w-[58%] xl:w-[55%] flex-col">
                {/* Layered gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-800 to-brand-950" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(183,56%,44%,0.22),transparent_55%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(258,56%,52%,0.14),transparent_50%)]" />

                {/* Animated blobs */}
                <div className="login-blob-1 absolute -top-28 -left-28 size-[26rem] rounded-full bg-brand-400/20 blur-3xl" />
                <div className="login-blob-2 absolute top-1/3 -right-20 size-72 rounded-full bg-teal-400/18 blur-3xl" />
                <div className="login-blob-3 absolute -bottom-24 left-1/3 size-96 rounded-full bg-brand-500/25 blur-3xl" />

                {/* Dot-grid overlay */}
                <div
                    className="absolute inset-0 opacity-[0.045]"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle, white 1.2px, transparent 1.2px)',
                        backgroundSize: '30px 30px',
                    }}
                />

                {/* ── Content ── */}
                <div className="relative z-10 flex h-full flex-col p-10 xl:p-14">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
                            <Home className="size-5 text-white" />
                        </div>
                        <span className="text-lg font-bold text-white/90 tracking-tight">
                            HouseholderPI
                        </span>
                    </div>

                    {/* Hero text */}
                    <div className="mt-auto mb-auto pt-14">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-brand-200 ring-1 ring-white/15">
                            <Sparkles className="size-3.5" />
                            Dein smarter Haushaltskompagnon
                        </div>
                        <h1 className="text-4xl xl:text-[2.75rem] font-bold text-white leading-tight tracking-tight">
                            Den Haushalt
                            <br />
                            <span className="text-brand-300">organisiert & fair</span>
                            <br />
                            verwalten.
                        </h1>
                        <p className="mt-5 max-w-sm text-base text-brand-100/75 leading-relaxed">
                            Von der Aufgabenverwaltung bis zur fairen Verteilung —
                            alles an einem Ort. Kein Stress, keine vergessenen Pflichten.
                        </p>

                        {/* Feature list */}
                        <ul className="mt-9 space-y-3">
                            {features.map(({ icon: Icon, text }) => (
                                <li key={text} className="flex items-center gap-3.5">
                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15 backdrop-blur-sm">
                                        <Icon className="size-4 text-brand-300" />
                                    </div>
                                    <span className="text-sm font-medium text-brand-100/85">
                                        {text}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Quote section */}
                    <div className="mt-auto">
                        <div className="rounded-2xl bg-white/8 p-5 ring-1 ring-white/12 backdrop-blur-sm">
                            {/* Stars */}
                            <div className="mb-3 flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className="size-3.5 fill-brand-300 text-brand-300"
                                    />
                                ))}
                            </div>

                            {/* Quote text – min-h prevents layout shift */}
                            <blockquote className="min-h-[3rem] text-sm leading-relaxed text-white/90 transition-all duration-500">
                                &ldquo;{quotes[activeQuote].text}&rdquo;
                            </blockquote>
                            <p className="mt-2 text-xs font-medium text-brand-300/80">
                                — {quotes[activeQuote].author}
                            </p>
                        </div>

                        {/* Dot indicators */}
                        <div className="mt-3 flex justify-center gap-1.5">
                            {quotes.map((_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setActiveQuote(i)}
                                    className={cn(
                                        'h-1 rounded-full transition-all duration-300',
                                        i === activeQuote
                                            ? 'w-6 bg-white'
                                            : 'w-1.5 bg-white/35 hover:bg-white/55'
                                    )}
                                    aria-label={`Zitat ${i + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Right Panel – Login Form ────────────────────────────────── */}
            <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-[42%] xl:w-[45%]">
                {/* Mobile logo (only visible when left panel is hidden) */}
                <div className="mb-8 flex items-center gap-2.5 lg:hidden">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-brand-600">
                        <Home className="size-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-neutral-900 dark:text-white">
                        HouseholderPI
                    </span>
                </div>

                <div className="w-full max-w-sm">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                            Willkommen zurück!
                        </h2>
                        <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                            Logge dich ein, um deine Aufgaben zu sehen.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        {errors.general && (
                            <AlertBanner message={errors.general} />
                        )}

                        <Input
                            label="E-Mail Adresse"
                            type="email"
                            placeholder="deine-mail@beispiel.de"
                            required
                            autoFocus
                            disabled={isLoading}
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value)
                                if (errors.email)
                                    setErrors({ ...errors, email: undefined })
                            }}
                            error={errors.email}
                        />

                        <PasswordInput
                            label="Passwort"
                            placeholder="••••••••"
                            required
                            disabled={isLoading}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value)
                                if (errors.password)
                                    setErrors({ ...errors, password: undefined })
                            }}
                            error={errors.password}
                        />

                        <div className="pt-2">
                            <Button
                                fullWidth
                                type="submit"
                                isLoading={isLoading}
                                icon={<LogIn size={18} />}
                            >
                                Einloggen
                            </Button>
                        </div>
                    </form>

                    <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
                        Noch kein Konto?{' '}
                        <Link
                            to="/register"
                            className="inline-flex items-center gap-1 font-medium text-brand-600 hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300"
                        >
                            Jetzt registrieren
                            <ArrowRight className="size-3.5" />
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
