import { Users, Brain, Shield, CheckCircle, ArrowRight } from "lucide-react";
import ImageSlider from "../components/ImageSlider";

export default function Home() {
    const features = [
        {
            icon: Users,
            title: "Gruppen erstellen & Aufgaben teilen:",
            description: "Lade deine WG-Bewohner ein und legt gemeinsam fest, was im Haushalt zu tun ist."
        },
        {
            icon: Brain,
            title: "Faire Aufgabenverteilung dank KI:",
            description: "Ein intelligentes LLM erstellt automatisch einen Wochenplan, der Rücksicht auf die Zeitkapazitäten aller nimmt."
        },
        {
            icon: Shield,
            title: "Selbst gehostet & datensicher:",
            description: "Läuft direkt auf deinem Raspberry PI - volle Kontrolle über deine Daten."
        },
        {
            icon: CheckCircle,
            title: "Stressfreier WG-Alltag:",
            description: "Keine Diskussionen mehr, wer den Müll rausbringt - HouseHolderPI sorgt für klare, faire Regeln."
        }
    ];

    const images = [
        {
            url: './image1.png',
            alt: 'Picture of cleaning up a room'
        },
        {
            url: './image2.png',
            alt: 'Picture of finishing tasks'
        },
        {
            url: './image3.png',
            alt: 'Picture of a clean room'
        }
    ]

    return (
        <div className="min-h-screen bg-white">
            <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-purple-700 text-center py-16">
                <div className="container mx-auto px-6">
                    <div className="flex justify-center items-center mb-6">
                        <h1 className="text-4xl md:text-5xl font-bold text-white">
                            Willkommen bei HouseHolderPI!
                        </h1>
                    </div>
                    
                    <div className="max-w-4xl mx-auto">
                        <p className="text-xl md:text-2xl text-blue-100 leading-relaxed">
                            Mit HouseHolderPI wird das Chaos im WG-Alltag zur Vergangenheit. Unsere Plattform organisiert 
                            Haushaltsaufgaben fair und transparent - individuell abgestimmt auf die verfügbare Zeit jedes Mitglieds.
                        </p>
                    </div>
                </div>
            </div>


            <div className="container mx-auto px-6 py-16">
                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    {features.map((feature, index) => {
                        const IconComponent = feature.icon;
                        return (
                            <div 
                                key={index}
                                className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:transform hover:scale-105"
                            >
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                            <IconComponent className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            {feature.title}
                                        </h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div>
                    <ImageSlider images={images} />
                </div>


                <div className="text-center">
                    <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-purple-700 rounded-2xl p-8 text-white max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold mb-4">
                            Bereit für eine organisierte WG?
                        </h2>
                        <p className="text-blue-100 mb-6">
                            Starte noch heute und bringe Ordnung in euren Haushalt!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center group">
                                Jetzt registrieren
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                            </button>
                            <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors duration-200">
                                Mehr erfahren
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}