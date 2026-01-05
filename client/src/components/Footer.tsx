import { Code2 } from 'lucide-react'

export const Footer = () => {
    return (
        <footer className="bg-brand-500 dark:bg-brand-600 mt-auto w-full py-6 text-white">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-6">
                <p className="text-sm font-semibold">
                    &copy; {new Date().getFullYear()} HouseHolder
                </p>

                <a
                    href="https://github.com/daniel304f"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:bg-brand-600 text-white/80 transition-colors hover:text-white"
                    aria-label="GitHub Profile"
                    title="Zum Code auf GitHub"
                >
                    <div className="flex flex-row gap-5 px-2 py-4">
                        <p className="text-white">
                            Schau dir die Codebasis an!
                        </p>
                        <Code2 size={24} />
                    </div>
                </a>
            </div>
        </footer>
    )
}
