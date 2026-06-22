export type EnquiryStatus = "open" | "in_progress" | "closed";
export type EnquiryMessageSenderRole = "customer" | "gallery_owner" | "admin";

export interface EnquiryUserRef {
  _id: string;
  fullName: string;
  profilePicture?: string;
  email?: string;
}

export interface EnquiryArtworkRef {
  _id: string;
  title: string;
  description?: string;
}

export interface EnquiryMessage {
  _id: string;
  senderId: string;
  senderRole: EnquiryMessageSenderRole;
  senderName: string;
  body: string;
  attachments: string[];
  createdAt: string;
}

export interface EnquiryListItem {
  _id: string;
  enquiryNumber: string;
  artworkId: EnquiryArtworkRef | string;
  galleryId: string;
  customerId: EnquiryUserRef | string;
  galleryOwnerId: EnquiryUserRef | string;
  assignedAdmins: string[];
  status: EnquiryStatus;
  unreadForCustomer: boolean;
  unreadForGallery: boolean;
  unreadForAdmin: boolean;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnquiryDetail extends EnquiryListItem {
  participants: {
    userId: EnquiryUserRef | string;
    role: EnquiryMessageSenderRole;
    joinedAt: string;
  }[];
  messages: EnquiryMessage[];
}

export interface EnquiryPagination {
  currentPage: number;
  totalPages: number;
  total: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface EnquiryListResponse {
  enquiries: EnquiryListItem[];
  pagination: EnquiryPagination;
}
