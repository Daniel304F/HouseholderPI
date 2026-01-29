import { Code2 } from 'lucide-react'

export const Footer = () => {
    return (
        <footer className="from-brand-500 via-brand-600 to-brand-500 shadow-brand-800/20 mt-auto w-full bg-gradient-to-r text-white shadow-inner">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
                <p className="text-sm font-semibold drop-shadow-sm">
                    &copy; {new Date().getFullYear()} HouseHolder
                </p>

                <a
                    href="https://github.com/daniel304f"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-2xl px-3 py-2 text-white/85 transition-all duration-200 hover:bg-white/10 hover:text-white"
                    aria-label="GitHub Profile"
                    title="Zum Code auf GitHub"
                >
                    <div className="flex flex-row items-center gap-3 text-white">
                        <p className="text-sm font-semibold">
                            Schau dir die Codebasis an!
                        </p>
                        <Code2 size={22} />
                    </div>
                </a>
            </div>
        </footer>
    )
}
