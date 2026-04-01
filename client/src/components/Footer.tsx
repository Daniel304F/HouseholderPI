import { Code2, Home } from 'lucide-react'

export const Footer = () => {
    return (
        <footer className="mt-auto w-full border-t border-neutral-200/70 bg-white/80 backdrop-blur-sm dark:border-neutral-800/70 dark:bg-neutral-950/60">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
                <div className="flex items-center gap-2">
                    <div className="flex size-6 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700">
                        <Home className="size-3.5 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        HouseHolder{' '}
                        <span className="font-normal text-neutral-400 dark:text-neutral-500">
                            &copy; {new Date().getFullYear()}
                        </span>
                    </p>
                </div>

                <a
                    href="https://github.com/daniel304f"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium text-neutral-500 transition-all duration-200 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-100"
                    aria-label="GitHub Profile"
                    title="Zum Code auf GitHub"
                >
                    <Code2 size={16} />
                    <span className="hidden sm:inline">Open Source auf GitHub</span>
                </a>
            </div>
        </footer>
    )
}
