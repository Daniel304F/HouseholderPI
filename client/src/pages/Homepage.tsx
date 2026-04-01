import { useNavigate } from 'react-router-dom'
import {
    ArrowRight,
    BarChart3,
    Bot,
    CalendarDays,
    CheckCircle2,
    LayoutDashboard,
    LogIn,
    Medal,
    MessageSquare,
} from 'lucide-react'
import { Button } from '../components/common'
import { useAuth } from '../contexts/AuthContext'

const features = [
    {
        id: 'board',
        title: 'Kanban-Board',
        description:
            'Aufgaben per Drag & Drop durch To‑Do, In Progress und Erledigt schieben — mit Prioritäten und Fälligkeiten.',
        icon: <CheckCircle2 className="size-5" />,
        color: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
    },
    {
        id: 'stats',
        title: 'Statistik-Dashboard',
        description:
            'Wer hat diesen Monat am meisten erledigt? Aufgabenverteilung und Verlauf auf einen Blick.',
        icon: <BarChart3 className="size-5" />,
        color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
    },
    {
        id: 'gamification',
        title: 'Badges & Streaks',
        description:
            'Tägliche Streaks und Abzeichen für erledigte Aufgaben — motivierend statt nervig.',
        icon: <Medal className="size-5" />,
        color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    },
    {
        id: 'ai',
        title: 'KI-Assistent',
        description:
            'Der integrierte Assistent kennt eure offenen Aufgaben und schlägt eine faire Verteilung vor.',
        icon: <Bot className="size-5" />,
        color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    },
    {
        id: 'calendar',
        title: 'Kalender-Export',
        description:
            'Aufgaben als .ics exportieren und direkt in Google Kalender oder iCal importieren.',
        icon: <CalendarDays className="size-5" />,
        color: 'bg-info-100 text-info-700 dark:bg-info-900/30 dark:text-info-300',
    },
    {
        id: 'chat',
        title: 'Gruppen-Chat',
        description:
            'Direktnachrichten und Gruppen-Chats — keine externen Apps mehr für WG-Kommunikation.',
        icon: <MessageSquare className="size-5" />,
        color: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
    },
]

export const Homepage = () => {
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()

    return (
        <div className="min-h-screen overflow-hidden">
            {/* ── Hero ────────────────────────────────────────────── */}
            <section className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden px-6 py-20 text-center">
                {/* Background */}
                <div className="absolute inset-0 -z-20 bg-gradient-to-br from-brand-50 via-white to-teal-50/60 dark:from-neutral-950 dark:via-neutral-950 dark:to-brand-950/30" />
                {/* Blobs – same animation style as Login page */}
                <div className="login-blob-1 absolute -top-32 -left-32 -z-10 size-[32rem] rounded-full bg-brand-200/30 blur-3xl dark:bg-brand-800/20" />
                <div className="login-blob-2 absolute top-1/4 -right-24 -z-10 size-80 rounded-full bg-teal-200/25 blur-3xl dark:bg-teal-800/15" />
                <div className="login-blob-3 absolute -bottom-24 left-1/3 -z-10 size-[26rem] rounded-full bg-violet-200/20 blur-3xl dark:bg-violet-900/10" />
                {/* Dot grid */}
                <div
                    className="absolute inset-0 -z-10 opacity-[0.035] dark:opacity-[0.045]"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle, currentColor 1px, transparent 1px)',
                        backgroundSize: '28px 28px',
                    }}
                />

                <h1 className="hero-animate-1 max-w-3xl text-[2.75rem] font-black leading-[1.1] tracking-tighter text-neutral-900 sm:text-6xl md:text-7xl dark:text-white">
                    WG-Leben,{' '}
                    <span className="bg-gradient-to-r from-brand-500 via-brand-600 to-teal-500 bg-clip-text text-transparent">
                        gemeinsam
                    </span>{' '}
                    organisiert.
                </h1>

                <p className="hero-animate-2 mx-auto mt-6 max-w-lg text-lg leading-relaxed text-neutral-500 dark:text-neutral-400">
                    Aufgaben anlegen, zuweisen und verfolgen — damit alle wissen, was
                    ansteht. Für WGs, die keine Zeit verschwenden wollen.
                </p>

                <div className="hero-animate-3 mt-10 flex flex-wrap items-center justify-center gap-3">
                    {isAuthenticated ? (
                        <Button
                            size="lg"
                            onClick={() => navigate('/dashboard')}
                            icon={<LayoutDashboard size={18} />}
                        >
                            Zum Dashboard
                        </Button>
                    ) : (
                        <>
                            <Button
                                size="lg"
                                onClick={() => navigate('/register')}
                                icon={<LogIn size={18} />}
                            >
                                Registrieren
                            </Button>
                            <Button
                                size="lg"
                                variant="secondary"
                                onClick={() => navigate('/login')}
                            >
                                Anmelden
                            </Button>
                        </>
                    )}
                </div>

                <p className="hero-animate-4 mt-6 text-sm text-neutral-400 dark:text-neutral-500">
                    Open Source ·{' '}
                    <a
                        href="https://github.com/daniel304f"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline-offset-2 hover:underline"
                    >
                        Quellcode auf GitHub
                    </a>
                </p>
            </section>

            {/* ── Features ─────────────────────────────────────── */}
            <section className="relative px-6 py-20">
                <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-brand-50/40 to-transparent dark:via-brand-950/20" />
                <div className="mx-auto max-w-5xl">
                    <div className="mb-12 text-center">
                        <h2 className="text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
                            Was HouseholderPI kann
                        </h2>
                        <p className="mx-auto mt-4 max-w-md text-base text-neutral-500 dark:text-neutral-400">
                            Alle Werkzeuge, die eine WG braucht — in einer App.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature) => (
                            <div
                                key={feature.id}
                                className="ui-panel ui-panel-hover p-6"
                            >
                                <div
                                    className={`feature-icon mb-4 ${feature.color}`}
                                >
                                    {feature.icon}
                                </div>
                                <h3 className="mb-2 font-bold text-neutral-900 dark:text-white">
                                    {feature.title}
                                </h3>
                                <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Closer ───────────────────────────────────────── */}
            {!isAuthenticated && (
                <section className="px-6 py-16">
                    <div className="mx-auto max-w-xl text-center">
                        <div className="mb-6 flex justify-center">
                            <img
                                src="/householderPI.svg"
                                alt="HouseHolder"
                                className="size-12 opacity-80 dark:invert"
                            />
                        </div>
                        <h2 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
                            Bereit loszulegen?
                        </h2>
                        <p className="mt-3 text-base text-neutral-500 dark:text-neutral-400">
                            Erstelle deine erste Gruppe und lade deine Mitbewohner ein.
                        </p>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                            <Button
                                size="lg"
                                onClick={() => navigate('/register')}
                                icon={<ArrowRight size={18} />}
                                iconPosition="right"
                            >
                                Jetzt registrieren
                            </Button>
                            <Button
                                size="lg"
                                variant="ghost"
                                onClick={() => navigate('/login')}
                            >
                                Bereits registriert? Anmelden
                            </Button>
                        </div>
                    </div>
                </section>
            )}
        </div>
    )
}
