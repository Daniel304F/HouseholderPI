interface HeroImageProps {
    src: string
    alt: string
    subtitle?: string
}

export const HeroImage = ({ src, alt, subtitle }: HeroImageProps) => {
    return (
        <>
            <div className="relative w-full overflow-hidden rounded-md">
                <div className="relative">
                    <img
                        src={src}
                        alt={alt}
                        className="h-auto w-full object-cover"
                    />
                </div>
                <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
                    style={{
                        background:
                            'linear-gradient(to top, var(--semantic-surface), transparent)',
                    }}
                />
                {subtitle && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                        <span
                            className="text-text-muted inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium tracking-wide backdrop-blur-sm"
                            style={{
                                background: 'rgba(255, 255, 255, 0.7)',
                            }}
                        >
                            {/* <svg
                                className="h-3 w-3 opacity-60"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                            </svg> */}
                            {subtitle}
                        </span>
                    </div>
                )}
            </div>
        </>
    )
}
