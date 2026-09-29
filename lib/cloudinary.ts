import { v2 as cloudinary } from "cloudinary";

export function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) return null;

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
  return { cloudName, apiKey, apiSecret };
}

export function isCloudinaryConfigured() {
  return getCloudinaryConfig() !== null;
}

export type CloudinaryUploadScope = "portfolio" | "services" | "branding";

export function createUploadSignature(scope: CloudinaryUploadScope) {
  const config = getCloudinaryConfig();
  if (!config) return null;

  const timestamp = Math.round(Date.now() / 1000);
  const folder = `kova-academy/${scope}`;
  const signature = cloudinary.utils.api_sign_request(
    { folder, timestamp },
    config.apiSecret,
  );

  return { cloudName: config.cloudName, apiKey: config.apiKey, timestamp, folder, signature };
}

export async function destroyCloudinaryImage(publicId: string) {
  const config = getCloudinaryConfig();
  if (!config) throw new Error("Cloudinary no está configurado.");
  return cloudinary.uploader.destroy(publicId, { invalidate: true, resource_type: "image" });
}
