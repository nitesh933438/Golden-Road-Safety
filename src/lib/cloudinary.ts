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
 * Resizes and compresses an image file using HTML5 Canvas.
 * Standardizes to max 1200px width/height and outputs high-quality compressed JPEG (0.75).
 */
export function compressImage(
  fileOrBase64: File | string,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.75
): Promise<File | string> {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate aspect ratio
      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(fileOrBase64);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      if (fileOrBase64 instanceof File) {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], fileOrBase64.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(fileOrBase64);
            }
          },
          "image/jpeg",
          quality
        );
      } else {
        const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedBase64);
      }
    };

    img.onerror = () => {
      resolve(fileOrBase64);
    };

    if (fileOrBase64 instanceof File) {
      const url = URL.createObjectURL(fileOrBase64);
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(url);
          resolve(fileOrBase64);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            if (blob) {
              const compressedFile = new File([blob], fileOrBase64.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(fileOrBase64);
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(fileOrBase64);
      };
      img.src = url;
    } else {
      img.src = fileOrBase64;
    }
  });
}

/**
 * Validates file type and size. Throws friendly errors if limits are exceeded.
 */
export function validateImage(
  fileOrBase64: File | string,
  category: "profiles" | "hazards" | "community" | "emergencies" | "certificates" = "profiles"
): void {
  // Determine limits
  let maxSizeMB = 5;
  if (category === "profiles") {
    maxSizeMB = 2; // Profile photo: max 1-2 MB before processing
  } else if (category === "hazards" || category === "emergencies") {
    maxSizeMB = 5; // Incident photo: max 2-5 MB before processing
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (fileOrBase64 instanceof File) {
    if (!fileOrBase64.type.startsWith("image/")) {
      throw new Error("Only image files (JPEG, PNG, WEBP, etc.) are allowed.");
    }
    if (fileOrBase64.size > maxSizeBytes) {
      throw new Error(`The selected image is too large (${(fileOrBase64.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed is ${maxSizeMB}MB.`);
    }
  } else if (typeof fileOrBase64 === "string" && fileOrBase64.startsWith("data:")) {
    // Check base64 size
    const approxBytes = fileOrBase64.length * 0.75;
    if (approxBytes > maxSizeBytes) {
      throw new Error(`The selected image is too large (${(approxBytes / (1024 * 1024)).toFixed(1)}MB). Maximum allowed is ${maxSizeMB}MB.`);
    }
  }
}

/**
 * Uploads a base64 image or File object to Cloudinary.
 * Handles validation, compression/resizing, metadata stripping, and safe failure fallback.
 */
export async function uploadToCloudinary(
  fileOrBase64: File | string,
  folder: "profiles" | "hazards" | "community" | "emergencies" | "certificates" = "profiles"
): Promise<string> {
  try {
    // 1. Validate size & type
    validateImage(fileOrBase64, folder);

    // 2. Compress and resize using client-side Canvas
    const optimizedFile = await compressImage(fileOrBase64);

    const formData = new FormData();

    if (optimizedFile instanceof File) {
      formData.append("file", optimizedFile);
    } else if (typeof optimizedFile === "string" && optimizedFile.startsWith("data:")) {
      formData.append("file", optimizedFile);
    } else if (typeof optimizedFile === "string" && optimizedFile.startsWith("http")) {
      return optimizedFile;
    } else {
      throw new Error("Invalid file format after optimization");
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
      console.warn("Cloudinary upload failed with status:", res.status);
      throw new Error("Cloudinary server rejected the upload.");
    }

    const data: CloudinaryUploadResponse = await res.json();
    return data.secure_url;
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    // Throw error so caller knows upload failed (prevents saving base64 in Firestore)
    throw new Error(error.message || "Failed to upload image. Please try again or check connection.");
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

