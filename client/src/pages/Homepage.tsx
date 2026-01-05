import { useNavigate } from 'react-router-dom'
import { HeroImage } from '../components/HeroImage'
import { Headline } from '../components/ui/Headline'
import { Button } from '../components/ui/Button'
import { LogIn } from 'lucide-react'

const headlineTitle = 'Gemeinsam wohnen, entspannt leben'
const headlineSubtitle =
    'Schluss mit Diskussionen über den Abwasch. HouseHolder macht die Aufgabenverteilung in deiner WG fair, transparent und sogar ein bisschen spaßig.'

export const Homepage = () => {
    const navigate = useNavigate()

    return (
        <>
            <div className="min-h-screen">
                <HeroImage
                    src="cozy-wg.png"
                    alt="Glückliche WG-Mitbewohner im Wohnzimmer"
                    subtitle="Bild mit Nano Banana Pro generiert."
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
            </div>
        </>
    )
}
