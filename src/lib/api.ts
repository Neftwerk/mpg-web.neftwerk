// Neftwerk API Configuration

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL;

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    VERIFY_EMAIL: `${API_BASE_URL}/api/auth/verify-email`,
    LOGIN_OTP_REQUEST: `${API_BASE_URL}/api/auth/login/otp`,
    LOGIN_OTP_VERIFY: `${API_BASE_URL}/api/auth/login/otp/verify`,
    GOOGLE_OAUTH: `${API_BASE_URL}/api/auth/google`,
    GOOGLE_CALLBACK: `${API_BASE_URL}/api/auth/google/callback`,
    REFRESH_TOKEN: `${API_BASE_URL}/api/auth/refresh`,
    PROFILE: `${API_BASE_URL}/api/auth/profile`,
    ME: `${API_BASE_URL}/api/auth/me`,
    CHANGE_PASSWORD: `${API_BASE_URL}/api/auth/change-password`,
    FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
    LOGOUT_ALL: `${API_BASE_URL}/api/auth/logout-all`,
    DEACTIVATE: `${API_BASE_URL}/api/auth/deactivate-self`,
    DELETE_ACCOUNT: `${API_BASE_URL}/api/auth/delete-self`,
  },

  FORUM: {
    /** GET  /api/forum/posts?page=&limit=&tags=&search=&isPinned=&sortBy=&sortOrder= */
    LIST_POSTS: `${API_BASE_URL}/api/forum/posts`,
    /** POST /api/forum/admin/posts */
    ADMIN_CREATE_POST: `${API_BASE_URL}/api/forum/admin/posts`,
    /** GET  /api/forum/admin/posts/:id */
    ADMIN_POST: (id: string) => `${API_BASE_URL}/api/forum/admin/posts/${id}`,
    /** PUT  /api/forum/admin/posts/:id */
    ADMIN_UPDATE_POST: (id: string) => `${API_BASE_URL}/api/forum/admin/posts/${id}`,
    /** DELETE /api/forum/admin/posts/:id */
    ADMIN_DELETE_POST: (id: string) => `${API_BASE_URL}/api/forum/admin/posts/${id}`,
    /** GET  /api/forum/posts/:slug */
    POST_BY_SLUG: (slug: string) => `${API_BASE_URL}/api/forum/posts/${slug}`,
    /** GET  /api/forum/posts/:postId/comments?page=&limit=&parentId=&flat= */
    POST_COMMENTS: (postId: string) => `${API_BASE_URL}/api/forum/posts/${postId}/comments`,
    /** POST /api/forum/posts/:postId/comments  { body, parentId? } */
    ADD_COMMENT: (postId: string) => `${API_BASE_URL}/api/forum/posts/${postId}/comments`,
    /** PUT  /api/forum/comments/:commentId  { body } */
    EDIT_COMMENT: (commentId: string) => `${API_BASE_URL}/api/forum/comments/${commentId}`,
    /** DELETE /api/forum/comments/:commentId */
    DELETE_COMMENT: (commentId: string) => `${API_BASE_URL}/api/forum/comments/${commentId}`,
    /** POST /api/forum/posts/:postId/react  { reaction: "like"|"dislike" } */
    REACT_POST: (postId: string) => `${API_BASE_URL}/api/forum/posts/${postId}/react`,
    /** POST /api/forum/comments/:commentId/react  { reaction: "like"|"dislike" } */
    REACT_COMMENT: (commentId: string) => `${API_BASE_URL}/api/forum/comments/${commentId}/react`,
    /** POST /api/forum/comments/:commentId/report  { reason } */
    REPORT_COMMENT: (commentId: string) => `${API_BASE_URL}/api/forum/comments/${commentId}/report`,
  },

  ENQUIRIES: {
    /** POST /api/enquiries  { artworkId, message, attachments? } */
    CREATE: `${API_BASE_URL}/api/enquiries`,
    /** GET /api/enquiries?page=&limit=&status= */
    LIST: `${API_BASE_URL}/api/enquiries`,
    /** GET /api/enquiries/:enquiryId */
    DETAIL: (enquiryId: string) => `${API_BASE_URL}/api/enquiries/${enquiryId}`,
    /** POST /api/enquiries/:enquiryId/messages  { body, attachments? } */
    MESSAGES: (enquiryId: string) => `${API_BASE_URL}/api/enquiries/${enquiryId}/messages`,
    /** PATCH /api/enquiries/:enquiryId/read */
    READ: (enquiryId: string) => `${API_BASE_URL}/api/enquiries/${enquiryId}/read`,
  },

  ADMIN_ENQUIRIES: {
    /** GET /api/admin/enquiries?page=&limit=&status=&unassigned= */
    LIST: `${API_BASE_URL}/api/admin/enquiries`,
    /** GET /api/admin/enquiries/:enquiryId */
    DETAIL: (enquiryId: string) =>
      `${API_BASE_URL}/api/admin/enquiries/${enquiryId}`,
    /** POST /api/admin/enquiries/:enquiryId/messages */
    MESSAGES: (enquiryId: string) =>
      `${API_BASE_URL}/api/admin/enquiries/${enquiryId}/messages`,
    /** PATCH /api/admin/enquiries/:enquiryId/assign/me */
    ASSIGN_ME: (enquiryId: string) =>
      `${API_BASE_URL}/api/admin/enquiries/${enquiryId}/assign/me`,
    /** PATCH /api/admin/enquiries/:enquiryId/assign */
    ASSIGN: (enquiryId: string) =>
      `${API_BASE_URL}/api/admin/enquiries/${enquiryId}/assign`,
    /** PATCH /api/admin/enquiries/:enquiryId/status */
    STATUS: (enquiryId: string) =>
      `${API_BASE_URL}/api/admin/enquiries/${enquiryId}/status`,
    /** PATCH /api/admin/enquiries/:enquiryId/read */
    READ: (enquiryId: string) =>
      `${API_BASE_URL}/api/admin/enquiries/${enquiryId}/read`,
  },

  ADMIN_GALLERIES: {
    /** GET /api/admin/galleries/:galleryId */
    DETAIL: (galleryId: string) => `${API_BASE_URL}/api/admin/galleries/${galleryId}`,
    /** PATCH /api/admin/galleries/:galleryId */
    UPDATE: (galleryId: string) => `${API_BASE_URL}/api/admin/galleries/${galleryId}`,
    /** GET /api/admin/galleries/:galleryId/artworks?status=&collectionId=&artistId=&search= */
    ARTWORKS: (galleryId: string) =>
      `${API_BASE_URL}/api/admin/galleries/${galleryId}/artworks`,
  },

  NOTIFICATIONS: {
    /** GET    /api/notifications?page=&limit=&unreadOnly= */
    LIST: `${API_BASE_URL}/api/notifications`,
    /** PATCH  /api/notifications/:id/read */
    READ: (id: string) => `${API_BASE_URL}/api/notifications/${id}/read`,
    /** PATCH  /api/notifications/read-all */
    READ_ALL: `${API_BASE_URL}/api/notifications/read-all`,
    /** DELETE /api/notifications/:id */
    DELETE: (id: string) => `${API_BASE_URL}/api/notifications/${id}`,
    /** DELETE /api/notifications */
    DELETE_ALL: `${API_BASE_URL}/api/notifications`,
  },

  PUBLIC: {
    /** GET /api/public/galleries?page=&limit= */
    GALLERIES: `${API_BASE_URL}/api/public/galleries`,
    /** GET /api/public/galleries/:galleryId */
    GALLERY: (galleryId: string) => `${API_BASE_URL}/api/public/galleries/${galleryId}`,
    /** GET /api/public/galleries/:galleryId/artworks?page=&limit= */
    GALLERY_ARTWORKS: (galleryId: string) =>
      `${API_BASE_URL}/api/public/galleries/${galleryId}/artworks`,
    /** GET /api/public/galleries/:galleryId/collections */
    GALLERY_COLLECTIONS: (galleryId: string) => `${API_BASE_URL}/api/public/galleries/${galleryId}/collections`,
    /** GET /api/public/collections/:collectionId */
    COLLECTION: (collectionId: string) => `${API_BASE_URL}/api/public/collections/${collectionId}`,
    /** GET /api/public/collections/:collectionId/artworks */
    COLLECTION_ARTWORKS: (collectionId: string) => `${API_BASE_URL}/api/public/collections/${collectionId}/artworks`,
    /** GET /api/public/artworks?page=&limit= */
    ARTWORKS: `${API_BASE_URL}/api/public/artworks`,
    /** GET /api/public/artworks/:artworkId */
    ARTWORK: (artworkId: string) => `${API_BASE_URL}/api/public/artworks/${artworkId}`,
  },

  PAYMENTS: {
    /** POST /api/payments/session */
    SESSION: `${API_BASE_URL}/api/payments/session`,
    /** POST /api/payments/checkout/link */
    CHECKOUT_LINK: `${API_BASE_URL}/api/payments/checkout/link`,
    /** POST /api/payments/bank-auth-link */
    BANK_AUTH_LINK: `${API_BASE_URL}/api/payments/bank-auth-link`,
    /** GET  /api/payments/customer */
    CUSTOMER: `${API_BASE_URL}/api/payments/customer`,
    /** GET  /api/payments/history */
    HISTORY: `${API_BASE_URL}/api/payments/history`,
  },

  SALES: {
    /** POST /api/sales/checkout */
    CHECKOUT: `${API_BASE_URL}/api/sales/checkout`,
    /** GET /api/sales/mine */
    MINE: `${API_BASE_URL}/api/sales/mine`,
    /** POST /api/sales/:saleId/mint-prep */
    MINT_PREP: (saleId: string) => `${API_BASE_URL}/api/sales/${saleId}/mint-prep`,
    /** POST /api/sales/:saleId/mint-submit */
    MINT_SUBMIT: (saleId: string) => `${API_BASE_URL}/api/sales/${saleId}/mint-submit`,
  },

  CHAIN: {
    /** GET /api/chain/config */
    CONFIG: `${API_BASE_URL}/api/chain/config`,
  },

  WALLET: {
    /** POST /api/wallet/socketfi/verify */
    SOCKETFI_VERIFY: `${API_BASE_URL}/api/wallet/socketfi/verify`,
  },

  STORAGE: {
    /** POST /api/storage/upload/image — multipart field: file */
    UPLOAD_IMAGE: `${API_BASE_URL}/api/storage/upload/image`,
    /** GET /api/storage/presign/:key */
    PRESIGN: (key: string) =>
      `${API_BASE_URL}/api/storage/presign/${key
        .split("/")
        .map(encodeURIComponent)
        .join("/")}`,
  },
};
