import { Circle, CircleDot } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '../utils/cn'

export type SliderImage = {
    url: string
    alt: string
}

interface ImageSliderProps {
    images: SliderImage[]
    className?: string
    autoPlayInterval?: number
}

export const ImageSlider = ({
    images,
    className,
    autoPlayInterval = 5000,
}: ImageSliderProps) => {
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((i) => (i === images.length - 1 ? 0 : i + 1))
        }, autoPlayInterval)

        return () => clearInterval(interval)
    }, [images.length, autoPlayInterval])

    return (
        <section
            aria-label="Image Slider"
            className={cn(
                'relative w-full overflow-hidden rounded-2xl shadow-md',
                className
            )}
        >
            <a
                href="#after-image-slider-controls"
                className={cn(
                    'sr-only fixed top-0 left-0 z-50 px-4 py-2',
                    'border border-neutral-200 dark:border-neutral-700',
                    'bg-white dark:bg-neutral-800',
                    'text-neutral-900 dark:text-neutral-100',
                    'focus:not-sr-only'
                )}
            >
                Skip Image Slider Controls
            </a>

            <div className="relative h-full w-full">
                <div
                    className="flex h-full w-full transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${100 * currentIndex}%)` }}
                >
                    {images.map(({ url, alt }) => (
                        <div key={url} className="h-full w-full flex-shrink-0">
                            <img
                                src={url}
                                alt={alt}
                                className="h-full w-full object-cover"
                                draggable={false}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div
                className={cn(
                    'absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2',
                    'rounded-full bg-black/20 p-2 backdrop-blur-sm'
                )}
            >
                {images.map((_, index) => (
                    <button
                        key={index}
                        aria-label={`View Image ${index + 1}`}
                        onClick={() => setCurrentIndex(index)}
                        className={cn(
                            'group cursor-pointer transition-transform',
                            'hover:scale-110 focus-visible:scale-110 focus-visible:outline-none'
                        )}
                    >
                        {index === currentIndex ? (
                            <CircleDot
                                size={16}
                                aria-hidden
                                className="fill-brand-600 dark:fill-brand-500 stroke-white"
                            />
                        ) : (
                            <Circle
                                size={16}
                                aria-hidden
                                className="fill-transparent stroke-white/70 transition-colors group-hover:stroke-white"
                            />
                        )}
                    </button>
                ))}
            </div>

            <div id="after-image-slider-controls" />
        </section>
    )
}
