import { API_ENDPOINTS } from "./api";
import { authedFetch, type ApiResponse } from "./auth-service";
import type {
  EnquiryDetail,
  EnquiryListItem,
  EnquiryListResponse,
  EnquiryMessage,
  EnquiryStatus,
  EnquiryUserRef,
} from "./enquiry-types";

function unwrapData<T>(data: unknown): T {
  if (data && typeof data === "object" && "data" in data) {
    return (data as { data: T }).data;
  }
  return data as T;
}

const OBJECT_ID_RE = /^[a-f\d]{24}$/i;

export function getArtworkTitle(
  artworkId: EnquiryListItem["artworkId"],
): string {
  if (typeof artworkId === "object" && artworkId?.title) {
    if (!OBJECT_ID_RE.test(artworkId.title)) {
      return artworkId.title;
    }
  }
  if (typeof artworkId === "string" && !OBJECT_ID_RE.test(artworkId)) {
    return artworkId;
  }
  return "Artwork";
}

export function getArtworkRefId(
  artworkId: EnquiryListItem["artworkId"],
): string | null {
  if (typeof artworkId === "object" && artworkId?._id) {
    return artworkId._id;
  }
  if (typeof artworkId === "string") {
    return artworkId;
  }
  return null;
}

export function getArtworkMediaUrl(
  artworkId: EnquiryListItem["artworkId"],
): string | undefined {
  if (typeof artworkId === "object" && artworkId?.mediaUrl) {
    return artworkId.mediaUrl;
  }
  return undefined;
}

export function getCustomerName(
  customerId: EnquiryListItem["customerId"],
): string {
  if (typeof customerId === "object" && customerId?.fullName) {
    return customerId.fullName;
  }
  return "Collector";
}

export interface ListEnquiriesParams {
  page?: number;
  limit?: number;
  status?: EnquiryStatus;
}

export async function listEnquiries(
  params: ListEnquiriesParams = {},
): Promise<ApiResponse<EnquiryListResponse>> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.status) query.set("status", params.status);

  const qs = query.toString();
  const url = `${API_ENDPOINTS.ENQUIRIES.LIST}${qs ? `?${qs}` : ""}`;
  const res = await authedFetch<unknown>(url, { method: "GET" });

  if (!res.ok) return res as ApiResponse<EnquiryListResponse>;

  return {
    ...res,
    data: unwrapData<EnquiryListResponse>(res.data),
  };
}

export async function findEnquiryByArtworkId(
  artworkId: string,
): Promise<EnquiryListItem | null> {
  const res = await listEnquiries({ limit: 50 });
  if (!res.ok) return null;

  return (
    res.data.enquiries.find((enquiry) => {
      const id =
        typeof enquiry.artworkId === "object"
          ? enquiry.artworkId._id
          : enquiry.artworkId;
      return id === artworkId;
    }) ?? null
  );
}

export async function getEnquiry(
  enquiryId: string,
): Promise<ApiResponse<{ enquiry: EnquiryDetail }>> {
  const res = await authedFetch<unknown>(
    API_ENDPOINTS.ENQUIRIES.DETAIL(enquiryId),
    { method: "GET" },
  );

  if (!res.ok) return res as ApiResponse<{ enquiry: EnquiryDetail }>;

  return {
    ...res,
    data: unwrapData<{ enquiry: EnquiryDetail }>(res.data),
  };
}

export interface CreateEnquiryInput {
  artworkId: string;
  message: string;
  attachments?: string[];
}

export async function createEnquiry(
  input: CreateEnquiryInput,
): Promise<ApiResponse<{ enquiry: EnquiryDetail }>> {
  const res = await authedFetch<unknown>(API_ENDPOINTS.ENQUIRIES.CREATE, {
    method: "POST",
    body: JSON.stringify(input),
  });

  if (!res.ok) return res as ApiResponse<{ enquiry: EnquiryDetail }>;

  return {
    ...res,
    data: unwrapData<{ enquiry: EnquiryDetail }>(res.data),
  };
}

export async function sendEnquiryMessage(
  enquiryId: string,
  body: string,
  attachments?: string[],
): Promise<ApiResponse<{ message: EnquiryMessage }>> {
  const res = await authedFetch<unknown>(
    API_ENDPOINTS.ENQUIRIES.MESSAGES(enquiryId),
    {
      method: "POST",
      body: JSON.stringify({ body, attachments }),
    },
  );

  if (!res.ok) return res as ApiResponse<{ message: EnquiryMessage }>;

  return {
    ...res,
    data: unwrapData<{ message: EnquiryMessage }>(res.data),
  };
}

