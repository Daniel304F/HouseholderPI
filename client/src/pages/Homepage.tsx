import { useNavigate } from 'react-router-dom'
import { HeroImage } from '../components/HeroImage'

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
            </div>
        </>
    )
}
