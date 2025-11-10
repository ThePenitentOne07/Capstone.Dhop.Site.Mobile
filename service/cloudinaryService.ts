import { Platform } from "react-native";

const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_URL = cloudName
  ? `https://api.cloudinary.com/v1_1/${cloudName}/upload`
  : undefined;const CLOUDINARY_UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_UPLOAD_FOLDER = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_FOLDER;

export interface CloudinaryUploadResult {
  asset_id: string;
  public_id: string;
  version: number;
  version_id: string;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  pages?: number;
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  folder?: string;
  access_mode?: string;
  original_filename: string;
  [key: string]: any;
}

const ensureCloudinaryConfig = () => {
  if (!CLOUDINARY_UPLOAD_URL || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error(
      "Missing Cloudinary environment variables. Please set EXPO_PUBLIC_CLOUDINARY_UPLOAD_URL and EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET."
    );
  }
};

const buildFileObject = (uri: string, fileName?: string) => {
  const uriParts = uri.split(/[?#]/)[0]?.split(".") ?? [];
  const fileExtension = uriParts.pop()?.toLowerCase() || "jpg";
  const normalizedExtension = fileExtension === "jpg" ? "jpeg" : fileExtension;
  const finalName = fileName ?? `upload-${Date.now()}.${fileExtension}`;

  return {
    uri: Platform.OS === "ios" ? uri.replace("file://", "") : uri,
    name: finalName,
    type: `image/${normalizedExtension}`,
  } as const;
};

export const uploadImageToCloudinary = async (
  localUri: string,
  fileName?: string
): Promise<CloudinaryUploadResult> => {
  ensureCloudinaryConfig();

  const formData = new FormData();
  formData.append("file", buildFileObject(localUri, fileName) as any);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET as string);

  if (CLOUDINARY_UPLOAD_FOLDER) {
    formData.append("folder", CLOUDINARY_UPLOAD_FOLDER);
  }

  const response = await fetch(CLOUDINARY_UPLOAD_URL as string, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    const message =
      data?.error?.message ||
      data?.message ||
      "Failed to upload image to Cloudinary.";
    throw new Error(message);
  }

  return data as CloudinaryUploadResult;
};

