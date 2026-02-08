import { History } from 'lucide-react'
import { PageIntro } from '../ui'

export const PageHeader = () => {
    return (
        <PageIntro
            title="Deine Historie"
            description="Alle erledigten Aufgaben im Überblick"
            icon={
                <History className="text-brand-600 dark:text-brand-400 size-5" />
            }
        />
    )
}
