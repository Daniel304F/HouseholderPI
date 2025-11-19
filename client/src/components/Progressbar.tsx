import { useEffect, useState } from 'react'

type ProgressbarProps = {
    timer: number
}

export default function Progressbar({ timer }: ProgressbarProps) {
    const [remainingTime, setRemainingTime] = useState(timer)

    useEffect(() => {
        const interval = setInterval(() => {
            setRemainingTime((prevTime) => prevTime - 10)
        }, 10)

        return () => {
            clearInterval(interval)
        }
    }, [])

    return <progress value={remainingTime} max={timer} />
}
