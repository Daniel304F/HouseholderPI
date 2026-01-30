import type { ReactNode } from 'react'
import { Card, Headline } from '../components/common'

interface AuthFormLayoutProps {
    title: string
    subtitle: string
    cardTitle: string
    children: ReactNode
    footer?: ReactNode
}

export const AuthFormLayout = ({
    title,
    subtitle,
    cardTitle,
    children,
    footer,
}: AuthFormLayoutProps) => {
    return (
        <div className="flex w-full items-center justify-center py-12">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <Headline title={title} subtitle={subtitle} />
                </div>

                <Card title={cardTitle}>{children}</Card>

                {footer && (
                    <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
                        {footer}
                    </p>
                )}
            </div>
        </div>
    )
}
