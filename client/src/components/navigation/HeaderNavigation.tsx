import { useLocation, useNavigate } from 'react-router-dom'

export const HeaderNavigation = () => {
    const navigate = useNavigate()
    const location = useLocation()

    const handleNavigate = (path: string) => {
        navigate(path)
    }

    return (
        <header className="sticky top-0 border-b shadow-lg">
            <div className="mx-auto max-w-7xl px-4 pr-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center">
                        <span className="red">HouseHolder</span>
                    </div>

                    <nav></nav>
                </div>
            </div>
        </header>
    )
}
