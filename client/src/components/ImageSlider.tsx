type Image = {
    url: string,
    alt: string
}

type ImageSliderProps = {
    images: Image[]
}

export default function ImageSlider ({images}: ImageSliderProps) {

    return (
        <div>
            {images.map((image, index) => (
                <img key={index} src={image.url} alt={image.alt} />
            ))}
        </div>
    )

}