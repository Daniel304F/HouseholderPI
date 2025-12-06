import HamburgerMenu from '../components/HamburgerMenu'

export default function Header() {
    return (
        <header className="border-primary-900 from-primary-700 via-primary-600 to-primary-800 w-full border-b bg-gradient-to-r shadow-lg">
            <div className="flex h-16 flex-row items-center justify-between p-0.5">
                <div className="flex items-center space-x-3">
                    <img
                        src="./householderPI.svg"
                        alt="householderPI ICON"
                        className="h-16 w-16 shrink-0"
                    />
                    <h1 className="hidden text-3xl font-bold text-white sm:block">
                        HouseHolder
                    </h1>
                </div>
                <HamburgerMenu></HamburgerMenu>
            </div>
        </header>
    )
}
