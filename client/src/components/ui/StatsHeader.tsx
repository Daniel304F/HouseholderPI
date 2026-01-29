import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '../Button'

interface StatsHeaderProps {
    title: string
    subtitle: string
    backLink?: string
    badge?: ReactNode
}

export const StatsHeader = ({
    title,
    subtitle,
    backLink,
    badge,
}: StatsHeaderProps) => {
    return (
        <div className="flex items-center justify-between">
            <div>
                <div className="flex items-center gap-3">
                    {backLink && (
                        <Link to={backLink}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                    )}
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {title}
                    </h1>
                </div>
                <p
                    className={`mt-1 text-neutral-500 dark:text-neutral-400 ${backLink ? 'ml-11' : ''}`}
                >
                    {subtitle}
                </p>
            </div>
            {badge && (
                <div className="hidden md:block">{badge}</div>
            )}
        </div>
    )
}
