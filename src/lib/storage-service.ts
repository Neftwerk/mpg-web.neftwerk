import { API_ENDPOINTS } from "./api";
import { ApiResponse, authedFetch, getAccessToken } from "./auth-service";

export interface UploadedImage {
  key: string;
  bucket: string;
  url: string;
  downloadUrl: string;
  originalName: string;
  mimeType: string;
  size: number;
}

function unwrapUploadPayload(data: unknown): UploadedImage | null {
  const nested = (data as { data?: UploadedImage })?.data;
  if (nested?.url && nested?.key) return nested;
  const direct = data as UploadedImage;
  if (direct?.url && direct?.key) return direct;
  return null;
}

export function extractS3KeyFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes(".s3.") && !parsed.hostname.includes("s3.amazonaws.com")) {
      return null;
    }
    return decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  } catch {
    return null;
  }
}

export async function uploadImage(file: File): Promise<ApiResponse<UploadedImage>> {
  const token = getAccessToken();
  if (!token) {
    return { ok: false, status: 401, data: {} as UploadedImage, message: "Not authenticated" };
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(API_ENDPOINTS.STORAGE.UPLOAD_IMAGE, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await res.json().catch(() => ({}));
    const uploaded = unwrapUploadPayload(data);

    if (!res.ok || !uploaded) {
      return {
        ok: false,
        status: res.status,
        data: {} as UploadedImage,
        message: data?.message || data?.error || `Upload failed (${res.status})`,
      };
    }

    return { ok: true, status: res.status, data: uploaded };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    return { ok: false, status: 0, data: {} as UploadedImage, message };
  }
}

export async function presignStorageKey(key: string): Promise<string | null> {
  const result = await authedFetch<{ data?: { url?: string } }>(
    API_ENDPOINTS.STORAGE.PRESIGN(key),
  );

  if (!result.ok) return null;
  return result.data?.data?.url ?? null;
}

export async function resolveProfilePictureUrl(profilePicture?: string): Promise<string> {
  if (!profilePicture) return "";

  const s3Key = extractS3KeyFromUrl(profilePicture);
  if (!s3Key) return profilePicture;

  const presigned = await presignStorageKey(s3Key);
  return presigned || profilePicture;
}
