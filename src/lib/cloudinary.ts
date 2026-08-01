/**
 * Cloudinary Media Storage Utility for GoldenGuard
 * Converts local files or base64 strings into Cloudinary URLs.
 * Stores optimized Cloudinary URLs in Firestore.
 */

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "goldenguard";
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "goldenguard_unsigned";

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  bytes: number;
}

/**
 * Uploads a base64 image or File object to Cloudinary.
 * Falls back safely to base64 if Cloudinary endpoint is unreachable or offline.
 */
export async function uploadToCloudinary(
  fileOrBase64: File | string,
  folder: "profiles" | "hazards" | "community" | "emergencies" | "certificates" = "profiles"
): Promise<string> {
  try {
    const formData = new FormData();

    if (fileOrBase64 instanceof File) {
      formData.append("file", fileOrBase64);
    } else if (typeof fileOrBase64 === "string" && fileOrBase64.startsWith("data:")) {
      formData.append("file", fileOrBase64);
    } else if (typeof fileOrBase64 === "string" && fileOrBase64.startsWith("http")) {
      // Already a remote URL
      return fileOrBase64;
    } else {
      throw new Error("Invalid file format");
    }

    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", `goldenguard/${folder}`);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!res.ok) {
      console.warn("Cloudinary upload fallback notice: Using local cached URI");
      if (typeof fileOrBase64 === "string") return fileOrBase64;
      return await fileToBase64(fileOrBase64 as File);
    }

    const data: CloudinaryUploadResponse = await res.json();
    return data.secure_url;
  } catch (error) {
    console.warn("Cloudinary upload fallback executed:", error);
    if (typeof fileOrBase64 === "string") return fileOrBase64;
    return await fileToBase64(fileOrBase64 as File);
  }
}

/**
 * Helper to convert File to Base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
