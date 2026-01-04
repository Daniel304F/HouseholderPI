import { useHeaderContext } from '../contexts/HeaderContext'

export const Header = () => {
    const { title, subtitle } = useHeaderContext()

    return (
        <header className="sticky top-0 z-10 border-b bg-white">
            <div className="mx-auto max-w-md px-4 py-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h1>{title}</h1>
                        {subtitle && <p className="">{subtitle}</p>}
                    </div>
                </div>
            </div>
        </header>
    )
}
