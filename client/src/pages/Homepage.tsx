import { useNavigate } from 'react-router-dom'
import { HeroImage } from '../components/HeroImage'
import { Headline } from '../components/Headline'
import { Button } from '../components/Button'
import { LogIn, BarChart3, Medal, CalendarDays } from 'lucide-react'
import { GridCardLayout } from '../layouts/GridCardLayout'
import { Card } from '../components/Card'
import { ImageSlider } from '../components/ImageSlider'

const headlineTitle = 'WG-Leben, aber professionell'
const headlineSubtitle =
    'Verwalte deine WG wie ein Projekt. Mit Kanban-Boards, Statistiken und einem Belohnungssystem, das motiviert statt nervt.'

const features = [
    {
        id: 'stats',
        title: 'Statistik Dashboard',
        description:
            'Daten statt Diskussionen. Seht auf einen Blick, wer wie viel beiträgt, und feiert eure Erfolge mit detaillierten Auswertungen.',
        icon: <BarChart3 className="text-brand-600 dark:text-brand-400" />,
    },
    {
        id: 'gamification',
        title: 'Badges & Streaks',
        description:
            'Bleibt am Ball! Haltet eure "Streak" am Leben und verdient euch einzigartige Abzeichen für erledigte Aufgaben.',
        icon: <Medal className="text-brand-600 dark:text-brand-400" />,
    },
    {
        id: 'organization',
        title: 'Smarte Planung',
        description:
            'Erstellt Aufgaben blitzschnell (gerne auch mit Beweisfoto!) und synchronisiert alles direkt mit eurem Kalender.',
        icon: <CalendarDays className="text-brand-600 dark:text-brand-400" />,
    },
]

const sliderImages = [
    { url: '/mascot1.png', alt: 'HouseHolder Maskottchen 1' },
    { url: '/mascot2.png', alt: 'HouseHolder Maskottchen 2' },
    { url: '/mascot3.png', alt: 'HouseHolder Maskottchen 3' },
]

export const Homepage = () => {
    const navigate = useNavigate()

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
                        onClick={() => navigate('/login')}
                        icon={<LogIn size={20} />}
                    >
                        Jetzt loslegen
                    </Button>
                </Headline>
                <section className="px-6 py-12">
                    <GridCardLayout>
                        {features.map((feature) => (
                            <Card
                                key={feature.id}
                                title={feature.title}
                                actions={feature.icon}
                            >
                                <p className="text-neutral-600 dark:text-neutral-300">
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
