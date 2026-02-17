import {
  v2 as cloudinary,
  type UploadApiResponse,
  type UploadApiErrorResponse,
} from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

const hasCredentials =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

if (hasCredentials) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const ensureConfigured = () => {
  if (!hasCredentials) {
    throw new Error("Cloudinary credentials are not configured");
  }
};

export interface UploadedAsset {
  url: string;
  publicId: string;
}

export interface UploadedFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

export const uploadImageBuffer = async (
  file: UploadedFile,
  folder: string
): Promise<UploadedAsset> => {
  ensureConfigured();

  return await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        unique_filename: true,
        overwrite: false,
      },
      (
        error?: UploadApiErrorResponse,
        result?: UploadApiResponse | undefined | null
      ) => {
        if (error || !result) {
          return reject(error || new Error("Failed to upload image"));
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    uploadStream.end(file.buffer);
  });
};

export const deleteImageByPublicId = async (
  publicId?: string | null
): Promise<void> => {
  if (!publicId) return;
  ensureConfigured();
  await cloudinary.uploader.destroy(publicId);
};
