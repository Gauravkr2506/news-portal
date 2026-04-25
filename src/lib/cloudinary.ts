import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export default cloudinary

export async function uploadToCloudinary(
  file: string | Buffer,
  folder = 'newsedition',
  options: Record<string, unknown> = {}
) {
  const result = await cloudinary.uploader.upload(
    typeof file === 'string' ? file : `data:image/webp;base64,${file.toString('base64')}`,
    {
      folder,
      resource_type: 'auto',
      ...options,
    }
  )
  return result
}

export async function deleteFromCloudinary(publicId: string) {
  return cloudinary.uploader.destroy(publicId)
}

export function getCloudinaryUrl(
  publicId: string,
  options: { width?: number; height?: number; quality?: string | number; format?: string } = {}
) {
  return cloudinary.url(publicId, {
    quality: options.quality || 'auto',
    fetch_format: options.format || 'auto',
    width: options.width,
    height: options.height,
    crop: options.width || options.height ? 'fill' : undefined,
    gravity: 'auto',
    secure: true,
  })
}
