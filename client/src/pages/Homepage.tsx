import { useNavigate } from 'react-router-dom'
import { HeroImage } from '../components/HeroImage'
import { Headline } from '../components/Headline'
import { Button } from '../components/Button'
import { LogIn, BarChart3, Medal, CalendarDays } from 'lucide-react'
import { GridCardLayout } from '../layouts/GridCardLayout'
import { Card } from '../components/Card'
import { ImageSlider } from '../components/ImageSlider'
import { useAuth } from '../contexts/AuthContext'

const headlineTitle = 'WG-Leben, aber professionell'
const headlineSubtitle =
    'Verwalte deine WG wie ein Projekt. Mit Kanban-Boards, Statistiken und einem Belohnungssystem, das motiviert statt nervt.'

const features = [
    {
        id: 'stats',
        title: 'Statistik Dashboard',
        description:
            'Daten statt Diskussionen. Seht auf einen Blick, wer wie viel beiträgt, und feiert eure Erfolge mit detaillierten Auswertungen.',
        icon: (
            <span className="bg-brand-50 text-brand-700 shadow-brand-200/60 dark:bg-brand-900/40 dark:text-brand-200 flex h-10 w-10 items-center justify-center rounded-2xl shadow-inner">
                <BarChart3 size={18} />
            </span>
        ),
    },
    {
        id: 'gamification',
        title: 'Badges & Streaks',
        description:
            'Bleibt am Ball! Haltet eure "Streak" am Leben und verdient euch einzigartige Abzeichen für erledigte Aufgaben.',
        icon: (
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 shadow-inner shadow-amber-200/60 dark:bg-amber-900/30 dark:text-amber-200">
                <Medal size={18} />
            </span>
        ),
    },
    {
        id: 'organization',
        title: 'Smarte Planung',
        description:
            'Erstellt Aufgaben blitzschnell (gerne auch mit Beweisfoto!) und synchronisiert alles direkt mit eurem Kalender.',
        icon: (
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 shadow-inner shadow-blue-200/60 dark:bg-blue-900/30 dark:text-blue-200">
                <CalendarDays size={18} />
            </span>
        ),
    },
]

const sliderImages = [
    { url: '/mascot1.png', alt: 'HouseHolder Maskottchen 1' },
    { url: '/mascot2.png', alt: 'HouseHolder Maskottchen 2' },
    { url: '/mascot3.png', alt: 'HouseHolder Maskottchen 3' },
]

export const Homepage = () => {
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()

    const navigationPath = isAuthenticated ? '/dashboard' : '/login'

    return (
        <>
            <div className="min-h-screen">
                <HeroImage
                    src="cozy-wg.png"
                    alt="Glückliche WG-Mitbewohner im Wohnzimmer"
                ></HeroImage>
                <Headline title={headlineTitle} subtitle={headlineSubtitle}>
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={() => navigate(navigationPath)}
                        icon={<LogIn size={20} />}
                    >
                        Jetzt loslegen
                    </Button>
                </Headline>
                <section className="relative px-6 py-12">
                    <div className="from-brand-50/70 to-brand-50/40 dark:from-brand-900/40 dark:to-brand-900/20 absolute inset-0 -z-10 bg-gradient-to-b via-transparent dark:via-neutral-900/40" />
                    <GridCardLayout>
                        {features.map((feature) => (
                            <Card
                                key={feature.id}
                                title={feature.title}
                                actions={feature.icon}
                                className="animate-card hover-lift glow-brand"
                            >
                                <p className="leading-relaxed text-neutral-600 dark:text-neutral-300">
                                    {feature.description}
                                </p>
                            </Card>
                        ))}
                    </GridCardLayout>
                </section>
                <ImageSlider images={sliderImages}></ImageSlider>
            </div>
        </>
    )
}
