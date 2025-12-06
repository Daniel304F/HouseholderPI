import { Users, Brain, Shield, CheckCircle, ArrowRight } from 'lucide-react'
import ImageSlider from '../components/ImageSlider'

export default function Home() {
    const features = [
        {
            icon: Users,
            title: 'Gruppen erstellen & Aufgaben teilen:',
            description:
                'Lade deine WG-Bewohner ein und legt gemeinsam fest, was im Haushalt zu tun ist.',
        },
        {
            icon: Brain,
            title: 'Faire Aufgabenverteilung dank KI:',
            description:
                'Ein intelligentes LLM erstellt automatisch einen Wochenplan, der Rücksicht auf die Zeitkapazitäten aller nimmt.',
        },
        {
            icon: Shield,
            title: 'Selbst gehostet & datensicher:',
            description:
                'Läuft direkt auf deinem Raspberry PI - volle Kontrolle über deine Daten.',
        },
        {
            icon: CheckCircle,
            title: 'Stressfreier WG-Alltag:',
            description:
                'Keine Diskussionen mehr, wer den Müll rausbringt - HouseHolder sorgt für klare, faire Regeln.',
        },
    ]

    const images = [
        {
            url: './Image1.png',
            alt: 'Picture of cleaning up a room',
        },
        {
            url: './Image2.png',
            alt: 'Picture of finishing tasks',
        },
        {
            url: './Image3.png',
            alt: 'Picture of a clean room',
        },
    ]

    return (
        <div className="min-h-screen bg-white">
            <div className="from-primary-600 via-primary-700 to-primary-800 bg-gradient-to-br py-16 text-center">
                <div className="container mx-auto px-6">
                    <div className="mb-6 flex items-center justify-center">
                        <h1 className="text-4xl font-bold text-white md:text-5xl">
                            Willkommen bei HouseHolder!
                        </h1>
                    </div>

                    <div className="mx-auto max-w-4xl">
                        <p className="text-primary-100 text-xl leading-relaxed md:text-2xl">
                            Mit HouseHolder wird das Chaos im WG-Alltag zur
                            Vergangenheit. Unsere Plattform organisiert
                            Haushaltsaufgaben fair und transparent - individuell
                            abgestimmt auf die verfügbare Zeit jedes Mitglieds.
                        </p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-16">
                <div className="mb-16 grid gap-8 md:grid-cols-2">
                    {features.map((feature, index) => {
                        const IconComponent = feature.icon
                        return (
                            <div
                                key={index}
                                className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 transition-all duration-300 hover:scale-105 hover:transform hover:shadow-lg"
                            >
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <div className="from-primary-600 to-primary-700 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br">
                                            <IconComponent className="h-6 w-6 text-white" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="mb-2 text-lg font-semibold text-neutral-900">
                                            {feature.title}
                                        </h3>
                                        <p className="leading-relaxed text-neutral-600">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="flex justify-center py-12">
                    <div className="w-full max-w-4xl">
                        <ImageSlider images={images} />
                    </div>
                </div>

                <div className="text-center">
                    <div className="from-primary-600 via-primary-700 to-primary-800 mx-auto max-w-2xl rounded-2xl bg-gradient-to-br p-8 text-white">
                        <h2 className="mb-4 text-2xl font-bold">
                            Bereit für eine organisierte WG?
                        </h2>
                        <p className="text-primary-100 mb-6">
                            Starte noch heute und bringe Ordnung in euren
                            Haushalt!
                        </p>
                        <div className="flex flex-col justify-center gap-4 sm:flex-row">
                            <button className="group text-primary-700 flex items-center justify-center rounded-lg bg-white px-6 py-3 font-semibold transition-colors duration-200 hover:bg-neutral-100">
                                Jetzt registrieren
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                            </button>
                            <button className="rounded-lg border-2 border-white px-6 py-3 font-semibold text-white transition-colors duration-200 hover:bg-white/10">
                                Mehr erfahren
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
