import { Circle, CircleDot } from "lucide-react";
import { useEffect, useState } from "react";

type Image = {
  url: string;
  alt: string;
};

type ImageSliderProps = {
  images: Image[];
};

export default function ImageSlider({ images }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((i) => (i === images.length - 1 ? 0 : i + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section
      aria-label="Image Slider"
      className="relative w-full h-full"
    >
      <a
        href="#after-image-slider-controls"
        className="sr-only focus:not-sr-only fixed top-0 left-0 z-50 border border-black bg-white px-2 py-1 text-black"
      >
        Skip Image Slider Controls
      </a>

      <div className="relative w-full h-full overflow-hidden">
        <div
          className="flex h-full transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${100 * currentIndex}%)` }}
        >
          {images.map(({ url, alt }) => (
            <img
              key={url}
              src={url}
              alt={alt}
              className="block h-full w-full flex-shrink-0 flex-grow-0 object-cover"
              draggable={false}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1">
        {images.map((_, index) => (
          <button
            key={index}
            aria-label={`View Image ${index + 1}`}
            onClick={() => setCurrentIndex(index)}
            className="h-4 w-4 cursor-pointer transition-transform hover:scale-110 focus-visible:scale-110 focus-visible:outline outline-auto"
          >
            {index === currentIndex ? (
              <CircleDot aria-hidden className="h-full w-full stroke-white fill-purple-600" />
            ) : (
              <Circle aria-hidden className="h-full w-full stroke-white fill-purple-600" />
            )}
          </button>
        ))}
      </div>

      <div id="after-image-slider-controls" />
    </section>
  );
}
