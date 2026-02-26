import { Capacitor } from '@capacitor/core'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'

const toFileFromWebPath = async (
    webPath: string,
    fileName: string
): Promise<File> => {
    const response = await fetch(webPath)
    const blob = await response.blob()
    return new File([blob], fileName, {
        type: blob.type || 'image/jpeg',
    })
}

const toFileFromBase64 = async (
    base64Data: string,
    fileName: string
): Promise<File> => {
    const response = await fetch(`data:image/jpeg;base64,${base64Data}`)
    const blob = await response.blob()
    return new File([blob], fileName, {
        type: blob.type || 'image/jpeg',
    })
}

export const isNativeCapacitorPlatform = (): boolean =>
    Capacitor.isNativePlatform()

export const capturePhotoWithCapacitor = async (): Promise<File | null> => {
    const photo = await Camera.getPhoto({
        quality: 85,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
    })

    const fileName = `task-photo-${Date.now()}.jpeg`

    if (photo.webPath) {
        return toFileFromWebPath(photo.webPath, fileName)
    }

    if (photo.base64String) {
        return toFileFromBase64(photo.base64String, fileName)
    }

    return null
}
