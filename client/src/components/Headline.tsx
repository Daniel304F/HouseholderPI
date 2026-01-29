import { type ReactNode } from 'react'

interface HeadlineProps {
    title: string
    subtitle?: string
    children?: ReactNode
    align?: 'left' | 'center' | 'right'
}

export const Headline = ({
    title,
    subtitle,
    children,
    align = 'center',
}: HeadlineProps) => {
    const alignmentClasses = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
    }

    return (
        <>
            <div className={`px-6 py-10 ${alignmentClasses[align]}`}>
                <h1
                    className="text-3xl leading-tight font-bold tracking-tight text-neutral-900 sm:text-4xl md:text-5xl dark:text-neutral-100"
                    style={{
                        fontFamily: "'Georgia', serif",
                    }}
                >
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-text-muted mx-auto mt-5 max-w-2xl text-lg leading-relaxed sm:text-xl">
                        {subtitle}
                    </p>
                )}
                {children && <div className="mt-8">{children}</div>}
            </div>
        </>
    )
}
