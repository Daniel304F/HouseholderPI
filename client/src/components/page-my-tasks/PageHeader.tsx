import { ClipboardList } from 'lucide-react'
import { PageIntro } from '../ui'

export const PageHeader = () => {
    return (
        <PageIntro
            title="Meine Aufgaben"
            description="Alle Aufgaben, die dir zugewiesen sind"
            icon={<ClipboardList className="size-5 text-brand-600 dark:text-brand-400" />}
        />
    )
}