export async function markEnquiryRead(
  enquiryId: string,
): Promise<ApiResponse<unknown>> {
  return authedFetch(API_ENDPOINTS.ENQUIRIES.READ(enquiryId), {
    method: "PATCH",
  });
}

export function getEnquiryErrorCode(data: unknown): string | undefined {
  if (data && typeof data === "object" && "code" in data) {
    const code = (data as { code?: unknown }).code;
    return typeof code === "string" ? code : undefined;
  }
  return undefined;
}

export interface AdminListEnquiriesParams extends ListEnquiriesParams {
  galleryId?: string;
  assignedTo?: string;
  unassigned?: boolean;
}

export async function listAdminEnquiries(
  params: AdminListEnquiriesParams = {},
): Promise<ApiResponse<EnquiryListResponse>> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.status) query.set("status", params.status);
  if (params.galleryId) query.set("galleryId", params.galleryId);
  if (params.assignedTo) query.set("assignedTo", params.assignedTo);
  if (params.unassigned) query.set("unassigned", "true");

  const qs = query.toString();
  const url = `${API_ENDPOINTS.ADMIN_ENQUIRIES.LIST}${qs ? `?${qs}` : ""}`;
  const res = await authedFetch<unknown>(url, { method: "GET" });

  if (!res.ok) return res as ApiResponse<EnquiryListResponse>;

  return {
    ...res,
    data: unwrapData<EnquiryListResponse>(res.data),
  };
}

export async function getAdminEnquiry(
  enquiryId: string,
): Promise<ApiResponse<{ enquiry: EnquiryDetail }>> {
  const res = await authedFetch<unknown>(
    API_ENDPOINTS.ADMIN_ENQUIRIES.DETAIL(enquiryId),
    { method: "GET" },
  );

  if (!res.ok) return res as ApiResponse<{ enquiry: EnquiryDetail }>;

  return {
    ...res,
    data: unwrapData<{ enquiry: EnquiryDetail }>(res.data),
  };
}

export async function sendAdminEnquiryMessage(
  enquiryId: string,
  body: string,
  attachments?: string[],
): Promise<ApiResponse<{ message: EnquiryMessage }>> {
  const res = await authedFetch<unknown>(
    API_ENDPOINTS.ADMIN_ENQUIRIES.MESSAGES(enquiryId),
    {
      method: "POST",
      body: JSON.stringify({ body, attachments }),
    },
  );

  if (!res.ok) return res as ApiResponse<{ message: EnquiryMessage }>;

  return {
    ...res,
    data: unwrapData<{ message: EnquiryMessage }>(res.data),
  };
}

export async function assignEnquiryToMe(
  enquiryId: string,
): Promise<ApiResponse<{ enquiry: EnquiryDetail }>> {
  const res = await authedFetch<unknown>(
    API_ENDPOINTS.ADMIN_ENQUIRIES.ASSIGN_ME(enquiryId),
    { method: "PATCH" },
  );

  if (!res.ok) return res as ApiResponse<{ enquiry: EnquiryDetail }>;

  return {
    ...res,
    data: unwrapData<{ enquiry: EnquiryDetail }>(res.data),
  };
}

export async function updateAdminEnquiryStatus(
  enquiryId: string,
  status: EnquiryStatus,
): Promise<ApiResponse<{ enquiry: EnquiryDetail }>> {
  const res = await authedFetch<unknown>(
    API_ENDPOINTS.ADMIN_ENQUIRIES.STATUS(enquiryId),
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );

  if (!res.ok) return res as ApiResponse<{ enquiry: EnquiryDetail }>;

  return {
    ...res,
    data: unwrapData<{ enquiry: EnquiryDetail }>(res.data),
  };
}

export async function markAdminEnquiryRead(
  enquiryId: string,
): Promise<ApiResponse<unknown>> {
  return authedFetch(API_ENDPOINTS.ADMIN_ENQUIRIES.READ(enquiryId), {
    method: "PATCH",
  });
}

export function isUserAssignedToEnquiry(
  enquiry: EnquiryDetail,
  userId?: string,
): boolean {
  if (!userId) return false;
  return enquiry.assignedAdmins.some(
    (adminId) => normalizeEnquiryId(adminId) === normalizeEnquiryId(userId),
  );
}

export function normalizeEnquiryId(id: unknown): string {
  if (typeof id === "string") return id;
  if (id && typeof id === "object" && "_id" in id) {
    return String((id as { _id: unknown })._id);
  }
  return String(id ?? "");
}

export function getGalleryOwnerName(
  galleryOwnerId: EnquiryListItem["galleryOwnerId"] | EnquiryUserRef,
): string {
  if (typeof galleryOwnerId === "object" && galleryOwnerId?.fullName) {
    return galleryOwnerId.fullName;
  }
  return "Gallery owner";
}
