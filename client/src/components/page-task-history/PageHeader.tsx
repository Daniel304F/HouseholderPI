import { History } from 'lucide-react'
import { PageIntro } from '../ui'

export const PageHeader = () => {
    return (
        <PageIntro
            title="Aufgaben-Historie"
            description="Alle erledigten Aufgaben im Ueberblick"
            icon={<History className="size-5 text-brand-600 dark:text-brand-400" />}
        />
    )
}
