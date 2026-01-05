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
            <div className={`px-6 py-8 ${alignmentClasses[align]}`}>
                <h1
                    className="text-text text-3xl leading-tight font-bold tracking-tight sm:text-4xl md:text-5xl"
                    style={{
                        fontFamily: "'Georgia', serif",
                    }}
                >
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-text-muted mx-auto mt-4 max-w-2xl text-lg leading-relaxed sm:text-xl">
                        {subtitle}
                    </p>
                )}
                {children && <div className="mt-6">{children}</div>}
            </div>
        </>
    )
}
