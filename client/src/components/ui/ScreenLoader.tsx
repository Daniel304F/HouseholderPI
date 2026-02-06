import { Loader2 } from 'lucide-react'

interface ScreenLoaderProps {
    label?: string
}

export const ScreenLoader = ({
    label = 'Wird geladen...',
}: ScreenLoaderProps) => {
    return (
        <main className="flex h-screen items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
                <p className="text-sm text-text-muted">{label}</p>
            </div>
        </main>
    )
}
